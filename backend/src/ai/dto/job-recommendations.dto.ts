import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AiJobRecommendationsDto {
  @ApiProperty({
    example: [
      {
        id: 1,
        title: 'Frontend Developer',
        company: 'Tech Hive',
        description: 'Build React user interfaces.',
        skills: 'React, JavaScript, REST API',
      },
    ],
  })
  @IsArray()
  jobs: Record<string, any>[];

  @ApiProperty({
    example: {
      fullName: 'Demo Seeker',
      skills: 'React, JavaScript, CSS',
      experience: '2 years',
      location: 'Dhaka',
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
