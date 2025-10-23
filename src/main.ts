import { performance } from 'perf_hooks';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';
import {
  setupCompression,
  setupCors,
  setupGlobalFilters,
  setupGlobalInterceptors,
  setupGlobalPipes,
  setupGracefulShutdown,
  setupMultipart,
  setupSecurity,
  setupVersioning,
} from './common/utils/bootstrap.util';
import { isProduction } from './common/utils/is-environment.util';
import { setupSwagger } from './common/utils/swagger.util';
import { config as settings } from './core/config/config.schema';
import { fastifyConfig } from './core/config/server.config';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const startTime = performance.now();
  const isProd = isProduction();

  try {
    const fastifyAdapter = createFastifyAdapter();
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
      logger: isProd ? ['error', 'warn'] : ['log', 'debug', 'error', 'verbose', 'warn'],
      abortOnError: isProd,
      forceCloseConnections: true,
    });

    // Enable dependency injection for class-validator
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // Setup application middleware and configurations
    setupGlobalPipes(app);
    setupGlobalFilters(app);
    setupGlobalInterceptors(app);
    setupCors(app);
    setupVersioning(app);
    await Promise.all([setupSecurity(app), setupCompression(app), setupMultipart(app)]);

    // Setup Swagger documentation
    if (!isProd) {
      setupSwagger(app);
    }

    // Setup graceful shutdown
    setupGracefulShutdown(app, logger);

    // Start server
    const port = Number(settings.PORT) || 3000;
    const host = '0.0.0.0';
    await app.listen(port, host);

    // Log startup info
    logStartupInfo(logger, host, port, startTime);
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

function createFastifyAdapter(): FastifyAdapter {
  return new FastifyAdapter({
    ...fastifyConfig,
    clientErrorHandler: (error: Error, socket: { end: (message: string) => void }) => {
      const logger = new Logger('ClientError');
      logger.error('Client connection error:', error.message);
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    },
  });
}

function logStartupInfo(logger: Logger, host: string, port: number, startTime: number): void {
  const bootTime = Math.round(performance.now() - startTime);
  const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  logger.log(`🚀 Application started successfully!`);
  logger.log(`📍 Server running on: http://${host}:${port}`);
  logger.log(`🌍 Environment: ${settings.NODE_ENV}`);
  logger.log(`⚡ Boot time: ${bootTime}ms`);
  logger.log(`💾 Memory usage: ${memoryUsage}MB`);
}

void bootstrap();
