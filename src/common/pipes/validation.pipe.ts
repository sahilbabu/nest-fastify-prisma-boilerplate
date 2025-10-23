// common/pipes/manual-validation.pipe.ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly dtoClass: any) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToInstance(this.dtoClass, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      );
    }
    return object;
  }
}
