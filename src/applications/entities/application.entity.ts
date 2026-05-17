import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  applicant: User;

  @ManyToOne(() => Job)
  job: Job;
}
