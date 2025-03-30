import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserAuthInfo } from 'src/shared/type';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategyService extends PassportStrategy(Strategy) {
  constructor(protected authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserAuthInfo> {
    const validateUserResult = await this.authService.validateUser(
      email,
      password,
    );

    if (!validateUserResult.success) {
      return null;
    }

    const userData = validateUserResult.data;

    return userData;
  }
}
