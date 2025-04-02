import { IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { CreateUserDTO } from '../user/user.dto';

export class RegisterUserDTO extends CreateUserDTO {}
export class LoginDTO {
  @MinLength(1)
  @MaxLength(50)
  username: string;

  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

export class ChangePasswordDTO {
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  oldPassword: string;

  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
