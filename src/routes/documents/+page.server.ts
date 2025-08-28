import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    // Fetch documents from the real database
    const documents = await prisma.document.findMany({
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true
          }
        },
        extractions: {
          select: {
            id: true,
            fieldName: true,
            fieldValue: true,
            confidence: true
          }
        },
        jobs: {
          select: {
            id: true,
            type: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      documents
    };
  } catch (err) {
    console.error('Error loading documents:', err);
    throw error(500, 'Error al cargar los documentos');
  } finally {
    await prisma.$disconnect();
  }
};
