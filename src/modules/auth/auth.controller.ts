import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/user.decorator';
import { LocalAuthGuard } from 'src/shared/guards/local-auth.guard';
import { HashingService } from 'src/shared/services/hashing.service';
import {
  generateConflictResult,
  generateNotFoundResult,
} from 'src/shared/utils/operation-result';
import { extractPublicUserInfo, User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { RegisterUserDTO } from './auth.dto';
import { RoleService } from '../role/role.service';
import { ENV_KEY, ROLE_TYPE, USER_STATUS } from 'src/shared/constant';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpResponse } from 'src/shared/type';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    protected userService: UserService,
    protected roleService: RoleService,
    protected hashingService: HashingService,
    protected jwtService: JwtService,
    protected configService: ConfigService,
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

    await this.userService.create({
      ...dto,
      password: hashedPassword,
      isVerify: false,
      roleId: role.id,
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

  @UseGuards(JwtAuthGuard)
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
}
