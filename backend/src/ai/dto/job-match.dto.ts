import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AiJobMatchDto {
  @ApiProperty({
    example: {
      title: 'Frontend Developer',
      description: 'Build React user interfaces.',
      skills: 'React, JavaScript, REST API',
      experience: '2+ years',
      location: 'Remote',
      workplaceType: 'Remote',
    },
  })
  @IsObject()
  job: Record<string, any>;

  @ApiProperty({
    example: {
      fullName: 'Demo Seeker',
      skills: 'React, JavaScript, CSS',
      experience: '2 years',
      location: 'Dhaka',
      profileText: 'Frontend developer with React experience.',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  seekerProfile?: Record<string, any>;

  @ApiProperty({
    example: 'React, JavaScript, CSS',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  cvText?: string;
}
