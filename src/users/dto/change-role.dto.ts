// src/users/dto/change-role.dto.ts
import { IsEnum } from 'class-validator';
import { Roles } from 'src/utility/common/user-roles.enum';

export class ChangeRoleDto {
  @IsEnum(Roles, { each: true })
  roles: Roles[];
}
