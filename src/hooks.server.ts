import { handleAuth as authHandle } from '$lib/auth/config';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(authHandle);
