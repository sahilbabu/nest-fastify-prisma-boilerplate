import { Logger } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { config as settings } from '@/src/core/config/config.schema';

export function setupSwagger(app: NestFastifyApplication): void {
  const logger = new Logger('Swagger');

  const config = new DocumentBuilder()
    .setTitle('NestJS Fastify Prisma API')
    .setDescription('API documentation for NestJS Fastify Prisma Boilerplate')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Storage', 'File storage and management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
  });

  logger.log(`📚 Swagger documentation available at: http://0.0.0.0:${settings.PORT}/api/docs`);
}
