import {
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Employer User',
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'employer@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
  })
  @MinLength(6)
  password: string;
}
