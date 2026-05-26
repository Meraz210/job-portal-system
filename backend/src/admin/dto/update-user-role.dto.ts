import { IsEnum } from 'class-validator';
import { Role } from '../../users/enums/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
