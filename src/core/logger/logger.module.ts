import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { winstonLoggerConfig } from './winston.config';

@Module({
  imports: [WinstonModule.forRoot(winstonLoggerConfig)],
  controllers: [LoggerController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
