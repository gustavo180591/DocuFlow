import { PrismaClient, JobType } from '@prisma/client';

const prisma = new PrismaClient();

type EnqueueOpts = {
  type: JobType;
  payload: Record<string, unknown>;
  priority?: number;
  scheduledAt?: Date | null;
  maxAttempts?: number;
  documentId?: string;
};

export async function enqueueJob({
  type,
  payload,
  priority = 0,
  scheduledAt = null,
  maxAttempts = 3,
  documentId,
}: EnqueueOpts) {
  return prisma.job.create({
    data: { 
      type, 
      payload, 
      priority, 
      scheduledAt,
      maxAttempts,
      documentId,
    },
  });
}
