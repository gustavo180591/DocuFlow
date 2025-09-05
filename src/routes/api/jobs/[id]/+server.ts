import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export async function GET({ params }) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
          },
        },
      },
    });

    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return json(job);
  } catch (error) {
    console.error(`Error fetching job ${params.id}:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch job', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST({ params, request }) {
  try {
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { action } = await request.json().catch(() => ({}));

    switch (action) {
      case 'retry':
        if (job.status !== 'ERROR') {
          return new Response(
            JSON.stringify({ error: 'Only failed jobs can be retried' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const retriedJob = await prisma.job.update({
          where: { id: params.id },
          data: {
            status: 'QUEUED',
            attempts: 0,
            lastError: null,
            scheduledAt: new Date(),
            startedAt: null,
            finishedAt: null,
            lockedAt: null,
          },
        });
        
        return json(retriedJob);

      case 'cancel':
        if (job.status === 'DONE' || job.status === 'ERROR') {
          return new Response(
            JSON.stringify({ error: 'Completed or failed jobs cannot be cancelled' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const cancelledJob = await prisma.job.update({
          where: { id: params.id },
          data: {
            status: 'ERROR',
            lastError: 'Cancelled by user',
            finishedAt: new Date(),
            lockedAt: null,
          },
        });
        
        return json(cancelledJob);

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action', validActions: ['retry', 'cancel'] }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error(`Error processing job action:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to process job action', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
