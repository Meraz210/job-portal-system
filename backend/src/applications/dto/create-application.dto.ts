import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  jobId: number;
}
