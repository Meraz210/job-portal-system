import { IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  company: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  salary: string;

  @IsNotEmpty()
  description: string;
}
