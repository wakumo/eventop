function isPaginationMetadata(data: any): data is PaginationMetadata {
  return (
    data.current_page !== undefined &&
    data.next_page !== undefined &&
    data.prev_page !== undefined &&
    data.total_pages !== undefined &&
    data.total_count !== undefined
  );
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { PaginationMetadata } from '../interfaces/index.js';

@Injectable()
export class SerializerInterceptor implements NestInterceptor {
  async intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<any> {
    return next.handle().pipe(
      map((data: any | any[]) => {
        let meta: PaginationMetadata;
        if (Array.isArray(data) && data[1] && isPaginationMetadata(data[1]))
          [data, meta] = data;
        return {
          status: true,
          data,
          meta,
          code: context.switchToHttp().getResponse().statusCode,
        };
      }),
    );
  }
}
