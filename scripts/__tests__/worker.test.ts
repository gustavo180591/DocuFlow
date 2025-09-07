import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Job, JobStatus, JobType } from '@prisma/client';
import { processJob } from '../worker';

// Mock Prisma client
vi.mock('@prisma/client', () => {
  const mockJob = {
    update: vi.fn(),
    job: {
      findFirst: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockJob),
    JobStatus: {
      QUEUED: 'QUEUED',
      PROCESSING: 'PROCESSING',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
    },
    JobType: {
      OCR: 'OCR',
      PARSING: 'PARSING',
      VALIDATION: 'VALIDATION',
      EXPORT: 'EXPORT',
    },
  };
});

describe('Worker', () => {
  let prisma: any;
  
  beforeEach(() => {
    prisma = new (require('@prisma/client').PrismaClient)();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should process an OCR job successfully', async () => {
    const job = {
      id: 'test-job-1',
      type: 'OCR' as JobType,
      status: 'QUEUED' as JobStatus,
      payload: {
        documentId: 'doc-1',
        sha256: 'test-sha256',
        filePath: '/data/uploads/test.pdf'
      },
      attempts: 0,
      maxAttempts: 3,
      startedAt: null,
      completedAt: null,
      result: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Mock the update function
    prisma.update.mockResolvedValue({
      ...job,
      status: 'COMPLETED',
      result: { success: true },
    });
    
    await processJob(job as any);
    
    expect(prisma.update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: expect.objectContaining({
        status: 'PROCESSING',
        attempts: 1,
        lastError: null,
      }),
    });
  });
});
