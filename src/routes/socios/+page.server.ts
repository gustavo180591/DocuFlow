import type { ServerLoad } from '@sveltejs/kit';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PageData {
  members: Member[];
  meta: Meta;
  searchQuery: string;
  error?: string;
}

export const load: ServerLoad = async ({ url, fetch }) => {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? 10)));
  const search = (url.searchParams.get('search') ?? '').trim();

  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (search) {
      params.set('search', search);
    }

    // Fetch members from the API
    const response = await fetch(`/api/socios?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar los socios');
    }

    const { data, meta } = await response.json();
    
    return {
      members: data,
      meta,
      searchQuery: search
    } satisfies PageData;
  } catch (error) {
    console.error('Error loading members:', error);
    return {
      members: [],
      meta: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1
      },
      searchQuery: search,
      error: error instanceof Error ? error.message : 'Error desconocido al cargar los socios'
    } satisfies PageData;
  }
};
