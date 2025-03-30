import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from './modules/cache/cache.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './modules/shared/shared.module';
import { JwtModule } from '@nestjs/jwt';

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
        // signOptions: {
        //   audience: configService.getOrThrow('JWT_AUDIENCE'),
        //   issuer: configService.getOrThrow('JWT_ISSUER'),
        // },
      }),
      inject: [ConfigService],
    }),
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
