import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Receipt, ReceiptsPageData } from '$lib/types/receipt';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = (async ({ url }) => {
  console.log('[/recibos/+page.server.ts] Load function called');
  console.log('URL:', url.toString());
  console.log('Search params:', Object.fromEntries(url.searchParams.entries()));
  
  try {
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const pageSize = 10;

    console.log('Starting to process receipts');
    
    // Fetch receipts from the database
    const receipts = await prisma.processedDocument.findMany({
      where: {
        type: {
          in: ['COMPROBANTE_BANCARIO', 'LISTADO_APORTE', 'OTRO']
        },
        ...(search && {
          OR: [
            { originalName: { contains: search, mode: 'insensitive' } },
            { extractions: { some: { textRaw: { contains: search, mode: 'insensitive' } } } }
          ]
        }),
        ...(status !== 'all' && { status })
      },
      include: {
        extractions: {
          take: 1,
          orderBy: { pageIndex: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize + 1 // Fetch one extra to determine if there are more pages
    });
    
    const hasMore = receipts.length > pageSize;
    const filteredReceipts = receipts.slice(0, pageSize);
    
    // Map database records to Receipt objects
    const receiptData: Receipt[] = filteredReceipts.map(doc => ({
      id: doc.id,
      type: doc.type as any, // This should match your Receipt type
      date: doc.createdAt.toISOString(),
      amount: 0, // You'll need to extract this from the document content
      reference: doc.originalName,
      memberName: 'Unknown', // Extract from document content if available
      memberId: '',
      status: 'pending', // Or extract from document status
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));
    
    const total = await prisma.processedDocument.count({
      where: {
        type: {
          in: ['COMPROBANTE_BANCARIO', 'LISTADO_APORTE', 'OTRO']
        },
        ...(search && {
          OR: [
            { originalName: { contains: search, mode: 'insensitive' } },
            { extractions: { some: { textRaw: { contains: search, mode: 'insensitive' } } } }
          ]
        }),
        ...(status !== 'all' && { status })
      }
    });
    
    const totalPages = Math.ceil(total / pageSize);
    
    const result: ReceiptsPageData = {
      receipts: receiptData,
      meta: {
        page,
        pageSize,
        total,
        totalPages
      },
      searchQuery: search
    };
    
    console.log('Returning result with', result.receipts.length, 'receipts');
    return result;
  } catch (err) {
    console.error('Error loading receipts:', err);
    
    // Return a proper error response
    throw error(500, {
      message: 'Failed to load receipts. Please try again later.'
    });
  };
}) satisfies PageServerLoad<ReceiptsPageData>;
