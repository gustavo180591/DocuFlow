import { z } from 'zod';

// Environment variable validation schema
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  SHADOW_DATABASE_URL: z.string().url('Invalid shadow database URL').optional(),
  
  // File storage
  UPLOAD_DIR: z.string().default('/data/uploads'),
  EXTRACTION_DIR: z.string().default('/data/extractions'),
  MAX_UPLOAD_MB: z.coerce.number().int().positive().default(20),
  
  // Worker
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(2),
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
  JOB_MAX_ATTEMPTS: z.coerce.number().int().positive().default(3),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5173),
  HOST: z.string().default('0.0.0.0'),
});

// Validate and export environment variables
try {
  var env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((e) => {
      console.error(`  - ${e.path.join('.')}: ${e.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export default env;
