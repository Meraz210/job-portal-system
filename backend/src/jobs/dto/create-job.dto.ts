import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    example: 'Frontend Developer',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Tech Hive',
  })
  @IsNotEmpty()
  company: string;

  @ApiProperty({
    example: 'Dhaka',
  })
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: '60000 BDT',
  })
  @IsNotEmpty()
  salary: string;

  @ApiProperty({
    example:
      'Build and maintain React frontend features.',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Bachelor degree in Computer Science or related field',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  educationRequirement?: string;

  @ApiProperty({
    example: '2+ years',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  experience?: string;

  @ApiProperty({
    example: 'Full-time',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobType?: string;

  @ApiProperty({
    example: 'React, TypeScript, REST API',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  skills?: string;

  @ApiProperty({
    example: '2026-06-30',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  deadline?: string;

  @ApiProperty({
    example: '3',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  vacancy?: string;

  @ApiProperty({
    example: 'Remote',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  workplaceType?: string;
}
