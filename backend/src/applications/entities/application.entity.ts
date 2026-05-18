import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';

export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected';

@Entity()
@Unique(['applicant', 'job'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    default: 'pending',
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  applicant: User;

  @ManyToOne(() => Job)
  job: Job;
}
