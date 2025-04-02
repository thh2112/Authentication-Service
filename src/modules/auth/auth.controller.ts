import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';
import {
  ENV_KEY,
  ERR_CODE,
  INJECTION_TOKEN,
  ROLE_TYPE,
  USER_STATUS,
} from 'src/shared/constant';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { JwtAuthenticatedTokenGuard } from 'src/shared/guards/jwt-authenticated-token.guard';
import { LocalAuthGuard } from 'src/shared/guards/local-auth.guard';
import {
  getBlackListTokenCacheKey,
  getRevokedTokenThresholdCacheKey,
} from 'src/shared/helpers/cache-key-helper';
import { HashingService } from 'src/shared/services/hashing.service';
import { AuthenticatedUser, HttpResponse } from 'src/shared/type';
import {
  generateBadRequestResult,
  generateConflictResult,
  generateNotFoundResult,
} from 'src/shared/utils/operation-result';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../cache/redis.service';
import { RoleService } from '../role/role.service';
import { extractPublicUserInfo, User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { ChangePasswordDTO, RegisterUserDTO } from './auth.dto';
import { AuthService } from './auth.service';
import * as dayjs from 'dayjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(INJECTION_TOKEN.REDIS_SERVICE)
    protected cacheService: RedisService,

    protected userService: UserService,
    protected roleService: RoleService,
    protected hashingService: HashingService,
    protected jwtService: JwtService,
    protected configService: ConfigService,
    protected mailerService: MailerService,
    protected authService: AuthService,
  ) {}

  @Post('register')
  public async register(@Body() dto: RegisterUserDTO) {
    const { email, password } = dto;

    const foundUser = await this.userService.findOne({ email });

    if (foundUser) {
      return generateConflictResult('user already exists');
    }

    const role = await this.roleService.findOne({
      type: ROLE_TYPE.USER,
    });

    const hashedPassword = await this.hashingService.hash(password);

    const registeredUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
      isVerified: false,
      roleId: role.id,
    });

    const token = this.authService.generateOtpToken();

    const template = readFileSync('templates/verify-email.ejs', 'utf-8');
    const compiledTemplate = ejs.render(template, {
      verifyUrl: `${this.configService.getOrThrow(ENV_KEY.APP_PUBLIC_URL)}/verify-email?token=${token}`,
    });

    await this.mailerService.sendMail({
      to: registeredUser.email,
      subject: 'Verify your email',
      html: compiledTemplate,
    });

    await this.userService.updateByID(registeredUser.id, {
      token,
    });

    return {
      success: true,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  public async login(@CurrentUser() user: User) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.roleId,
      jit: uuidv4(),
      iat: dayjs().unix(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow(ENV_KEY.JWT_SECRET),
      expiresIn: this.configService.getOrThrow(
        ENV_KEY.JWT_ACCESS_TOKEN_EXPIRES_IN,
      ),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow(ENV_KEY.JWT_SECRET),
      expiresIn: this.configService.getOrThrow(
        ENV_KEY.JWT_REFRESH_TOKEN_EXPIRES_IN,
      ),
    });

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  @UseGuards(JwtAuthGuard, JwtAuthenticatedTokenGuard)
  @Get('me')
  public async viewProfile(
    @CurrentUser() user: Partial<User>,
  ): Promise<HttpResponse> {
    const foundUser = await this.userService.findOne({
      id: user.id,
    });

    if (!foundUser) {
      return generateNotFoundResult('user not found');
    }

    if (foundUser.status !== USER_STATUS.ACTIVE) {
      return generateNotFoundResult('permission denied');
    }

    return {
      success: true,
      data: extractPublicUserInfo(foundUser),
    };
  }

  @Post('verify-email')
  public async verifyEmail(
    @Body('token') token: string,
  ): Promise<HttpResponse> {
    const user = await this.userService.findOne({
      token,
      status: USER_STATUS.INACTIVE,
    });

    if (!user) {
      return generateBadRequestResult(
        'invalid token',
        null,
        ERR_CODE.INVALID_TOKEN,
      );
    }

    if (user.isVerified) {
      return generateBadRequestResult(
        'user already verified',
        null,
        ERR_CODE.USER_ALREADY_VERIFIED,
      );
    }

    await this.userService.updateByID(user.id, {
      isVerified: true,
      token: null,
      status: USER_STATUS.ACTIVE,
    });

    return {
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  public async logout(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HttpResponse> {
    const cacheKey = getBlackListTokenCacheKey(user.id, user.jit);

    this.cacheService.set(cacheKey, 1);

    return {
      success: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  public async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDTO,
  ): Promise<HttpResponse> {
    const foundUser = await this.userService.findOne({
      id: user.id,
    });

    if (!foundUser) {
      return generateNotFoundResult('user not found');
    }

    if (foundUser.status !== USER_STATUS.ACTIVE) {
      return generateConflictResult(
        'permission denied',
        ERR_CODE.PERMISSION_DENIED,
      );
    }

    const isValidPassword = this.hashingService.compare(
      dto.oldPassword,
      foundUser.password,
    );

    if (!isValidPassword) {
      return generateBadRequestResult(
        'password not matched',
        ERR_CODE.PASSWORD_NOT_MATCHED,
      );
    }

    const passwordHash = await this.hashingService.hash(dto.password);

    await this.userService.updateByID(user.id, {
      password: passwordHash,
    });

    const cacheKey = getRevokedTokenThresholdCacheKey(user.id);
    this.cacheService.set(cacheKey, user.iat);

    return {
      success: true,
    };
  }
}
