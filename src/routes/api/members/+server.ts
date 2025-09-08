import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Define MemberStatus enum to avoid type import issues
enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

const Query = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().optional(),
  status: z.nativeEnum(MemberStatus).optional(),
  institutionId: z.string().trim().optional(),
  sort: z.enum(['apellido', 'nombre', 'dni', 'joinedAt']).default('apellido'),
  dir: z.enum(['asc', 'desc']).default('asc')
});

export const GET: RequestHandler = async ({ url }) => {
  const parsed = Query.safeParse({
    page: url.searchParams.get('page'),
    pageSize: url.searchParams.get('pageSize'),
    q: url.searchParams.get('q') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    institutionId: url.searchParams.get('institutionId') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    dir: url.searchParams.get('dir') ?? undefined
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ message: 'Invalid query', issues: parsed.error.flatten() }), {
      status: 400,
      headers: { 'content-type': 'application/json' }
    });
  }

  const { page, pageSize, q, status, institutionId, sort, dir } = parsed.data;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status) where.status = status;
  if (institutionId) where.institutionId = institutionId;
  if (q) {
    where.OR = [
      { dni: { contains: q } },
      { nombre: { contains: q, mode: 'insensitive' } },
      { apellido: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } }
    ];
  }

  try {
    const [total, data] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sort]: dir },
        include: {
          institution: { 
            select: { 
              id: true, 
              name: true, 
              cuit: true 
            } 
          }
        }
      })
    ]);

    return new Response(
      JSON.stringify({
        data,
        meta: { 
          total, 
          page, 
          pageSize, 
          totalPages: Math.ceil(total / pageSize) 
        }
      }),
      { 
        status: 200,
        headers: { 'content-type': 'application/json' } 
      }
    );
  } catch (err) {
    console.error('Error fetching members:', err);
    return new Response(
      JSON.stringify({ message: 'Error fetching members' }),
      { 
        status: 500,
        headers: { 'content-type': 'application/json' } 
      }
    );
  }
};
