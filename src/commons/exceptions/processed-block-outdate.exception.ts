import { HttpException, HttpStatus } from '@nestjs/common';

export class ProcessedBlockOutdateException extends HttpException {
  constructor(message = 'block outdate no update', data = {}) {
    super(
      {
        message,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: {
          type: 'ProcessedBlockOutdateException',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message
        },
        data,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}