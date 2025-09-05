import { Job, JobType, JobStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { 
  OcrPayload, 
  ParsingPayload, 
  ValidationPayload, 
  ExportPayload, 
  JobWithPayload,
  isOcrPayload,
  isParsingPayload,
  isValidationPayload,
  isExportPayload,
  JobMetrics
} from './types';

const prisma = new PrismaClient();

// Helper to update job metrics
async function updateJobMetrics(jobId: string, metrics: Partial<JobMetrics>): Promise<void> {
  const updateData = {
    metrics: {
      ...metrics,
      durationMs: metrics.startedAt && metrics.finishedAt 
        ? new Date(metrics.finishedAt).getTime() - new Date(metrics.startedAt).getTime()
        : undefined
    }
  };

  await prisma.job.update({
    where: { id: jobId },
    data: updateData
  });
}

// Process OCR job
export async function processOCR(job: JobWithPayload): Promise<void> {
  if (!isOcrPayload(job.payload)) {
    throw new Error('Invalid OCR payload');
  }

  const { documentId, filePath, sha256 } = job.payload;
  const startedAt = new Date().toISOString();
  
  try {
    // Mark job as processing
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: new Date(startedAt)
      }
    });

    // TODO: Implement actual OCR processing
    // const ocrResult = await ocrService.processDocument(filePath || `${process.env.UPLOAD_DIR}/${sha256}`);
    const ocrResult = {
      text: 'Sample extracted text',
      pages: 1
    };

    // Update job with result
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.DONE,
        result: ocrResult,
        finishedAt: new Date()
      }
    });

    // Queue next step: PARSING if not already queued
    const existingParsingJob = await prisma.job.findFirst({
      where: { 
        type: JobType.PARSING,
        documentId,
        status: { in: [JobStatus.QUEUED, JobStatus.PROCESSING] }
      }
    });
    
    if (!existingParsingJob) {
      await prisma.job.create({
        data: {
          type: JobType.PARSING,
          payload: { documentId, sha256 },
          documentId
        }
      });
    }

    // Update metrics
    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'OK',
      pagesProcessed: ocrResult.pages
    });

  } catch (error: any) {
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.ERROR,
        result: { error: error.message },
        finishedAt: new Date()
      }
    });

    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'ERROR',
      error: error.message
    });

    throw error;
  }
}

// Process PARSING job
export async function processPARSING(job: JobWithPayload): Promise<void> {
  if (!isParsingPayload(job.payload)) {
    throw new Error('Invalid PARSING payload');
  }

  const { documentId } = job.payload;
  const startedAt = new Date().toISOString();
  
  try {
    // Mark job as processing
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: new Date(startedAt)
      }
    });

    // TODO: Implement actual parsing logic
    const parsingResult = {
      fields: 5,
      entities: {
        amount: { value: '100.00', confidence: 0.95 },
        date: { value: '2025-09-05', confidence: 0.98 }
      }
    };

    // Update job with result
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.DONE,
        result: parsingResult,
        finishedAt: new Date()
      }
    });

    // Queue next step: VALIDATION if not already queued
    const existingValidationJob = await prisma.job.findFirst({
      where: { 
        type: JobType.VALIDATION,
        documentId,
        status: { in: [JobStatus.QUEUED, JobStatus.PROCESSING] }
      }
    });
    
    if (!existingValidationJob) {
      await prisma.job.create({
        data: {
          type: JobType.VALIDATION,
          payload: { documentId },
          documentId
        }
      });
    }

    // Update metrics
    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'OK',
      fieldsProcessed: parsingResult.fields
    });

  } catch (error: any) {
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.ERROR,
        result: { error: error.message },
        finishedAt: new Date()
      }
    });

    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'ERROR',
      error: error.message
    });

    throw error;
  }
}

