// src/lib/jobs/handlers.ts
import { PrismaClient, Job, JobType, JobStatus, Prisma } from '@prisma/client';

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
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount?: number;
  error?: string;
  pagesProcessed?: number;
  exportFormat?: string;
};

// Extended Job type that includes our payload
type JobWithPayload = Omit<Job, 'payload' | 'result' | 'metrics' | 'error'> & {
  payload: OcrPayload | ParsingPayload | ValidationPayload | ExportPayload;
  result?: Record<string, unknown> | null;
  metrics?: JobMetrics;
  error?: string | null;
};

const prisma = new PrismaClient();

// Type guards
function isOcrPayload(payload: unknown): payload is OcrPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    'sha256' in payload &&
    'filePath' in payload
  );
}

function isParsingPayload(payload: unknown): payload is ParsingPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    'text' in payload
  );
}

function isValidationPayload(payload: unknown): payload is ValidationPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    'parsedData' in payload
  );
}

function isExportPayload(payload: unknown): payload is ExportPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    'format' in payload &&
    'data' in payload
  );
}

// Utility functions
function nowISO() { 
  return new Date().toISOString(); 
}

async function updateJobMetrics(jobId: string, metrics: Partial<JobMetrics>): Promise<void> {
  await prisma.job.update({
    where: { id: jobId },
    data: { 
      metrics: {
        ...(await prisma.job.findUnique({ where: { id: jobId } }))?.metrics as object || {},
        ...metrics
      }
    }
  });
}

