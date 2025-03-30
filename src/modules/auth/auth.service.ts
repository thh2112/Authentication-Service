import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { OperationResult } from 'src/shared/type';
import { USER_STATUS } from 'src/shared/constant';
import { generateUnauthorizedResult } from 'src/shared/utils/operation-result';
import { HashingService } from 'src/shared/services/hashing.service';
import { extractPublicUserInfo } from '../user/user.model';

@Injectable()
export class AuthService {
  constructor(
    protected userService: UserService,
    protected hashingService: HashingService,
  ) {}

  public async validateUser(
    email: string,
    password: string,
  ): Promise<OperationResult> {
    const foundUserByEmail = await this.userService.findOne({
      email,
      status: USER_STATUS.ACTIVE,
    });

    if (!foundUserByEmail) {
      return generateUnauthorizedResult('authentication failed');
    }

    const isMatchedPassword = await this.hashingService.compare(
      password,
      foundUserByEmail.password,
    );

    if (!isMatchedPassword) {
      return generateUnauthorizedResult('password not matched');
    }

    return {
      success: true,
      data: extractPublicUserInfo(foundUserByEmail),
    };
  }
}