// Process VALIDATION job
export async function processVALIDATION(job: JobWithPayload): Promise<void> {
  if (!isValidationPayload(job.payload)) {
    throw new Error('Invalid VALIDATION payload');
  }

  const { documentId } = job.payload;
  const startedAt = new Date().toISOString();
  
  try {
    // Mark job as processing
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: new Date(startedAt)
      }
    });

    // TODO: Implement actual validation logic
    const validationResult = {
      isValid: true,
      warnings: [],
      errors: []
    };

    // Update job with result
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.DONE,
        result: validationResult,
        finishedAt: new Date()
      }
    });

    // Queue next step: EXPORT if not already queued
    const existingExportJob = await prisma.job.findFirst({
      where: { 
        type: JobType.EXPORT,
        documentId,
        status: { in: [JobStatus.QUEUED, JobStatus.PROCESSING] }
      }
    });
    
    if (!existingExportJob) {
      await prisma.job.create({
        data: {
          type: JobType.EXPORT,
          payload: { 
            documentId,
            format: 'PDF' // Default format
          },
          documentId
        }
      });
    }

    // Update metrics
    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: validationResult.isValid ? 'OK' : 'WARN',
      validationErrors: validationResult.errors.length,
      validationWarnings: validationResult.warnings.length
    });

  } catch (error: any) {
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.ERROR,
        result: { error: error.message },
        finishedAt: new Date()
      }
    });

    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'ERROR',
      error: error.message
    });

    throw error;
  }
}

// Process EXPORT job
export async function processEXPORT(job: JobWithPayload): Promise<void> {
  if (!isExportPayload(job.payload)) {
    throw new Error('Invalid EXPORT payload');
  }

  const { documentId, format = 'PDF' } = job.payload;
  const startedAt = new Date().toISOString();
  
  try {
    // Mark job as processing
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.PROCESSING,
        startedAt: new Date(startedAt)
      }
    });

    // TODO: Implement actual export logic
    const exportResult = {
      format,
      filePath: `/exports/${documentId}.${format.toLowerCase()}`,
      size: 1024 // Example size in bytes
    };

    // Update job with result
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.DONE,
        result: exportResult,
        finishedAt: new Date()
      }
    });

    // Update metrics
    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'OK',
      exportFormat: format,
      fileSize: exportResult.size
    });

  } catch (error: any) {
    await prisma.job.update({
      where: { id: job.id },
      data: { 
        status: JobStatus.ERROR,
        result: { error: error.message },
        finishedAt: new Date()
      }
    });

    await updateJobMetrics(job.id, {
      startedAt,
      finishedAt: new Date().toISOString(),
      status: 'ERROR',
      error: error.message
    });

    throw error;
  }
}

// Helper to update job metrics
async function updateJobMetrics(jobId: string, metrics: Partial<JobMetrics>) {
  const now = new Date().toISOString();
  return prisma.job.update({
    where: { id: jobId },
    data: { 
      metrics: {
        ...metrics,
        durationMs: metrics.startedAt && metrics.finishedAt 
          ? new Date(metrics.finishedAt).getTime() - new Date(metrics.startedAt).getTime()
          : undefined
      }
    }
  });
}

// Extended Job type that includes our payload
export interface JobWithPayload extends Omit<Job, 'result' | 'error' | 'type' | 'documentId'> {
  type: JobType;
  payload: Record<string, unknown>;
  result?: Record<string, unknown> | null;
  error?: string | null;
  documentId: string | null; // Override to allow null
}

// Type guards
type UnknownRecord = Record<string, unknown>;

export function isOcrPayload(payload: unknown): payload is OcrPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as UnknownRecord;
  return typeof p.sha256 === 'string' && 
         typeof p.documentId === 'string';
}

export function isParsingPayload(payload: unknown): payload is ParsingPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as UnknownRecord;
  return typeof p.documentId === 'string' &&
         (p.sha256 === undefined || typeof p.sha256 === 'string');
}

export function isValidationPayload(payload: unknown): payload is ValidationPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as UnknownRecord;
  return typeof p.documentId === 'string' &&
         (p.kind === undefined || 
          (typeof p.kind === 'string' && 
           ['BANK_RECEIPT', 'CONTRIB_LIST'].includes(p.kind)));
}

export function isExportPayload(payload: unknown): payload is ExportPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as UnknownRecord;
  return typeof p.documentId === 'string' &&
         (p.format === undefined || 
          (typeof p.format === 'string' && 
           ['PDF', 'CSV'].includes(p.format)));
}

