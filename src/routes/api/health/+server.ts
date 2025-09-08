import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
  try {
    // ping DB rápido
    await prisma.$queryRaw`SELECT 1`;
    return new Response(JSON.stringify({ ok: true, status: 'healthy' }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, status: 'degraded' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
};
