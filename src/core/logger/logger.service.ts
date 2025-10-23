import { promises as fs } from 'fs';
import { join } from 'path';

import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import * as winston from 'winston';

import { PaginationDto } from '@/src/common/base/pagination.dto';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;
  private readonly logFilePath = join(__dirname, '../../../logs/error.log');

  constructor() {
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
    });
  }

  async findAll(query: PaginationDto) {
    // Read the log file
    const data = await fs.readFile(this.logFilePath, 'utf-8');
    const entries = data
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp)));

    const totalEntries = entries.length;
    const totalPages = Math.ceil(totalEntries / query.limit);
    const startIndex = (query.offset - 1) * query.limit;
    const paginatedData = entries.slice(startIndex, startIndex + query.limit);

    return {
      data: paginatedData,
      total: totalEntries,
      page: query.offset,
      pageSize: query.limit,
      totalPages,
    };
  }

  log(message: string): void {
    this.logger.info(message);
  }
}