// Helper to update job metrics
async function updateJobMetrics(jobId: string, metrics: Partial<JobMetrics> & { status?: JobStatus }) {
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return;

    const currentMetrics = (job.metrics || {}) as JobMetrics;
    const updatedMetrics = { ...currentMetrics, ...metrics } as JobMetrics;

    // Calculate duration if both start and end times are present
    if (updatedMetrics.startedAt && updatedMetrics.completedAt) {
      const start = new Date(updatedMetrics.startedAt).getTime();
      const end = new Date(updatedMetrics.completedAt).getTime();
      updatedMetrics.durationMs = end - start;
    }

    // Update the job with new metrics and status if provided
    await prisma.job.update({
      where: { id: jobId },
      data: { 
        metrics: updatedMetrics as any, // We need to cast to any due to Prisma's JsonValue type
        ...(metrics.status && { status: metrics.status })
      }
    });
  } catch (error) {
    console.error('Failed to update job metrics:', error);
  }
}

const ocrService = OcrService.getInstance();

export async function processOCR(job: JobWithPayload) {
  const startTime = Date.now();
  
  if (!isOcrPayload(job.payload)) {
    throw new Error('Invalid OCR job payload');
  }
  
  const { sha256, filePath, documentId } = job.payload as OcrPayload;
  
  try {
    await updateJobMetrics(job.id, { 
      startedAt: new Date(startTime).toISOString(),
      status: JobStatus.PROCESSING,
      pagesProcessed: 0
    });

    // Find the document
    const doc = documentId 
      ? await prisma.document.findUnique({ where: { id: documentId } })
      : await prisma.document.findFirst({ 
          where: { 
            metadata: {
              path: ['sha256'],
              equals: sha256
            }
          }
        });

    if (!doc) {
      throw new Error(`Document not found for sha256: ${sha256}`);
    }

    const resolvedFilePath = filePath ?? `${process.env.UPLOAD_DIR ?? './uploads'}/${sha256}.pdf`;
    const ocrText = await ocrService.extractText(resolvedFilePath);
    const text = typeof ocrText === 'string' ? ocrText : '';
    const pages = 1; // Default to 1 page if not provided

    // Store the extracted text in the database
    await prisma.$transaction([
      prisma.extraction.upsert({
        where: { documentId_fieldName: { documentId: doc.id, fieldName: 'full_text' } },
        update: { fieldValue: text, source: 'OCR', confidence: 1.0 },
        create: {
          documentId: doc.id,
          fieldName: 'full_text',
          fieldValue: text,
          source: 'OCR',
          confidence: 1.0,
        },
      }),
      prisma.job.update({
        where: { id: job.id },
        data: { documentId: doc.id }
      })
    ]);

    // Update metrics
    await updateJobMetrics(job.id, {
      pagesProcessed: pages,
      status: JobStatus.COMPLETED,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    });

    // Enqueue next step (parsing)
    await enqueueJob({
      type: JobType.PARSING,
      payload: { documentId: doc.id, sha256 },
      documentId: doc.id,
      priority: 5
    });

    return { success: true, pages };
  } catch (error) {
    await updateJobMetrics(job.id, {
      status: JobStatus.FAILED,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    });
    throw error;
  }
}

export async function processPARSING(job: JobWithPayload) {
  const startTime = Date.now();
  
  if (!isParsingPayload(job.payload)) {
    throw new Error('Invalid PARSING job payload');
  }
  
  const { documentId } = job.payload;
  
  try {
    await updateJobMetrics(job.id, { 
      startedAt: new Date(startTime).toISOString(),
      status: JobStatus.PROCESSING
    });

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { extractions: true }
    });
    
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    // Default to BANK_RECEIPT if we can't determine the type
    let kind: 'BANK_RECEIPT' | 'CONTRIB_LIST' = 'BANK_RECEIPT';
    
    // Simple heuristic: if the filename contains 'contrib', it's a contribution list
    if (doc.originalName.toLowerCase().includes('contrib')) {
      kind = 'CONTRIB_LIST';
    }

    // Check if job is already queued or processing
    const existingJob = await prisma.job.findFirst({
      where: {
        documentId: documentId,
        type: JobType.VALIDATION,
        status: {
          in: [JobStatus.PENDING, JobStatus.PROCESSING]
        },
        id: { not: job.id }
      }
    });

    if (!existingJob) {
      await enqueueJob({
        type: JobType.VALIDATION,
        payload: { documentId, kind },
        documentId,
        priority: 5
      });
    }

    // Update job status to processing
    await updateJobMetrics(job.id, {
      status: JobStatus.PROCESSING,
      startedAt: new Date().toISOString(),
      pagesProcessed: 0
    });

    await updateJobMetrics(job.id, {
      status: JobStatus.COMPLETED,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      documentType: kind
    });

    return { success: true, kind };
  } catch (error) {
    await updateJobMetrics(job.id, {
      status: JobStatus.FAILED,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    });
    throw error;
  }
}

