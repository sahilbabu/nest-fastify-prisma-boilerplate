import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { LoggerService } from './logger.service';

import { PaginationDto } from '@/src/common/base/pagination.dto';

@ApiTags('Logger')
@ApiBearerAuth('JWT-auth')
@Controller('logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all logs with pagination' })
  @ApiResponse({ status: 200, description: 'Return all logs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() query: PaginationDto) {
    return this.loggerService.findAll(query);
  }
}
