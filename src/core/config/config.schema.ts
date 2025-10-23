import { z } from 'zod';

import { environmentVariables } from './env';

export enum NodeEnv {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
  STAGING = 'staging',
}

export const configurationSchema = z.object({
  PORT: z.coerce.number().int().positive().min(1).max(65535).default(3000),

  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),

  DATABASE_URL: z.url({ message: 'DATABASE_URL must be a valid URL' }).min(1),

  JWT_SECRET_KEY: z
    .string()
    .min(32, 'JWT_SECRET_KEY must be at least 32 characters long')
    .regex(/^[A-Za-z0-9+/=]+$/, 'Invalid JWT_SECRET_KEY'),

  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('1h'),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  OPTIMIZE_API_KEY: z.string().optional(),

  ALLOWED_ORIGINS: z
    .string()
    .transform((str: string): string[] => {
      try {
        const parsed = JSON.parse(str) as unknown;
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(
            (origin: unknown) =>
              typeof origin === 'string' && (origin === '*' || /^https?:\/\/.+/.test(origin)),
          );
          return isValid ? (parsed as string[]) : [];
        }
        return [];
      } catch {
        return [];
      }
    })
    .refine((origins) => origins.length > 0, 'ALLOWED_ORIGINS must contain at least one valid origin'),

  // Mail Configuration
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().int().positive().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM_NAME: z.string().default('NestJS App'),
  MAIL_FROM_EMAIL: z.string().email().optional(),
  MAIL_SECURE: z
    .string()
    .transform((str: string) => str === 'true')
    .default(false),

  // Storage Configuration
  STORAGE_DRIVER: z.enum(['local', 's3', 'wasabi', 'azure']).default('local'),

  // Local Storage
  LOCAL_STORAGE_PATH: z.string().default('./uploads'),

  // File Limits
  MAX_PHOTO_SIZE_MB: z.coerce.number().int().positive().default(8),
  ALLOWED_PHOTO_TYPES: z.string().default('image/jpeg,image/png,image/webp,image/heic'),

  // Cleanup
  ORPHANED_FILES_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  CLEANUP_SCHEDULE_CRON: z.string().default('0 2 * * *'),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Wasabi
  WASABI_ACCESS_KEY_ID: z.string().optional(),
  WASABI_SECRET_ACCESS_KEY: z.string().optional(),
  WASABI_REGION: z.string().default('us-east-1'),
  WASABI_BUCKET: z.string().optional(),
  WASABI_ENDPOINT: z.string().default('https://s3.wasabisys.com'),

  // Azure
  AZURE_STORAGE_ACCOUNT: z.string().optional(),
  AZURE_STORAGE_KEY: z.string().optional(),
  AZURE_CONTAINER_NAME: z.string().optional(),
});

export type ApplicationConfiguration = z.infer<typeof configurationSchema>;

const validateEnvironmentVariables = (): ApplicationConfiguration => {
  try {
    return configurationSchema.parse(environmentVariables);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // eslint-disable-next-line no-console
      console.error('\n❌ Environment variables validation failed:');
      // eslint-disable-next-line no-console
      console.error('━'.repeat(50));
      error.issues.forEach(issue => {
        // eslint-disable-next-line no-console
        console.error(`\n🔸 Variable: ${issue.path.join('.')}`);
        // eslint-disable-next-line no-console
        console.error(`   Error: ${issue.message}`);
      });
      // eslint-disable-next-line no-console
      console.error('━'.repeat(50));
      process.exit(1);
    }
    throw error;
  }
};

export const config = validateEnvironmentVariables();
export default config;
