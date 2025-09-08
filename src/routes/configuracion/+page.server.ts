import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is authenticated
  const session = await locals.getSession();
  
  if (!session) {
    throw redirect(302, '/auth/login?redirectTo=/configuracion');
  }
  
  // Check if user has admin role
  // TODO: Uncomment and implement role check when authentication is set up
  // if (session.user.role !== 'ADMIN') {
  //   throw error(403, 'No tienes permiso para acceder a esta página');
  // }
  
  return {};
};
