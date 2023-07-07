import { HttpException, HttpStatus } from '@nestjs/common';

export class NoAvailableNodeException extends HttpException {
  constructor(message = 'No available blockchain node', data = {}) {
    super(
      {
        message,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: {
          type: 'NoAvailableNodeException',
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message
        },
        data,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}