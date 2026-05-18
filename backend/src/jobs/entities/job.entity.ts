import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column()
  salary: string;

  @Column()
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  educationRequirement: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  experience: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  jobType: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  skills: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  deadline: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  vacancy: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  workplaceType: string | null;

  @ManyToOne(() => User)
  createdBy: User;
}
