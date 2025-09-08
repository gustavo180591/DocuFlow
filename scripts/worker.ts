import { PrismaClient, JobStatus, JobType, type Job } from '@prisma/client';
import { setTimeout as sleep } from 'node:timers/promises';
import { processJob as processJobHandler } from '../src/lib/jobs/handlers';
import type { JobWithPayload } from '../src/lib/jobs/handlers';

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
  
  try {
    // Mark job as processing
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: startTime,
        attempts: { increment: 1 },
        lastError: null,
        metrics: {
          update: {
            status: 'PROCESSING',
            startedAt: startTime.toISOString(),
            retryCount: (job.attempts || 0) + 1
          }
        }
      }
    });

    // Process the job using the handler
    await processJobHandler({
      ...job,
      payload: job.payload,
      metrics: { status: 'PROCESSING' },
      updatedAt: new Date()
    } as JobWithPayload);

    // Mark job as completed
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.DONE,
        finishedAt: new Date(),
        metrics: {
          update: {
            status: 'DONE',
            finishedAt: new Date().toISOString(),
            durationMs: new Date().getTime() - startTime.getTime()
          }
        }
      }
    });

    console.log(`Job ${job.id} (${job.type}) completed successfully`);
  } catch (error) {
    console.error(`Error processing job ${job.id} (${job.type}):`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const nextAttempt = (job.attempts || 0) + 1;
    const shouldRetry = nextAttempt < MAX_ATTEMPTS;
    
    // Update job with error and retry info
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: JobStatus.ERROR,
        lastError: errorMessage,
        scheduledAt: shouldRetry 
          ? new Date(Date.now() + getRetryDelay(nextAttempt))
          : undefined,
        metrics: {
          update: {
            status: 'ERROR',
            error: errorMessage,
            finishedAt: new Date().toISOString(),
            durationMs: new Date().getTime() - startTime.getTime(),
            retryCount: nextAttempt
          }
        }
      }
    });
    
    if (shouldRetry) {
      console.log(`Scheduled retry ${nextAttempt}/${MAX_ATTEMPTS} for job ${job.id} in ${getRetryDelay(nextAttempt)}ms`);
    } else {
      console.error(`Job ${job.id} failed after ${MAX_ATTEMPTS} attempts`);
    }
    
    throw error; // Re-throw to be caught by the worker loop
  }
}

// Get next job from the queue with SKIP LOCKED
async function getNextJob(): Promise<(Job & { payload: any }) | null> {
  return await prisma.$transaction(async (tx) => {
    const job = await tx.job.findFirst({
      where: {
        status: JobStatus.QUEUED,
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      // skipLocked is handled by the transaction options
    });
    
    if (!job) return null;
    
    // Mark job as processing
    await tx.job.update({
      where: { id: job.id },
      data: { status: JobStatus.PROCESSING }
    });
    
    return job;
  }, {
    isolationLevel: 'ReadCommitted',
    maxWait: 5000,
    timeout: 10000
  });
}

// Process jobs with concurrency control
async function processJobs() {
  while (!process.shuttingDown) {
    try {
      // Check if we can process more jobs
      if (activeJobs.size >= CONCURRENCY) {
        await sleep(100);
        continue;
      }
      
      // Get next job
      const job = await getNextJob();
      if (!job) {
        await sleep(POLL_INTERVAL);
        continue;
      }
      
      // Process job in background
      activeJobs.add(job.id);
      processJob(job)
        .catch(console.error)
        .finally(() => activeJobs.delete(job.id));
      
    } catch (error) {
      console.error('Error in worker loop:', error);
      await sleep(1000); // Prevent tight loop on errors
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
  
  console.log('Shutting down worker gracefully...');
  
  // Wait for active jobs to complete
  const startTime = Date.now();
  const MAX_SHUTDOWN_TIME = 30000; // 30 seconds
  
  while (activeJobs.size > 0 && (Date.now() - startTime) < MAX_SHUTDOWN_TIME) {
    console.log(`Waiting for ${activeJobs.size} active jobs to complete...`);
    await sleep(1000);
  }
  
  if (activeJobs.size > 0) {
    console.warn(`Forcefully shutting down with ${activeJobs.size} active jobs`);
  }
  
  await prisma.$disconnect();
  process.exit(0);
}

// Handle signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the worker
console.log('Starting worker with concurrency:', CONCURRENCY);
processJobs().catch(console.error);
