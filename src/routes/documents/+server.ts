import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
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
    
    return json(documents, {
      status: 200
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
