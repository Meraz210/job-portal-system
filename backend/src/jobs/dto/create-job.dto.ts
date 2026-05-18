import { IsNotEmpty } from 'class-validator';
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
}
