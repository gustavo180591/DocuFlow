import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [institutions, total] = await Promise.all([
      prisma.institution.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { cuit: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.institution.count({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { cuit: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      })
    ]);

    return json({
      data: institutions,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching institutions:', err);
    throw error(500, 'Error fetching institutions');
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.cuit) {
      throw error(400, 'Name and CUIT are required');
    }

    // Check for duplicate CUIT
    const existingInstitution = await prisma.institution.findUnique({
      where: { cuit: data.cuit }
    });

    if (existingInstitution) {
      throw error(409, 'An institution with this CUIT already exists');
    }

    const institution = await prisma.institution.create({
      data: {
        name: data.name,
        cuit: data.cuit,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        isActive: data.isActive !== false // Default to true if not provided
      }
    });

    return json(institution, { status: 201 });
  } catch (err: unknown) {
    console.error('Error creating institution:', err);
    
    interface ErrorWithStatus extends Error {
      status?: number;
    }
    
    const errorWithStatus = err as ErrorWithStatus;
    
    if (errorWithStatus?.status === 400) {
      throw error(400, 'Invalid request data');
    }
    
    if (errorWithStatus?.status === 409) {
      throw error(409, 'An institution with this CUIT already exists');
    }
    
    throw error(500, 'Error creating institution');
  }
};
