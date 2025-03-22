import { Observable, catchError, map, of } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { getLogId } from '../decorators/logging';
import { ERR_CODE } from '../constant';
import { HttpResponse } from '../type';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  protected logger = new Logger(HttpResponseInterceptor.name);

  public intercept(
    ctx: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const httpReq: Request = ctx.switchToHttp().getRequest();
    const logId = getLogId(httpReq);

    return next.handle().pipe(
      map((response: HttpResponse) => {
        if (response?.httpCode) {
          return response;
        }

        if (response?.success === false) {
          return {
            success: false,
            code: response.code,
            httpCode: response.httpCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: response.message,
          };
        }

        if (response?.success === true) {
          delete response.success;
        }

        const payload = response?.data ?? response;

        return { data: payload, success: true };
      }),
      catchError((error) => {
        console.log(error);
        this.logger.error(`[${logId}]: ${error.message}`, error.stack);

        if (!(error instanceof HttpException)) {
          // todo: handle audit log
        }

        return of({
          success: false,
          message: 'internal server error',
          code: ERR_CODE.INTERNAL_SERVER_ERROR,
        });
      }),
    );
  }
}
