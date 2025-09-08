// Base URL for API requests
export const HOST = process.env.HOST || 'http://localhost:5173';

// API endpoints
export const API_ROUTES = {
  HEALTH: '/api/health',
  INSTITUTIONS: '/api/institutions',
  MEMBERS: '/api/members',
  DOCUMENTS: '/api/documents',
} as const;

// Default pagination values
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;
