import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { Application } from '../applications/entities/application.entity';

function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async findUsers() {
    const users = await this.userRepository.find({
      order: { id: 'DESC' },
    });

    return users.map(sanitizeUser);
  }

  async findJobs() {
    const jobs = await this.jobRepository.find({
      relations: ['createdBy'],
      order: { id: 'DESC' },
    });

    return jobs.map((job) => ({
      ...job,
      createdBy: job.createdBy
        ? sanitizeUser(job.createdBy)
        : job.createdBy,
    }));
  }

  async findApplications() {
    const applications =
      await this.applicationRepository.find({
        relations: ['applicant', 'job'],
        order: { id: 'DESC' },
      });

    return applications.map((application) => ({
      ...application,
      applicant: application.applicant
        ? sanitizeUser(application.applicant)
        : application.applicant,
    }));
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const jobs = await this.jobRepository.find({
      where: {
        createdBy: {
          id,
        },
      },
      relations: ['createdBy'],
    });
    const jobIds = jobs.map((job) => job.id);

    if (jobIds.length > 0) {
      await this.applicationRepository
        .createQueryBuilder()
        .delete()
        .where('jobId IN (:...jobIds)', { jobIds })
        .execute();
    }

    await this.applicationRepository
      .createQueryBuilder()
      .delete()
      .where('applicantId = :id', { id })
      .execute();

    await this.jobRepository
      .createQueryBuilder()
      .delete()
      .where('createdById = :id', { id })
      .execute();

    await this.userRepository.delete(id);

    return {
      message: 'User deleted successfully',
    };
  }

  async deleteJob(id: number) {
    const job = await this.jobRepository.findOne({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.applicationRepository
      .createQueryBuilder()
      .delete()
      .where('jobId = :id', { id })
      .execute();

    await this.jobRepository.delete(id);

    return {
      message: 'Job deleted successfully',
    };
  }
}
