import type { FastifyCompressOptions } from '@fastify/compress';
import type { FastifyHelmetOptions } from '@fastify/helmet';

import { isProduction } from '@/common/utils/is-environment.util';

const isProd = isProduction();

/**
 * Helmet security configuration
 */
export const helmetConfig: FastifyHelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: isProd ? ["'self'"] : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
  crossOriginEmbedderPolicy: isProd,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
};

/**
 * Compression configuration
 */
export const compressionConfig: FastifyCompressOptions = {
  global: true,
  threshold: 1024,
  encodings: ['gzip', 'deflate', 'br'],
  zlibOptions: {
    level: isProd ? 6 : 1,
  },
};

/**
 * Fastify server configuration
 */
export const fastifyConfig = {
  trustProxy: true,
  logger: false,
  caseSensitive: false,
  ignoreTrailingSlash: true,
  maxParamLength: 100,
  keepAliveTimeout: 72000,
  requestTimeout: 30000,
  bodyLimit: 10 * 1024 * 1024, // 10MB
  connectionTimeout: 0,
  pluginTimeout: 30000,
  serializerOpts: {
    schema: {},
  },
};

/**
 * CORS configuration
 */
export const corsConfig = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
};

/**
 * API versioning configuration
 */
export const versioningConfig = {
  defaultVersion: '1',
  prefix: 'v',
  globalPrefix: 'api',
};