// Job handlers
export const jobHandlers = {
  async processOCR(job: JobWithPayload): Promise<void> {
    if (!isOcrPayload(job.payload)) {
      throw new Error('Invalid OCR payload');
    }

    const { documentId, filePath } = job.payload;
    
    try {
      // Update job status to processing
      await updateJobMetrics(job.id, { 
        status: 'PROCESSING',
        startedAt: nowISO()
      });

      // Simulate OCR processing
      // In a real implementation, this would call an OCR service
      const ocrResult = {
        text: 'Sample extracted text',
        confidence: 0.95,
        pages: 1
      };

      // Update job with results
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          result: ocrResult as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          metrics: {
            status: 'COMPLETED',
            finishedAt: nowISO(),
            durationMs: 1000 // Simulated processing time
          }
        }
      });

      // Create a new parsing job
      await prisma.job.create({
        data: {
          type: 'PARSING',
          status: 'PENDING',
          payload: {
            documentId,
            text: ocrResult.text,
            metadata: { source: 'ocr' }
          } as ParsingPayload,
          priority: 1
        }
      });
    } catch (error) {
      await updateJobMetrics(job.id, { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: nowISO()
      });
      throw error;
    }
  },

  async processParsing(job: JobWithPayload): Promise<void> {
    if (!isParsingPayload(job.payload)) {
      throw new Error('Invalid Parsing payload');
    }

    const { documentId, text } = job.payload;
    
    try {
      await updateJobMetrics(job.id, { 
        status: 'PROCESSING',
        startedAt: nowISO()
      });

      // Simulate parsing logic
      const parsedData = {
        entities: [
          { type: 'PERSON', value: 'John Doe', confidence: 0.9 },
          { type: 'ORGANIZATION', value: 'ACME Corp', confidence: 0.85 }
        ],
        metadata: {
          language: 'en',
          wordCount: text.split(/\s+/).length
        }
      };

      // Update job with results
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          result: parsedData as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          metrics: {
            status: 'COMPLETED',
            finishedAt: nowISO(),
            durationMs: 500 // Simulated processing time
          }
        }
      });

      // Create a new validation job
      await prisma.job.create({
        data: {
          type: 'VALIDATION',
          status: 'PENDING',
          payload: {
            documentId,
            parsedData
          } as ValidationPayload,
          priority: 1
        }
      });
    } catch (error) {
      await updateJobMetrics(job.id, { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: nowISO()
      });
      throw error;
    }
  },

  async processValidation(job: JobWithPayload): Promise<void> {
    if (!isValidationPayload(job.payload)) {
      throw new Error('Invalid Validation payload');
    }

    const { documentId, parsedData } = job.payload;
    
    try {
      await updateJobMetrics(job.id, { 
        status: 'PROCESSING',
        startedAt: nowISO()
      });

      // Simulate validation logic
      const validationResult = {
        isValid: true,
        issues: [],
        validatedData: parsedData,
        timestamp: nowISO()
      };

      // Update job with results
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          result: validationResult as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          metrics: {
            status: 'COMPLETED',
            finishedAt: nowISO(),
            durationMs: 300 // Simulated processing time
          }
        }
      });

      // Create export jobs for different formats
      const formats: Array<'PDF' | 'CSV' | 'JSON'> = ['PDF', 'CSV', 'JSON'];
      await Promise.all(
        formats.map(format => 
          prisma.job.create({
            data: {
              type: 'EXPORT',
              status: 'PENDING',
              payload: {
                documentId,
                format,
                data: validationResult.validatedData
              } as ExportPayload,
              priority: 1
            }
          })
        )
      );
    } catch (error) {
      await updateJobMetrics(job.id, { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        finishedAt: nowISO()
      });
      throw error;
    }
  },

  async processExport(job: JobWithPayload): Promise<void> {
    if (!isExportPayload(job.payload)) {
      throw new Error('Invalid Export payload');
    }

    const { documentId, format, data } = job.payload;
    
    try {
      await updateJobMetrics(job.id, { 
        status: 'PROCESSING',
        startedAt: nowISO(),
        exportFormat: format
      });

      // Simulate export logic
      let exportResult: string;
      switch (format) {
        case 'PDF':
          exportResult = 'PDF_EXPORTED';
          break;
        case 'CSV':
          exportResult = 'CSV_EXPORTED';
          break;
        case 'JSON':
          exportResult = 'JSON_EXPORTED';
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Update job with results
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          result: { exportResult } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          metrics: {
            status: 'COMPLETED',
            finishedAt: nowISO(),
            durationMs: 200, // Simulated processing time
            exportFormat: format
          }
        }
      });
    } catch (error) {
      await updateJobMetrics(job.id, { 
        status: 'FAILED',
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
    [JobType.PARSING]: jobHandlers.processParsing,
    [JobType.VALIDATION]: jobHandlers.processValidation,
    [JobType.EXPORT]: jobHandlers.processExport
  }[job.type];

  if (!handler) {
    throw new Error(`No handler found for job type: ${job.type}`);
  }

  await handler(job);
}
  // Calcula durationMs si se proveen start/finish
  const durationMs =
    partial.startedAt && partial.finishedAt
      ? new Date(partial.finishedAt).getTime() - new Date(partial.startedAt).getTime()
      : partial.durationMs;

  await prisma.job.update({
    where: { id: jobId },
    data: { metrics: { ...(partial as any), durationMs } as any }
  });
}

async function setJobResult(jobId: string, result: Record<string, unknown>) {
  await prisma.job.update({ 
    where: { id: jobId }, 
    data: { 
      result: result as any // Type assertion to handle Prisma's JsonValue type
    } 
  });
}

async function enqueueNext(type: JobType, payload: Record<string, unknown>, documentId?: string, priority = 0) {
  await prisma.job.create({ 
    data: { 
      type, 
      payload: payload as any, // Type assertion to handle Prisma's JsonValue type
      documentId, 
      priority 
    } 
  });
}

/* ------------------------------ OCR ------------------------------ */
export async function processOCR(job: Job) {
  const startedAt = nowISO();
  const t0 = Date.now();

  const p = (job as JobWithPayload).payload;
  assert(isOcrPayload(p), 'OCR payload inválido');
  const { sha256, documentId } = p as OcrPayload;

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  assert(!!doc, `Documento no encontrado: ${documentId}`);

  // TODO: integrar con tu servicio real de OCR
  // const { text, pages } = await extractTextFromPdf(filePath ?? path.join(process.env.UPLOAD_DIR ?? '/data/uploads', `${sha256}.pdf`));
  const pages = 1; // demo

  // Guarda resultado mínimo útil
  await setJobResult(job.id, { pages });

  // Encolá PARSING
  await enqueueNext(JobType.PARSING, { documentId, sha256 }, documentId);

  await updateJobMetrics(job.id, {
    startedAt,
    finishedAt: nowISO(),
    durationMs: Date.now() - t0,
    status: 'OK'
  });
}

