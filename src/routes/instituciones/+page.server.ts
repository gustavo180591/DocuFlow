import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface Institution {
  id: string;
  name: string;
  cuit: string;
  email: string | null;
  address: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const load: PageServerLoad = async ({ url }) => {
  try {
    // Get pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // TODO: Replace with actual database call
    // This is a mock implementation
    const total = 0; // Get total count from database
    const institutions: Institution[] = []; // Get paginated results from database
    
    return {
      institutions,
      meta: {
        page,
        pageSize,
        total
      }
    };
  } catch (err) {
    console.error('Error loading institutions:', err);
    throw error(500, 'Error al cargar las instituciones');
  }
};
