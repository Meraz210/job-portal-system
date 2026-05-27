import {
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-from-email',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'newPassword123',
    minLength: 6,
  })
  @MinLength(6)
  password: string;
}
