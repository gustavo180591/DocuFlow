import type { SystemConfig } from '@prisma/client';

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
