import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Receipt, ReceiptsPageData } from '$lib/types/receipt';

// Mock data for demonstration
const mockReceipts: Receipt[] = [
  {
    id: '1',
    type: 'LISTADO_APORTE',
    date: '2023-10-15T14:30:00Z',
    amount: 1250.50,
    reference: 'AP-2023-10-123',
    memberName: 'Juan Pérez',
    memberId: '1',
    status: 'pending',
    createdAt: '2023-10-15T14:30:00Z',
    updatedAt: '2023-10-15T14:30:00Z'
  },
  {
    id: '2',
    type: 'COMPROBANTE_BANCO',
    date: '2023-10-14T10:15:00Z',
    amount: 750.25,
    reference: 'CB-2023-10-456',
    memberName: 'María Gómez',
    memberId: '2',
    status: 'approved',
    createdAt: '2023-10-14T10:15:00Z',
    updatedAt: '2023-10-14T10:15:00Z'
  },
  // Add more mock data as needed
];

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
    
    // In a real app, you would fetch data from your database here
    // For now, we'll filter and paginate the mock data
    let filteredReceipts: Receipt[] = [...mockReceipts];
    console.log('Total mock receipts:', mockReceipts.length);
    
    // Apply search filter
    if (search) {
      console.log('Applying search filter for:', search);
      const searchLower = search.toLowerCase();
      filteredReceipts = filteredReceipts.filter(
        receipt => {
          const matches = (receipt.reference?.toLowerCase().includes(searchLower)) ||
                        (receipt.memberName?.toLowerCase().includes(searchLower));
          console.log(`Receipt ${receipt.id} search match:`, matches);
          return matches;
        }
      );
      console.log('Filtered receipts after search:', filteredReceipts.length);
    }
    
    // Apply status filter
    if (status !== 'all') {
      console.log('Applying status filter for:', status);
      filteredReceipts = filteredReceipts.filter(receipt => {
        const matches = receipt.status === status;
        console.log(`Receipt ${receipt.id} status ${receipt.status} matches ${status}:`, matches);
        return matches;
      });
      console.log('Filtered receipts after status filter:', filteredReceipts.length);
    }
    
    // Calculate pagination
    const total = filteredReceipts.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = Math.max(0, (page - 1) * pageSize);
    const endIndex = Math.min(startIndex + pageSize, total);
    const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);
    
    console.log('Pagination details:', {
      page,
      pageSize,
      total,
      totalPages,
      startIndex,
      endIndex,
      paginatedCount: paginatedReceipts.length
    });

    const result: ReceiptsPageData = {
      receipts: paginatedReceipts,
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
