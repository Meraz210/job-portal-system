import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class AiCoverLetterDto {
  @ApiProperty({
    example: {
      title: 'Frontend Developer',
      company: 'Tech Hive',
      description: 'Build and maintain React features.',
      skills: 'React, TypeScript, REST API',
    },
  })
  @IsObject()
  job: Record<string, any>;

  @ApiProperty({
    example: {
      fullName: 'Demo Seeker',
      email: 'seeker@example.com',
      skills: 'React, JavaScript, CSS',
      experience: '2 years',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  seekerProfile?: Record<string, any>;
}
