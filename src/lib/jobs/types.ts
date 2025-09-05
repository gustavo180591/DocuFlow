import { Job, JobStatus } from '@prisma/client';

// Payload types
export interface OcrPayload {
  documentId: string;
  sha256: string;
  filePath?: string;
}

export interface ParsingPayload {
  documentId: string;
  sha256?: string;
}

export interface ValidationPayload {
  documentId: string;
}

export interface ExportPayload {
  documentId: string;
  format?: 'PDF' | 'CSV';
}

// Job metrics
export interface JobMetrics {
  startedAt?: string;     // ISO timestamp
  finishedAt?: string;    // ISO timestamp
  durationMs?: number;    // Processing duration in milliseconds
  status?: 'OK' | 'WARN' | 'ERROR' | JobStatus;
  pagesProcessed?: number;
  documentType?: string;
  exportFormat?: 'PDF' | 'CSV';
  error?: string;
  [key: string]: unknown; // Allow additional metrics with type safety
}

// Type guards
export function isOcrPayload(payload: unknown): payload is OcrPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    'sha256' in payload &&
    typeof (payload as OcrPayload).documentId === 'string' &&
    typeof (payload as OcrPayload).sha256 === 'string'
  );
}

export function isParsingPayload(payload: unknown): payload is ParsingPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    typeof (payload as ParsingPayload).documentId === 'string' &&
    (!('sha256' in payload) || typeof (payload as ParsingPayload).sha256 === 'string')
  );
}

export function isValidationPayload(payload: unknown): payload is ValidationPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    typeof (payload as ValidationPayload).documentId === 'string'
  );
}

export function isExportPayload(payload: unknown): payload is ExportPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'documentId' in payload &&
    typeof (payload as ExportPayload).documentId === 'string' &&
    (!('format' in payload) || 
      (typeof (payload as ExportPayload).format === 'string' && 
       ['PDF', 'CSV'].includes((payload as ExportPayload).format as string)))
  );
}

// Job with typed payload
export type JobWithPayload = Omit<Job, 'payload' | 'result' | 'metrics'> & {
  payload: OcrPayload | ParsingPayload | ValidationPayload | ExportPayload;
  result?: Record<string, unknown> | null;
  metrics?: JobMetrics | null;
};

// Assert function
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export interface OcrResult {
  text: string;
  pages: number;
}
