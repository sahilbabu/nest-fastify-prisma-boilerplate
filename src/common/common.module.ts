import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Module({
  imports: [],
  providers: [HttpExceptionFilter, ResponseInterceptor],
  exports: [HttpExceptionFilter, ResponseInterceptor],
})
export class CommonModule {}
