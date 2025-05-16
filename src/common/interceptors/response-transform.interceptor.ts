import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { catchError, map, throwError } from 'rxjs';

export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data: any) => {
        // Transform the response data here
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          status: 'success',
          data,
        };
      }),
      catchError((err) => {
        if (err instanceof HttpException) {
          const response = err.getResponse();
          const status = err.getStatus();
          const message =
            typeof response === 'string'
              ? response
              : (response as any).message || 'Something went wrong';

          return throwError(
            () =>
              new HttpException(
                {
                  status: 'error',
                  code: status,
                  message,
                },
                status,
              ),
          );
        }

        return throwError(() => ({
          status: 'error',
          code: 500,
          message: 'Internal server error',
        }));
      }),
    );
  }
}
