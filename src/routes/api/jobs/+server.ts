import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { JobType } from '@prisma/client';

export async function POST({ request }) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      type, 
      payload = {}, 
      priority = 0, 
      scheduledAt = null, 
      maxAttempts = 3,
      documentId = null
    } = body;
    
    // Validate job type
    if (!type || !(Object.values(JobType) as string[]).includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid job type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create the job
    const job = await prisma.job.create({
      data: { 
        type: type as JobType, 
        payload,
        priority: Math.max(0, Math.min(10, Number(priority) || 0)),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        maxAttempts: Math.max(1, Math.min(10, Number(maxAttempts) || 3)),
        documentId: documentId || undefined,
      },
    });

    return json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create job', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET({ url }) {
  try {
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const take = Math.min(Number(url.searchParams.get('take') || '20'), 100);
    const skip = Math.max(0, Number(url.searchParams.get('skip') || '0'));
    
    // Build the where clause
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    // Execute queries in parallel
    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        take,
        skip,
        include: {
          document: {
            select: {
              id: true,
              originalName: true,
              mimeType: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);
    
    return json({ items, total, skip, take });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch jobs', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
