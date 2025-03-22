import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_KEY, INJECTION_TOKEN } from 'src/shared/constant';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: INJECTION_TOKEN.REDIS_SERVICE,
      useFactory: (config: ConfigService) =>
        new RedisService({
          host: config.getOrThrow(ENV_KEY.REDIS_HOST, 'localhost'),
          port: config.getOrThrow(ENV_KEY.REDIS_PORT, 6379),
          password: config.getOrThrow(ENV_KEY.REDIS_PASSWORD),
          keyPrefix: config.getOrThrow(ENV_KEY.SERVICE_NAME, 'dvsk'),
          db: config.getOrThrow(ENV_KEY.REDIS_DB, 0),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [INJECTION_TOKEN.REDIS_SERVICE],
})
export class CacheModule {}
