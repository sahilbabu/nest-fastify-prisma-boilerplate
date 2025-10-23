import { BadRequestException } from '@nestjs/common';

export class CustomBadRequestException extends BadRequestException {
  constructor(property: string, constraint: string) {
    super({
      message: [
        {
          property,
          constraints: { [constraint]: constraint },
        },
      ],
    });
  }
}
