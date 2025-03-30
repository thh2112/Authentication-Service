import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategyService } from './strategies/local.strategy.service';
import { JwtStrategyService } from './strategies/jwt.strategy.service';
import { RoleModule } from '../role/role.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UsersModule, PassportModule, RoleModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategyService, JwtStrategyService],
})
export class AuthModule {}
