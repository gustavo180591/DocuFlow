import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { JobType, JobStatus } from '@prisma/client';
import { processOCR, processPARSING, processVALIDATION, processEXPORT } from '../handlers';

// Mock Prisma client
const prisma = new PrismaClient();

// Mock the job data
const mockJob = {
  id: 'test-job-123',
  type: JobType.OCR,
  status: JobStatus.QUEUED,
  payload: {
    documentId: 'doc-test-123',
    sha256: 'test-sha256',
    filePath: '/data/uploads/test.pdf'
  },
  result: null,
  error: null,
  attempts: 0,
  maxAttempts: 3,
  priority: 0,
  scheduledAt: new Date(),
  startedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  documentId: 'doc-test-123',
  metrics: {}
};

describe('Job Handlers', () => {
  beforeAll(async () => {
    // Create a test document in the database
    await prisma.document.create({
      data: {
        id: 'doc-test-123',
        name: 'Test Document',
        path: '/data/uploads/test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        sha256: 'test-sha256',
        status: 'UPLOADED',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.job.deleteMany({
      where: {
        OR: [
          { id: 'test-job-123' },
          { documentId: 'doc-test-123' }
        ]
      }
    });
    
    await prisma.document.delete({
      where: { id: 'doc-test-123' }
    });
    
    await prisma.$disconnect();
  });

  it('should process OCR job', async () => {
    const job = { ...mockJob };
    await processOCR(job as any);
    
    // Verify the job was processed
    const updatedJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: { metrics: true }
    });
    
    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe(JobStatus.DONE);
    expect(updatedJob?.result).toBeDefined();
    expect(updatedJob?.metrics).toBeDefined();
    expect(updatedJob?.metrics?.status).toBe('OK');
  });

  it('should process PARSING job', async () => {
    const job = {
      ...mockJob,
      type: JobType.PARSING,
      payload: {
        documentId: 'doc-test-123',
        sha256: 'test-sha256'
      }
    };
    
    await processPARSING(job as any);
    
    // Verify the job was processed
    const updatedJob = await prisma.job.findFirst({
      where: { documentId: 'doc-test-123', type: JobType.PARSING },
      orderBy: { createdAt: 'desc' },
      include: { metrics: true }
    });
    
    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe(JobStatus.DONE);
    expect(updatedJob?.result).toBeDefined();
    expect(updatedJob?.metrics).toBeDefined();
    expect(updatedJob?.metrics?.status).toBe('OK');
  });

  it('should process VALIDATION job', async () => {
    const job = {
      ...mockJob,
      type: JobType.VALIDATION,
      payload: {
        documentId: 'doc-test-123'
      }
    };
    
    await processVALIDATION(job as any);
    
    // Verify the job was processed
    const updatedJob = await prisma.job.findFirst({
      where: { documentId: 'doc-test-123', type: JobType.VALIDATION },
      orderBy: { createdAt: 'desc' },
      include: { metrics: true }
    });
    
    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe(JobStatus.DONE);
    expect(updatedJob?.result).toBeDefined();
    expect(updatedJob?.metrics).toBeDefined();
    expect(updatedJob?.metrics?.status).toBe('OK');
  });

  it('should process EXPORT job', async () => {
    const job = {
      ...mockJob,
      type: JobType.EXPORT,
      payload: {
        documentId: 'doc-test-123',
        format: 'PDF'
      }
    };
    
    await processEXPORT(job as any);
    
    // Verify the job was processed
    const updatedJob = await prisma.job.findFirst({
      where: { documentId: 'doc-test-123', type: JobType.EXPORT },
      orderBy: { createdAt: 'desc' },
      include: { metrics: true }
    });
    
    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe(JobStatus.DONE);
    expect(updatedJob?.result).toBeDefined();
    expect(updatedJob?.result).toHaveProperty('outputPath');
    expect(updatedJob?.metrics).toBeDefined();
    expect(updatedJob?.metrics?.status).toBe('OK');
  });
});