/* ------------------------------ PARSING ------------------------------ */
export async function processPARSING(job: Job) {
  const startedAt = nowISO();
  const t0 = Date.now();

  const p = (job as JobWithPayload).payload;
  assert(isParsingPayload(p), 'PARSING payload inválido');
  const { documentId, sha256 } = p as ParsingPayload;

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  assert(!!doc, `Documento no encontrado: ${documentId}`);

  // TODO: recuperar texto crudo de tu tabla Extraction o re-extraer según tu diseño.
  // TODO: parseo específico (ej.: comprobante bancario vs listado de aportes)
  const parsed = {
    kind: 'BANK_RECEIPT', // o 'CONTRIB_LIST' según tu heurística
    fieldsDetected: 10,
    sha256
  };

  await setJobResult(job.id, parsed);

  // Idempotencia simple: evitá duplicar VALIDATION en curso/hecha
  const exists = await prisma.job.findFirst({
    where: {
      type: JobType.VALIDATION,
      documentId,
      status: { in: [JobStatus.QUEUED, JobStatus.PROCESSING, JobStatus.DONE] }
    }
  });
  
  if (!exists) {
    await enqueueNext(JobType.VALIDATION, { documentId }, documentId);
  }

  await updateJobMetrics(job.id, {
    startedAt,
    finishedAt: nowISO(),
    durationMs: Date.now() - t0,
    status: 'OK'
  });
}

/* ------------------------------ VALIDATION ------------------------------ */
export async function processVALIDATION(job: Job) {
  const startedAt = nowISO();
  const t0 = Date.now();

  const p = (job as JobWithPayload).payload;
  assert(isValidationPayload(p), 'VALIDATION payload inválido');
  const { documentId } = p as ValidationPayload;

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  assert(!!doc, `Documento no encontrado: ${documentId}`);

  // TODO: reglas de negocio (campos obligatorios, tolerancias, cruces básicos)
  const valid = true; // demo

  await setJobResult(job.id, { valid });

  // Encolá EXPORT si todo ok
  await enqueueNext(JobType.EXPORT, { documentId, format: 'PDF' }, documentId);

  await updateJobMetrics(job.id, {
    startedAt,
    finishedAt: nowISO(),
    durationMs: Date.now() - t0,
    status: valid ? 'OK' : 'WARN'
  });
}

/* ------------------------------ EXPORT ------------------------------ */
export async function processEXPORT(job: Job) {
  const startedAt = nowISO();
  const t0 = Date.now();

  const p = (job as JobWithPayload).payload;
  assert(isExportPayload(p), 'EXPORT payload inválido');
  const { documentId, format = 'PDF' } = p as ExportPayload;

  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  assert(!!doc, `Documento no encontrado: ${documentId}`);

  // TODO: generar el artefacto real (PDF/CSV). Acá solo dejamos un path simulado.
  const outputPath = `/data/extractions/report-${documentId}.${format.toLowerCase()}`;
  await setJobResult(job.id, { outputPath, format });

  await updateJobMetrics(job.id, {
    startedAt,
    finishedAt: nowISO(),
    durationMs: Date.now() - t0,
    status: 'OK'
  });
}

// Export job handlers for the worker
// Export job handlers for the worker
export const jobHandlers = {
  [JobType.OCR]: processOCR,
  [JobType.PARSING]: processPARSING,
  [JobType.VALIDATION]: processVALIDATION,
  [JobType.EXPORT]: processEXPORT,
};

// Sample OCR result for testing
const sampleOcrResult = {
  text: 'Sample extracted text',
  pages: 1
};

// Update job with result
async function updateJobWithResult(jobId: string, result: any) {
  await prisma.job.update({
    where: { id: jobId },
    data: { 
      status: JobStatus.DONE,
      result: result,
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
