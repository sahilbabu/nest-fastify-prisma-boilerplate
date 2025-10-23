import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { ValidationError } from 'class-validator';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { isProduction } from '../utils/is-environment.util';

import { PrismaErrorCode, prismaErrorMap } from './prisma-error-codes';
import { ErrorResponse, PrismaErrorResult } from './prisma-errors.interface';

/**
 * Enhanced Prisma Exception Filter combining comprehensive error handling
 * with detailed field extraction and user-friendly error messages
 *
 * Features:
 * - Complete coverage of all Prisma error codes (P1xxx, P2xxx, P3xxx, P4xxx, P6xxx)
 * - Smart field extraction from error messages and metadata
 * - Environment-aware error responses (detailed in dev, sanitized in prod)
 * - Comprehensive logging with request context
 * - Support for class-validator integration
 * - Rate limiting and custom exception support
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly winstonLogger: WinstonLogger) {}

  async catch(exception: any, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    const isProd = isProduction();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;
    let errors: Record<string, string[] | undefined> = {};
    let code: string | undefined;
    let details: any;

    // Handle different exception types with enhanced logic
    if (exception instanceof PrismaClientKnownRequestError) {
      ({ status, message, errors, code, details } = this.handlePrismaKnownError(exception));
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      ({ status, message, errors, details } = this.handlePrismaUnknownError(exception));
    } else if (exception instanceof PrismaClientRustPanicError) {
      ({ status, message, errors, details } = this.handlePrismaRustPanicError(exception));
    } else if (exception instanceof PrismaClientInitializationError) {
      ({ status, message, errors, details } = this.handlePrismaInitializationError(exception));
    } else if (exception instanceof PrismaClientValidationError) {
      ({ status, message, errors, details } = this.handlePrismaValidationError(exception));
    } else if (exception instanceof BadRequestException) {
      ({ status, message, errors } = await this.handleBadRequestException(exception));
    } else if (exception instanceof TooManyRequestsException) {
      ({ status, message, errors } = this.handleTooManyRequestsException(exception));
    } else if (exception instanceof HttpException) {
      ({ status, message, errors } = this.handleHttpException(exception));
    } else if (exception instanceof Error) {
      ({ status, message, errors } = this.handleGenericError(exception));
    }

    // Log the error with comprehensive context
    this.logError(exception, request, status, message, errors);

    // Build error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: dayjs().format(),
      message,
      path: request.url,
    };

    // Add error code if available
    if (code) {
      errorResponse.code = code;
    }

    // Include detailed errors based on environment and error type
    if (!isProd) {
      errorResponse.errors = errors;
      errorResponse.details = details;
    }

    reply.status(status).send(errorResponse);
  }

  /**
   * Handle known Prisma errors with comprehensive error code coverage
   * and intelligent field extraction
   */
  private handlePrismaKnownError(exception: PrismaClientKnownRequestError): PrismaErrorResult {
    let status = HttpStatus.BAD_REQUEST;
    let message = exception.message;
    let errors: Record<string, string[]> = {};
    const code = exception.code as PrismaErrorCode;
    const details = {
      originalMessage: exception.message,
      meta: exception.meta,
    };

    const prismaErrorHandler = prismaErrorMap[code];
    if (prismaErrorHandler) {
      status = prismaErrorHandler.status;
      message = prismaErrorHandler.message;
      errors = prismaErrorHandler.buildErrors?.(exception) || {};
    }

    return { status, message, errors, code, details };
  }

  /**
   * Handle unknown Prisma runtime errors
   */
  private handlePrismaUnknownError(exception: PrismaClientUnknownRequestError): PrismaErrorResult {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unknown database error occurred',
      errors: { database: ['An unknown database error occurred'] },
      details: {
        originalMessage: exception.message,
        type: 'PrismaClientUnknownRequestError',
      },
    };
  }

  /**
   * Handle Prisma engine panics
   */
  private handlePrismaRustPanicError(exception: PrismaClientRustPanicError): PrismaErrorResult {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Critical database engine error',
      errors: { engine: ['A critical database engine error occurred. Please contact support.'] },
      details: {
        type: 'PrismaClientRustPanicError',
        originalMessage: exception.message,
      },
    };
  }

  /**
   * Handle Prisma client initialization errors
   */
  private handlePrismaInitializationError(
    exception: PrismaClientInitializationError,
  ): PrismaErrorResult {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database service temporarily unavailable',
      errors: {
        initialization: ['Database client initialization failed. Please try again later.'],
      },
      details: {
        type: 'PrismaClientInitializationError',
        errorCode: exception.errorCode,
        originalMessage: exception.message,
      },
    };
  }

  /**
   * Handle Prisma validation errors
   */
  private handlePrismaValidationError(exception: PrismaClientValidationError): PrismaErrorResult {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: 'Invalid request parameters',
      errors: { validation: [this.sanitizeValidationMessage(exception.message)] },
      details: {
        type: 'PrismaClientValidationError',
        originalMessage: exception.message,
      },
    };
  }

  /**
   * Handle BadRequestException (typically validation errors)
   */
  private async handleBadRequestException(exception: BadRequestException) {
    const status = exception.getStatus();
    const response = exception.getResponse() as any;
    const rawErrors = Array.isArray(response.message) ? response.message : [response.message];

    return {
      status,
      message: response.message || 'Validation failed',
      errors: Array.isArray(rawErrors)
        ? await this.formatValidationErrors(rawErrors)
        : { validation: rawErrors },
    };
  }

  /**
   * Handle TooManyRequestsException
   */
  private handleTooManyRequestsException(exception: TooManyRequestsException) {
    return {
      status: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Rate limit exceeded',
      errors: { rateLimit: [exception.message || 'Too many requests'] },
    };
  }

  /**
   * Handle generic HttpException
   */
  private handleHttpException(exception: HttpException) {
    const status = exception.getStatus();
    const response = exception.getResponse() as any;

    return {
      status,
      message: response.message || exception.message,
      errors: response.errors || null,
    };
  }

  /**
   * Handle generic Error
   */
  private handleGenericError(exception: Error) {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message,
      errors: { server: [exception.message], stack: exception.stack?.split('\n') || [] },
    };
  }

  /**
   * Format validation errors from class-validator
   */
  private async formatValidationErrors(
    errors: ValidationError[],
  ): Promise<Record<string, string[]>> {
    const formatted: Record<string, string[]> = {};

    for (const error of errors) {
      if (error.constraints) {
        formatted[error.property] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        const childErrors = await this.formatValidationErrors(error.children);
        for (const [key, value] of Object.entries(childErrors)) {
          formatted[`${error.property}.${key}`] = value;
        }
      }
    }

    return formatted;
  }

  /**
   * Sanitize validation error messages to remove sensitive information
   */
  private sanitizeValidationMessage(message: string): string {
    if (!message) return 'Validation error occurred';

    return message
      .replace(/Argument `.*?`:/g, 'Argument:')
      .replace(/at `.*?`/g, 'at field')
      .replace(/Type `.*?`/g, 'Type')
      .replace(/Path `.*?`/g, 'Path')
      .substring(0, 500); // Limit message length
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'authorization',
      'auth',
      'key',
      'private',
      'confidential',
    ];

    const sanitized = { ...body };

    const sanitizeObject = (obj: any, prefix = ''): any => {
      if (!obj || typeof obj !== 'object') return obj;

      const result: any = Array.isArray(obj) ? [] : {};

      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const lowerKey = key.toLowerCase();

        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value, fullKey);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Log error with comprehensive context and appropriate log levels
   */
  private logError(
    exception: any,
    request: FastifyRequest,
    status: number,
    message: string,
    errors: Record<string, string[] | undefined>,
  ): void {
    // Determine log level based on status code and error type
    let logLevel: string;
    if (status >= 500) {
      logLevel = 'error';
    } else if (status >= 400) {
      logLevel = 'warn';
    } else {
      logLevel = 'info';
    }

    // Build comprehensive log data
    const logData = {
      timestamp: dayjs().format(),
      level: logLevel,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.id || 'anonymous',
      ip: request.ip,
      status,
      message,
      errors,

      // Error context
      errorType: exception.constructor.name,
      errorCode: exception.code,

      // Request context (sanitized)
      requestId: request.id,
      correlationId: request.headers['x-correlation-id'],

      // Performance data
      responseTime: Date.now() - ((request as any).startTime || Date.now()),

      // Include stack trace for server errors in non-prod
      ...(status >= 500 && {
        stack: exception.stack,
        originalMessage: exception.message,
      }),

      // Include request body for client errors (sanitized)
      ...(status >= 400 &&
        status < 500 && {
          body: this.sanitizeRequestBody(request.body),
          query: request.query,
          params: request.params,
        }),

      // Additional Prisma-specific context
      ...(exception.meta && { meta: exception.meta }),
    };

    // Log using both NestJS logger and Winston
    switch (logLevel) {
      case 'error':
        this.logger.error(message, logData);
        this.winstonLogger.error(message, logData);
        break;
      case 'warn':
        this.logger.warn(message, logData);
        this.winstonLogger.warn(message, logData);
        break;
      default:
        this.logger.log(message, logData);
        this.winstonLogger.info(message, logData);
    }

    // Additional monitoring/alerting for critical errors
    if (status >= 500) {
      this.handleCriticalError(exception, logData);
    }
  }

  /**
   * Handle critical errors that require immediate attention
   */
  private handleCriticalError(exception: any, logData: any): void {
    // You can integrate with monitoring services here
    // Examples: Sentry, DataDog, New Relic, etc.

    // For now, log as critical
    this.logger.error(`CRITICAL ERROR: ${exception.message}`, {
      ...logData,
      critical: true,
      alertRequired: true,
    });

    // You could also send alerts, create incidents, etc.
    // this.alertingService.sendCriticalAlert(exception, logData);
    // this.incidentService.createIncident(exception, logData);
  }
}
