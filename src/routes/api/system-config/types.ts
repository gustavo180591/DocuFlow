import type { SystemConfig } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

export interface SystemConfigResponse {
  data: SystemConfig;
  success: boolean;
  message?: string;
}

export interface SystemConfigError {
  success: boolean;
  message: string;
  issues?: any;
}

export type RequestHandler = (event: RequestEvent) => Promise<Response>;
