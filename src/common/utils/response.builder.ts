import dayjs from 'dayjs';

import { IPaginationMeta, IResponseMeta, ResponseDto } from '../dto/response.dto';

/**
 * Helper utility for building unified responses
 * Can be used in services or controllers for explicit response building
 */
export class ResponseBuilder {
  /**
   * Create a success response with data
   */
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    path?: string,
  ): ResponseDto<T> {
    const meta: IResponseMeta = {
      timestamp: dayjs().format(),
      path: path ?? '/',
      version: '1.0',
    };

    return new ResponseDto(statusCode, message, data, meta);
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
    statusCode: number = 200,
    path?: string,
  ): ResponseDto<T[]> {
    const totalPages = Math.ceil(total / limit);
    const pagination: IPaginationMeta = {
      total,
      page,
      limit,
      totalPages,
    };

    const meta: IResponseMeta = {
      timestamp: dayjs().format(),
      path: path ?? '/',
      version: '1.0',
    };

    return new ResponseDto(statusCode, message, data, meta, pagination);
  }

  /**
   * Create a response with custom metadata
   */
  static withMeta<T>(
    data: T,
    message: string = 'Success',
    meta: IResponseMeta,
    statusCode: number = 200,
  ): ResponseDto<T> {
    return new ResponseDto(statusCode, message, data, meta);
  }

  /**
   * Create a response with pagination and custom metadata
   */
  static paginatedWithMeta<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    meta: IResponseMeta,
    message: string = 'Success',
    statusCode: number = 200,
  ): ResponseDto<T[]> {
    const totalPages = Math.ceil(total / limit);
    const pagination: IPaginationMeta = {
      total,
      page,
      limit,
      totalPages,
    };

    return new ResponseDto(statusCode, message, data, meta, pagination);
  }

  /**
   * Create a response without data (e.g., for delete operations)
   */
  static empty(
    message: string = 'Success',
    statusCode: number = 200,
    path?: string,
  ): ResponseDto<undefined> {
    const meta: IResponseMeta = {
      timestamp: dayjs().format(),
      path: path ?? '/',
      version: '1.0',
    };

    return new ResponseDto(statusCode, message, undefined, meta);
  }
}
