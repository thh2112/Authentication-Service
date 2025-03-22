import { IsEnum } from 'class-validator';
import { ROLE_TYPE } from 'src/shared/constant';

export class CreateRoleDTO {
  @IsEnum(ROLE_TYPE)
  type: ROLE_TYPE;
}
