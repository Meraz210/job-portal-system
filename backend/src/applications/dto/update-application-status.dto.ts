import {
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ['pending', 'accepted', 'rejected'],
    example: 'accepted',
  })
  @IsNotEmpty()
  @IsIn(['pending', 'accepted', 'rejected'])
  status: string;
}
