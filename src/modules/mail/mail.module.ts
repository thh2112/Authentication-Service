import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_KEY } from 'src/shared/constant';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            service: 'gmail',
            host: config.getOrThrow(ENV_KEY.SMTP_HOST),
            port: config.getOrThrow(ENV_KEY.SMTP_HOST),
            secure: config.getOrThrow(ENV_KEY.SMTP_SECURE) == 'true',
            from: config.getOrThrow(ENV_KEY.SMTP_USERNAME),
            auth: {
              user: config.getOrThrow(ENV_KEY.SMTP_USERNAME),
              pass: config.getOrThrow(ENV_KEY.SMTP_PASSWORD),
            },
            logger: true,
            debug: config.getOrThrow(ENV_KEY.NODE_ENV) === 'development',
          },
          defaults: {
            from: '"No Reply" <no-reply@localhost>',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class MailModule {}