export async function processVALIDATION(job: JobWithPayload) {
  const startTime = Date.now();
  
  if (!isValidationPayload(job.payload)) {
    throw new Error('Invalid VALIDATION job payload');
  }
  
  const { documentId, kind } = job.payload;
  
  try {
    await updateJobMetrics(job.id, { 
      startedAt: new Date(startTime).toISOString(),
      status: JobStatus.PROCESSING
    });

    // Get the document with extractions
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { extractions: true }
    });
    
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    let result: Record<string, unknown> = { validated: true };

    if (kind === 'BANK_RECEIPT') {
      // In a real implementation, validate bank receipt data
      result = { ...result, type: 'bank_receipt', status: 'validated' };
      
      // Check if job is already queued or processing
      const existingJob = await prisma.job.findFirst({
        where: {
          documentId: documentId,
          type: JobType.EXPORT,
          status: {
            in: [JobStatus.PENDING, JobStatus.PROCESSING]
          },
          id: { not: job.id }
        }
      });

      if (!existingJob) {
        await enqueueJob({
          type: JobType.EXPORT,
          payload: { documentId, format: 'PDF' },
          documentId,
          priority: 5
        });
      }
    } else if (kind === 'CONTRIB_LIST') {
      // Handle contribution list validation
      result = { ...result, type: 'contrib_list', status: 'validated' };
    }

    await updateJobMetrics(job.id, {
      status: JobStatus.COMPLETED,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      ...result
    });

    return result;
  } catch (error) {
    await updateJobMetrics(job.id, {
      status: JobStatus.FAILED,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    });
    throw error;
  }
}

export async function processEXPORT(job: JobWithPayload) {
  const startTime = Date.now();
  
  if (!isExportPayload(job.payload)) {
    throw new Error('Invalid EXPORT job payload');
  }
  
  const { documentId, format = 'PDF' } = job.payload as ExportPayload;
  
  try {
    await updateJobMetrics(job.id, { 
      startedAt: new Date(startTime).toISOString(),
      status: JobStatus.PROCESSING,
      exportFormat: format
    });

    // Get the document with all necessary data
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { 
        extractions: true,
        // Include other relations as needed
      }
    });
    
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Simulate export processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, generate the export file
    const exportPath = `${process.env.EXPORT_DIR ?? './exports'}/${documentId}.${format.toLowerCase()}`;
    // await generateExport(document, format, exportPath);
    
    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        processedAt: new Date(),
        metadata: {
          ...(document.metadata as Record<string, unknown> || {}),
          lastExport: new Date().toISOString(),
          exportFormat: format
        }
      },
    });

    const result = {
      success: true,
      exportPath,
      format,
      size: 0, // Add actual file size
      exportedAt: new Date().toISOString()
    };

    await updateJobMetrics(job.id, {
      status: JobStatus.COMPLETED,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      ...result
    });

    return result;
  } catch (error) {
    await updateJobMetrics(job.id, {
      status: JobStatus.FAILED,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    });
    throw error;
  }
}

// Helper function to enqueue jobs from within handlers
async function enqueueJob(opts: {
  type: JobType;
  payload: Record<string, unknown>;
  documentId?: string;
  priority?: number;
  scheduledAt?: Date;
  maxAttempts?: number;
}) {
  const { enqueueJob } = await import('./enqueue');
  return enqueueJob({
    type: opts.type,
    payload: opts.payload,
    documentId: opts.documentId,
    priority: opts.priority ?? 5,
    scheduledAt: opts.scheduledAt,
    maxAttempts: opts.maxAttempts
  });
}

// Export all job handlers for the worker
export const jobHandlers = {
  [JobType.OCR]: processOCR,
  [JobType.PARSING]: processPARSING,
  [JobType.VALIDATION]: processVALIDATION,
  [JobType.EXPORT]: processEXPORT,
} as const;
