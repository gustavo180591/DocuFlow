import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';

// Schema for member ID validation
const memberIdSchema = z.string().cuid('ID de socio inválido');

export async function GET({ params }) {
  try {
    // Validate member ID
    const validation = memberIdSchema.safeParse(params.id);
    if (!validation.success) {
      return json(
        { error: 'ID de socio no válido', details: validation.error.format() },
        { status: 400 }
      );
    }

    const memberId = validation.data;

    // Fetch member with document count
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        numeroOrden: true,
        numeroMatricula: true,
        firstName: true,
        lastName: true,
        institucion: true,
        documentoIdentidad: true,
        nacionalidad: true,
        status: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        membershipStartDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { documents: true }
        }
      }
    });

    if (!member) {
      return json({ error: 'Socio no encontrado' }, { status: 404 });
    }

    return json({
      data: {
        ...member,
        documentsCount: member._count.documents
      }
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return json(
      { error: 'Error al obtener los datos del socio' },
      { status: 500 }
    );
  }
}

// Update member
export async function PATCH({ request, params }) {
  try {
    // Validate member ID
    const idValidation = memberIdSchema.safeParse(params.id);
    if (!idValidation.success) {
      return json(
        { error: 'ID de socio no válido', details: idValidation.error.format() },
        { status: 400 }
      );
    }

    const memberId = idValidation.data;
    const data = await request.json();

    // Validate request body
    const updateSchema = z.object({
      firstName: z.string().min(1, 'El nombre es requerido').optional(),
      lastName: z.string().min(1, 'El apellido es requerido').optional(),
      email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      institucion: z.string().optional(),
      status: z.enum(['active', 'inactive', 'suspended']).optional()
    });

    const validation = updateSchema.safeParse(data);
    if (!validation.success) {
      return json(
        { error: 'Datos inválidos', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Convert empty strings to null for optional fields
    const updateData = Object.fromEntries(
      Object.entries(validation.data).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    ) as z.infer<typeof updateSchema>;

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: updateData,
      select: {
        id: true,
        numeroOrden: true,
        numeroMatricula: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        updatedAt: true
      }
    });

    return json({ data: updatedMember });
  } catch (error) {
    console.error('Error updating member:', error);
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return json({ error: 'Socio no encontrado' }, { status: 404 });
      }
      
      if (error.code === 'P2002') {
        return json(
          { error: 'El correo electrónico ya está en uso' },
          { status: 409 }
        );
      }
    }
    
    return json(
      { error: 'Error al actualizar el socio' },
      { status: 500 }
    );
  }
}

// Delete member (soft delete)
export async function DELETE({ params }) {
  try {
    // Validate member ID
    const validation = memberIdSchema.safeParse(params.id);
    if (!validation.success) {
      return json(
        { error: 'ID de socio no válido', details: validation.error.format() },
        { status: 400 }
      );
    }

    const memberId = validation.data;

    // Instead of deleting, we'll mark as inactive
    await prisma.member.update({
      where: { id: memberId },
      data: { status: 'inactive' }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting member:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return json({ error: 'Socio no encontrado' }, { status: 404 });
      }
    }
    
    return json(
      { error: 'Error al eliminar el socio' },
      { status: 500 }
    );
  }
}
