import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const currentUser = request?.user || null;

    return currentUser;
  },
);
