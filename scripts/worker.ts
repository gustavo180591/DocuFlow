import { PrismaClient, JobStatus, JobType, Job } from '@prisma/client';
import { setTimeout as sleep } from 'node:timers/promises';
import { 
  processOCR, 
  processPARSING, 
  processVALIDATION, 
  processEXPORT,
  isOcrPayload,
  isParsingPayload,
  isValidationPayload,
  isExportPayload
} from '../src/lib/jobs/handlers';

const prisma = new PrismaClient();

// Configuration
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY ?? 2);
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS ?? 5000);
const MAX_ATTEMPTS = Number(process.env.JOB_MAX_ATTEMPTS ?? 3);
const BASE_RETRY_DELAY = 60000; // 1 minute

// Track active jobs
const activeJobs = new Set<string>();

// Calculate exponential backoff delay with jitter
function getRetryDelay(attempt: number): number {
  const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15 jitter
  return Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt - 1) * jitter, 86400000); // Max 1 day
}

// Process a single job
async function processJob(job: Job & { payload: any }) {
  const startTime = new Date();
  let result: any = { metrics: { startedAt: startTime.toISOString() } };
  let error = null;
  let nextJobType: JobType | null = null;
  let nextJobPayload: any = null;

  try {
    // Mark job as processing
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: startTime,
        attempts: { increment: 1 },
        lastError: null
      }
    });

    // Process based on job type
    switch (job.type) {
      case JobType.OCR:
        if (!isOcrPayload(job.payload)) {
          throw new Error(`Invalid payload for OCR job: ${JSON.stringify(job.payload)}`);
        }
        result = { ...result, ...(await processOCR(job)) };
        nextJobType = JobType.PARSING;
        nextJobPayload = { documentId: job.payload.documentId, sha256: job.payload.sha256 };
        break;

      case JobType.PARSING:
        if (!isParsingPayload(job.payload)) {
          throw new Error(`Invalid payload for PARSING job: ${JSON.stringify(job.payload)}`);
        }
        result = { ...result, ...(await processPARSING(job)) };
        nextJobType = JobType.VALIDATION;
        nextJobPayload = { documentId: job.payload.documentId };
        break;

      case JobType.VALIDATION:
        if (!isValidationPayload(job.payload)) {
          throw new Error(`Invalid payload for VALIDATION job: ${JSON.stringify(job.payload)}`);
        }
        result = { ...result, ...(await processVALIDATION(job)) };
        nextJobType = JobType.EXPORT;
        nextJobPayload = { documentId: job.payload.documentId, format: 'PDF' };
        break;

      case JobType.EXPORT:
        if (!isExportPayload(job.payload)) {
          throw new Error(`Invalid payload for EXPORT job: ${JSON.stringify(job.payload)}`);
        }
        result = { ...result, ...(await processEXPORT(job)) };
        break;

      default:
        throw new Error(`Unsupported job type: ${job.type}`);
    }

    // Calculate metrics
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startTime.getTime();
    
    // Enqueue next job in the pipeline if needed
    if (nextJobType) {
      const existingJob = await prisma.job.findFirst({
        where: { 
          type: nextJobType, 
          documentId: job.documentId,
          status: { in: [JobStatus.QUEUED, JobStatus.PROCESSING] } 
        }
      });

      if (!existingJob) {
        await prisma.job.create({
          data: {
            type: nextJobType,
            payload: nextJobPayload,
            documentId: job.documentId,
            priority: 5,
            maxAttempts: MAX_ATTEMPTS
          }
        });
      }
    }

    // Update job with result
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.DONE,
        result: {
          ...result,
          metrics: {
            ...result.metrics,
            completedAt: completedAt.toISOString(),
            durationMs
          }
        },
        finishedAt: completedAt,
        error: null
      }
    });

  } catch (err: any) {
    error = err;
    console.error(`Error processing job ${job.id}:`, err);
    
    const nextAttempt = (job.attempts || 0) + 1;
    const isFinalAttempt = nextAttempt >= (job.maxAttempts || MAX_ATTEMPTS);
    
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: isFinalAttempt ? JobStatus.ERROR : JobStatus.QUEUED,
        lastError: err.message,
        ...(!isFinalAttempt && {
          scheduledAt: new Date(Date.now() + getRetryDelay(nextAttempt))
        })
      }
    });
  } finally {
    activeJobs.delete(job.id);
  }

  return { result, error };
}

// Get next job from the queue with SKIP LOCKED
async function getNextJob(): Promise<(Job & { payload: any }) | null> {
  return await prisma.$transaction(async (tx) => {
    // Use raw query for SKIP LOCKED support
    const [job] = await tx.$queryRaw<Job[]>`
      SELECT * FROM "Job"
      WHERE status = 'QUEUED' 
      AND ("scheduledAt" IS NULL OR "scheduledAt" <= NOW())
      ORDER BY priority DESC, "createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `;

    if (!job) return null;

    // Update status to processing
    return await tx.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: new Date()
      }
    });
  });
}

// Process jobs with concurrency control
async function processJobs() {
  try {
    // Process jobs up to concurrency limit
    while (activeJobs.size < CONCURRENCY) {
      const job = await getNextJob();
      if (!job) break;

      activeJobs.add(job.id);
      processJob(job).catch(console.error);
    }
  } catch (err) {
    console.error('Error in worker loop:', err);
  } finally {
    // Schedule next poll if not shutting down
    if (!process.shuttingDown) {
      setTimeout(processJobs, POLL_INTERVAL);
    }
  }
}

// Track if we're shutting down
declare global {
  namespace NodeJS {
    interface Process {
      shuttingDown?: boolean;
    }
  }
}

// Handle graceful shutdown
async function shutdown() {
  if (process.shuttingDown) return;
  process.shuttingDown = true;
  
  console.log('Shutting down worker...');
  
  // Wait for active jobs to complete (with timeout)
  if (activeJobs.size > 0) {
    console.log(`Waiting for ${activeJobs.size} active jobs to complete...`);
    
    // Set a timeout to force exit if jobs take too long
    const forceShutdown = setTimeout(() => {
      console.warn('Force shutdown - jobs taking too long');
      process.exit(1);
    }, 30000); // 30 second timeout
    
    // Wait for active jobs to complete
    while (activeJobs.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    clearTimeout(forceShutdown);
  }
  
  // Close database connection
  await prisma.$disconnect();
  console.log('Worker shutdown complete');
  process.exit(0);
}

// Handle signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the worker
console.log(`Starting worker with concurrency: ${CONCURRENCY}`);
processJobs().catch(err => {
  console.error('Fatal error in worker:', err);
  process.exit(1);
});
