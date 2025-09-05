import { json, error as httpError } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { memberSchema } from '$lib/validation/member';
import type { MemberStatus } from '@prisma/client';
import type { RequestHandler } from './$types';

type MemberWhereInput = {
  OR?: Array<{
    firstName?: { contains: string; mode?: 'insensitive' };
    lastName?: { contains: string; mode?: 'insensitive' };
    dni?: { contains: string };
    email?: { contains: string; mode?: 'insensitive' };
  }>;
  institutionId?: string;
  status?: MemberStatus;
};

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Pagination
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20')));
    const search = url.searchParams.get('search')?.trim() || '';
    const institutionId = url.searchParams.get('institutionId');
    const status = url.searchParams.get('status');

    const where: MemberWhereInput = {};
    
    // Search functionality
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { dni: { contains: search } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ];
    }
    
    // Filters
    if (institutionId) {
      where.institutionId = institutionId;
    }
    
    if (status) {
      // Use type assertion to ensure type safety with Prisma's generated types
      where.status = status as MemberStatus;
    }

    const [items, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              cuit: true
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      }),
      prisma.member.count({ where })
    ]);
    
    return json({
      items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    console.error('Error fetching members:', err);
    throw httpError(500, 'Error fetching members');
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const rawData = await request.json();
    
    // Validate input with Zod
    const result = memberSchema.safeParse(rawData);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          message: 'Validation error',
          errors: result.error.flatten()
        }),
        { status: 400 }
      );
    }
    
    const data = result.data;

    // Check if member with same DNI exists
    const existingMember = await prisma.member.findUnique({
      where: { dni: data.dni }
    });

    if (existingMember) {
      return new Response(
        JSON.stringify({
          message: 'Validation error',
          errors: {
            formErrors: [],
            fieldErrors: {
              dni: ['A member with this DNI already exists']
            }
          }
        }),
        { status: 409 }
      );
    }

    // Check if institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: data.institutionId }
    });

    if (!institution) {
      return new Response(
        JSON.stringify({
          message: 'Validation error',
          errors: {
            formErrors: [],
            fieldErrors: {
              institutionId: ['Institution not found']
            }
          }
        }),
        { status: 404 }
      );
    }

    const member = await prisma.member.create({
      data: {
        dni: data.dni,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        nationality: data.nationality || null,
        status: data.status || 'PENDING_VERIFICATION',
        joinedAt: data.joinedAt ? new Date(data.joinedAt) : new Date(),
        institutionId: data.institutionId
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            cuit: true
          }
        }
      }
    });

    return json(member, { status: 201 });
  } catch (err) {
    console.error('Error creating member:', err);
    
    if (err && typeof err === 'object' && 'status' in err && 
        (err.status === 400 || err.status === 404 || err.status === 409)) {
      throw err;
    }
    
    throw httpError(500, 'Error creating member');
  }
};
