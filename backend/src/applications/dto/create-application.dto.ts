import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @ApiProperty({
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  jobId: number;

  @ApiProperty({
    example: 'I am interested in this role because...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetter?: string;

  @ApiProperty({
    example: 'https://portfolio.example.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  portfolioUrl?: string;
}
