import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IResponseMeta {
  timestamp: string;
  path: string;
  version?: string;
}

export class ResponseDto<T = unknown> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiPropertyOptional()
  data: T | undefined;

  @ApiPropertyOptional()
  meta: IResponseMeta | undefined;

  @ApiPropertyOptional()
  pagination: IPaginationMeta | undefined;

  constructor(
    statusCode: number,
    message: string,
    data?: T,
    meta?: IResponseMeta,
    pagination?: IPaginationMeta,
  ) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.pagination = pagination;
  }
}
