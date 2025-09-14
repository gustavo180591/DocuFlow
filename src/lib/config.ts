// Server configuration - Use import.meta.env in SvelteKit for environment variables
const UPLOAD_DIR = 'static/uploads';

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/api/recibos/upload'
};

export { UPLOAD_DIR };
