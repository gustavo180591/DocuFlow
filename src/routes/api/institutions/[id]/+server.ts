import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { members: true, documents: true }
        }
      }
    });

    if (!institution) {
      throw error(404, 'Institution not found');
    }

    return json(institution);
  } catch (err) {
    console.error('Error fetching institution:', err);
    throw error(500, 'Error fetching institution');
  }
};

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.cuit) {
      throw error(400, 'Name and CUIT are required');
    }

    // Check if another institution with the same CUIT exists
    const existingInstitution = await prisma.institution.findFirst({
      where: {
        cuit: data.cuit,
        id: { not: params.id }
      }
    });

    if (existingInstitution) {
      throw error(409, 'Another institution with this CUIT already exists');
    }

    const updatedInstitution = await prisma.institution.update({
      where: { id: params.id },
      data: {
        name: data.name,
        cuit: data.cuit,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        isActive: data.isActive
      }
    });

    return json(updatedInstitution);
  } catch (err: unknown) {
    console.error('Error updating institution:', err);
    if (err && typeof err === 'object' && 'status' in err && 
        (err.status === 400 || err.status === 404 || err.status === 409)) {
      throw err;
    }
    throw error(500, 'Error updating institution');
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    // Check if institution has members or documents
    const institution = await prisma.institution.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { members: true, documents: true }
        }
      }
    });

    if (!institution) {
      throw error(404, 'Institution not found');
    }

    if (institution._count.members > 0) {
      throw error(400, 'Cannot delete institution with members. Please remove all members first.');
    }

    if (institution._count.documents > 0) {
      throw error(400, 'Cannot delete institution with documents. Please remove all documents first.');
    }

    await prisma.institution.delete({
      where: { id: params.id }
    });

    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    console.error('Error deleting institution:', err);
    if (err && typeof err === 'object' && 'status' in err && 
        (err.status === 400 || err.status === 404)) {
      throw err;
    }
    throw error(500, 'Error deleting institution');
  }
};
