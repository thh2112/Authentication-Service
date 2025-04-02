import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { RedisService } from 'src/modules/cache/redis.service';
import { ERR_CODE, INJECTION_TOKEN } from '../constant';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
import {
  getBlackListTokenCacheKey,
  getRevokedTokenThresholdCacheKey,
} from '../helpers/cache-key-helper';
import { AuthenticatedUser } from '../type';
import { generateUnauthorizedResult } from '../utils/operation-result';

@Injectable()
export class JwtAuthenticatedTokenGuard implements CanActivate {
  constructor(
    @Inject(INJECTION_TOKEN.REDIS_SERVICE)
    protected cacheService: RedisService,

    protected reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, handler);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        generateUnauthorizedResult('Invalid token'),
      );
    }

    const token = authHeader.split(' ')[1];
    const user = jwt.decode(token) as AuthenticatedUser;

    const cacheKey = getBlackListTokenCacheKey(user.id, user.jit);

    const isBlacklisted = await this.cacheService.get(cacheKey);

    if (isBlacklisted) {
      throw new UnauthorizedException(
        generateUnauthorizedResult(
          'token is blacklisted',
          ERR_CODE.TOKEN_BLACKLISTED,
        ),
      );
    }

    const tokenThresholdCacheKey = getRevokedTokenThresholdCacheKey(user.id);

    const tokenThreshold = await this.cacheService.get(tokenThresholdCacheKey);

    if (user.iat <= tokenThreshold) {
      throw new UnauthorizedException(
        generateUnauthorizedResult('token is revoked', ERR_CODE.TOKEN_REVOKED),
      );
    }

    return true;
  }
}
