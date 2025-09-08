import { PrismaClient, JobType, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Define payload types
type OcrPayload = {
  documentId: string;
  sha256: string;
  filePath: string;
};

type ParsingPayload = {
  documentId: string;
  text: string;
  metadata?: Record<string, unknown>;
};

type ValidationPayload = {
  documentId: string;
  parsedData: Record<string, unknown>;
};

type ExportPayload = {
  documentId: string;
  format: 'PDF' | 'CSV' | 'JSON';
  data: Record<string, unknown>;
};

type JobMetrics = {
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  status?: JobStatus;
  retryCount?: number;
  error?: string;
  pagesProcessed?: number;
  exportFormat?: string;
};

// Extended Job type that includes our payload
export type JobWithPayload = {
  id: string;
  type: JobType;
  status: JobStatus;
  payload: OcrPayload | ParsingPayload | ValidationPayload | ExportPayload;
  result?: Record<string, unknown> | null;
  metrics?: JobMetrics;
  error?: string | null;
  documentId: string | null;
  priority: number;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Helper functions
const nowISO = () => new Date().toISOString();

async function updateJobMetrics(jobId: string, metrics: Partial<JobMetrics>): Promise<void> {
  await prisma.job.update({
    where: { id: jobId },
    data: { metrics: { ...metrics } }
  });
}

// Job handlers
export const jobHandlers = {
  async processOCR(job: JobWithPayload): Promise<void> {
    console.log(`Processing OCR for document ${(job.payload as OcrPayload).documentId}`);
    await updateJobMetrics(job.id, { status: 'PROCESSING', startedAt: nowISO() });
    
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        text: "Sample OCR text",
        pages: 1,
        metadata: {}
      };
      
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.DONE,
          result,
          metrics: {
            update: {
              finishedAt: nowISO(),
              status: 'DONE',
              durationMs: 1000
            }
          }
        }
      });
      
      console.log(`OCR completed for document ${(job.payload as OcrPayload).documentId}`);
    } catch (error) {
      console.error('OCR processing failed:', error);
      await updateJobMetrics(job.id, {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: nowISO()
      });
      throw error;
    }
  },

  async processPARSING(job: JobWithPayload): Promise<void> {
    console.log(`Processing parsing for document ${(job.payload as ParsingPayload).documentId}`);
    await updateJobMetrics(job.id, { status: 'PROCESSING', startedAt: nowISO() });
    
    try {
      // Simulate parsing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = {
        parsedData: {
          // Sample parsed data structure
          fields: {
            name: "John Doe",
            idNumber: "12345678",
            // ... other fields
          }
        },
        confidence: 0.95
      };
      
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.DONE,
          result,
          metrics: {
            update: {
              status: JobStatus.DONE,
              finishedAt: nowISO(),
              durationMs: 500
            }
          }
        }
      });
      
      console.log(`Parsing completed for document ${(job.payload as ParsingPayload).documentId}`);
    } catch (error) {
      console.error('Parsing failed:', error);
      await updateJobMetrics(job.id, {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: nowISO()
      });
      throw error;
    }
  },

  async processVALIDATION(job: JobWithPayload): Promise<void> {
    console.log(`Processing validation for document ${(job.payload as ValidationPayload).documentId}`);
    await updateJobMetrics(job.id, { status: 'PROCESSING', startedAt: nowISO() });
    
    try {
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = {
        isValid: true,
        validationErrors: [],
        validatedAt: new Date().toISOString()
      };
      
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.DONE,
          result,
          metrics: {
            update: {
              finishedAt: nowISO(),
              status: 'DONE',
              durationMs: 300
            }
          }
        }
      });
      
      console.log(`Validation completed for document ${(job.payload as ValidationPayload).documentId}`);
    } catch (error) {
      console.error('Validation failed:', error);
      await updateJobMetrics(job.id, {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: nowISO()
      });
      throw error;
    }
  },

  async processEXPORT(job: JobWithPayload): Promise<void> {
    console.log(`Processing export for document ${(job.payload as ExportPayload).documentId}`);
    await updateJobMetrics(job.id, { status: 'PROCESSING', startedAt: nowISO() });
    
    try {
      const { format, documentId } = job.payload as ExportPayload;
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = {
        format,
        documentId,
        url: `/exports/${documentId}.${format.toLowerCase()}`,
        exportedAt: new Date().toISOString()
      };
      
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: JobStatus.DONE,
          result,
          metrics: {
            update: {
              finishedAt: nowISO(),
              status: 'DONE',
              durationMs: 800,
              exportFormat: format
            }
          }
        }
      });
      
      console.log(`Export completed for document ${documentId} in ${format} format`);
    } catch (error) {
      console.error('Export failed:', error);
      await updateJobMetrics(job.id, {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: nowISO()
      });
      throw error;
    }
  }
};

export async function processJob(job: JobWithPayload): Promise<void> {
  const handler = {
    [JobType.OCR]: jobHandlers.processOCR,
    [JobType.PARSING]: jobHandlers.processPARSING,
    [JobType.VALIDATION]: jobHandlers.processVALIDATION,
    [JobType.EXPORT]: jobHandlers.processEXPORT
  }[job.type];

  if (!handler) {
    throw new Error(`No handler for job type: ${job.type}`);
  }

  await handler(job);
}
