import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class AiApplicationSummaryDto {
  @ApiProperty({
    example: {
      applicant: {
        fullName: 'Demo Seeker',
        email: 'seeker@example.com',
      },
      coverLetter: 'I have React experience...',
      portfolioUrl: 'https://portfolio.example.com',
    },
  })
  @IsObject()
  application: Record<string, any>;

  @ApiProperty({
    example: {
      title: 'Frontend Developer',
      company: 'Tech Hive',
      description: 'Build React features.',
      skills: 'React, TypeScript',
    },
  })
  @IsObject()
  job: Record<string, any>;
}
