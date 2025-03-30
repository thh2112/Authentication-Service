import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';
import { MailModule } from './modules/mail/mail.module';
import { RoleModule } from './modules/role/role.module';
import { SharedModule } from './modules/shared/shared.module';
import { UsersModule } from './modules/user/user.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.local.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: +configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_SCHEMA'),
        autoLoadEntities: true,
        entities: [],
        synchronize:
          configService.get('DB_SYNCHRONIZE')?.toLowerCase() === 'true',
        logging: configService.get('DB_LOGGING')?.toLowerCase() === 'true',
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MailModule,
    CacheModule,
    UsersModule,
    RoleModule,
    AuthModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
