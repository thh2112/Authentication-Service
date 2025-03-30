import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/modules/user/user.model';
import { ENV_KEY } from 'src/shared/constant';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  constructor(
    protected authService: AuthService,
    protected configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(ENV_KEY.JWT_SECRET),
    });
  }

  async validate(authInfo: Partial<User>): Promise<Partial<User>> {
    return authInfo;
  }
}
