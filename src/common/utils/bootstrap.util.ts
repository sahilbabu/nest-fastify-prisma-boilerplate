import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { BadRequestException, Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ValidationError } from 'class-validator';
import dayjs from 'dayjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger as WinstonLogger } from 'winston';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { isProduction } from '@/common/utils/is-environment.util';
import { config as settings } from '@/core/config/config.schema';
import {
  compressionConfig,
  corsConfig,
  helmetConfig,
  versioningConfig,
} from '@/core/config/server.config';

const isProd = isProduction();

/**
 * Setup global validation pipes
 */
export function setupGlobalPipes(app: NestFastifyApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true, exposeDefaultValues: true },
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: isProd,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const formattedErrors = validationErrors.map(err => ({
          field: err.property,
          errors: Object.values(err.constraints ?? {}),
        }));

        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
          timestamp: dayjs().format(),
        });
      },
      stopAtFirstError: isProd,
    }),
  );
}

/**
 * Setup global exception filters
 */
export function setupGlobalFilters(app: NestFastifyApplication): void {
  const winstonLogger = app.get<WinstonLogger>(WINSTON_MODULE_PROVIDER);
  app.useGlobalFilters(new HttpExceptionFilter(winstonLogger));
}

/**
 * Setup global interceptors
 */
export function setupGlobalInterceptors(app: NestFastifyApplication): void {
  app.useGlobalInterceptors(new ResponseInterceptor());
}

/**
 * Setup security middleware (Helmet)
 */
export async function setupSecurity(app: NestFastifyApplication): Promise<void> {
  await app.register(helmet, helmetConfig);
}

/**
 * Setup compression middleware
 */
export async function setupCompression(app: NestFastifyApplication): Promise<void> {
  await app.register(compress as never, compressionConfig);
}

/**
 * Setup multipart file upload
 */
export async function setupMultipart(app: NestFastifyApplication): Promise<void> {
  await app.register(multipart, {
    limits: {
      fileSize: 8 * 1024 * 1024, // 8MB
    },
  });
}

/**
 * Setup CORS configuration
 */
export function setupCors(app: NestFastifyApplication): void {
  const allowedOrigins = settings.ALLOWED_ORIGINS;

  app.enableCors({
    ...corsConfig,
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list or is wildcard
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost in development
      if (!isProd && /localhost|127\.0\.0\.1/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
  });
}

/**
 * Setup API versioning
 */
export function setupVersioning(app: NestFastifyApplication): void {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: versioningConfig.defaultVersion,
    prefix: versioningConfig.prefix,
  });
  app.setGlobalPrefix(versioningConfig.globalPrefix);
}

/**
 * Setup graceful shutdown handlers
 */
export function setupGracefulShutdown(app: NestFastifyApplication, logger: Logger): void {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  signals.forEach(signal => {
    process.on(signal, () => {
      void (async () => {
        logger.warn(`Received ${signal}, shutting down gracefully...`);
        await app.close();
        logger.log('Application shutdown complete');
        process.exit(0);
      })();
    });
  });
}
