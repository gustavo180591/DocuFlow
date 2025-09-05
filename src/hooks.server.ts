import { handleAuth as authHandle } from '$lib/auth/config';
import { sequence } from '@sveltejs/kit';

export const handle = sequence(authHandle);
