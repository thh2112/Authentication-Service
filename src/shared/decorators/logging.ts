import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { HEADER_KEY } from '../constant';
import { createId } from '@paralleldrive/cuid2';

export const getLogId = (request) => {
  if (!request.headers[HEADER_KEY.LOG_ID]) {
    request.headers[HEADER_KEY.LOG_ID] = createId();
  }
  return request.headers[HEADER_KEY.LOG_ID];
};

export const LogId = createParamDecorator(
  (_: any, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return getLogId(request);
  },
);
