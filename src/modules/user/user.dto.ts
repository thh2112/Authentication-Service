import {
  IsEmail,
  IsOptional,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
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

  @IsOptional()
  @MinLength(10)
  @MaxLength(16)
  phoneNumber: string;

  @IsEmail()
  email: string;
}
