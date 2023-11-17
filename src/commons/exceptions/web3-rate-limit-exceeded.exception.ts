import { HttpException, HttpStatus } from '@nestjs/common';

export class Web3RateLimitExceededException extends HttpException {
  constructor(message = 'rate limit error', data = {}) {
    super(
      {
        message,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: {
          type: 'Web3RateLimitExceededException',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message
        },
        data,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}