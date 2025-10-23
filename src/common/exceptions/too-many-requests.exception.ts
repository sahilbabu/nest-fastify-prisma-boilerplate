import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(remainingTime: number) {
    super(remainingTime.toString(), HttpStatus.TOO_MANY_REQUESTS); // Pass the custom status code
  }
}
