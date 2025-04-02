import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedUser } from '../type';

export const CurrentUser = createParamDecorator(
  (_: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const currentUser = request?.user || null;

    return currentUser as AuthenticatedUser;
  },
);
