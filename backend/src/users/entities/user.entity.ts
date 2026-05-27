import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from '../enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  passwordResetTokenHash: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt: Date | null;

  @Column()
  fullName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.SEEKER,
  })
  role: Role;
}
