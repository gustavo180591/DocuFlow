import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            cuit: true
          }
        },
        _count: {
          select: { documents: true, memberDues: true }
        }
      }
    });

    if (!member) {
      throw error(404, 'Member not found');
    }

    return json(member);
  } catch (err) {
    console.error('Error fetching member:', err);
    throw error(500, 'Error fetching member');
  }
};

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.dni || !data.firstName || !data.lastName || !data.institutionId) {
      throw error(400, 'DNI, first name, last name, and institution are required');
    }

    // Check if another member with the same DNI exists
    const existingMember = await prisma.member.findFirst({
      where: {
        dni: data.dni,
        id: { not: params.id }
      }
    });

    if (existingMember) {
      throw error(409, 'Another member with this DNI already exists');
    }

    // Check if institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: data.institutionId }
    });

    if (!institution) {
      throw error(404, 'Institution not found');
    }

    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: {
        dni: data.dni,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        nationality: data.nationality,
        status: data.status || 'PENDING_VERIFICATION',
        joinedAt: data.joinedAt ? new Date(data.joinedAt) : new Date(),
        institutionId: data.institutionId
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return json(updatedMember);
  } catch (err) {
    console.error('Error updating member:', err);
    if (err.status === 400 || err.status === 404 || err.status === 409) {
      throw err;
    }
    throw error(500, 'Error updating member');
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    // Check if member has documents or dues
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { documents: true, memberDues: true }
        }
      }
    });

    if (!member) {
      throw error(404, 'Member not found');
    }

    if (member._count.documents > 0) {
      throw error(400, 'Cannot delete member with documents. Please remove all documents first.');
    }

    if (member._count.memberDues > 0) {
      throw error(400, 'Cannot delete member with dues. Please remove all dues first.');
    }

    await prisma.member.delete({
      where: { id: params.id }
    });

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('Error deleting member:', err);
    if (err.status === 400 || err.status === 404) {
      throw err;
    }
    throw error(500, 'Error deleting member');
  }
};
