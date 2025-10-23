import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResponseDto, IResponseMeta } from '../dto/response.dto';

interface IResponseData {
  message?: string;
  [key: string]: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    return next.handle().pipe(
      map((data: unknown) => {
        const statusCode = reply.statusCode ?? 200;

        // If already a ResponseDto instance, return as-is
        if (data instanceof ResponseDto) {
          return data;
        }

        // Extract message if present in data
        let message = 'Success';
        let responseData: unknown = data;

        if (data && typeof data === 'object' && 'message' in data) {
          const typedData = data as IResponseData;
          message = String(typedData.message ?? 'Success');
          const { message: _, ...rest } = typedData;
          responseData = Object.keys(rest).length > 0 ? rest : undefined;
        }

        // Build metadata
        const meta: IResponseMeta = {
          timestamp: dayjs().format(),
          path: request.url,
          version: '1.0',
        };

        // Create and return unified response
        return new ResponseDto(statusCode, message, responseData, meta);
      }),
    );
  }
}
