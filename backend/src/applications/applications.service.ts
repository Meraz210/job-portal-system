import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Application } from './entities/application.entity';
import { Job } from '../jobs/entities/job.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async apply(dto: CreateApplicationDto, user: any) {
    if (user.role !== Role.SEEKER) {
      throw new ForbiddenException(
        'Only seekers can apply for jobs',
      );
    }

    return this.applyToJob(dto.jobId, user);
  }

  async applyToJob(
    jobId: number,
    user: any,
  ) {
    if (user.role !== Role.SEEKER) {
      throw new ForbiddenException(
        'Only seekers can apply for jobs',
      );
    }

    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const existingApplication =
      await this.applicationRepository.findOne({
        where: {
          applicant: {
            id: user.userId,
          },
          job: {
            id: jobId,
          },
        },
        relations: ['applicant', 'job'],
      });

    if (existingApplication) {
      throw new BadRequestException(
        'You already applied to this job',
      );
    }

    const application =
      this.applicationRepository.create({
        applicant: {
          id: user.userId,
        },
        job: {
          id: jobId,
        },
      });

    return this.applicationRepository.save(
      application,
    );
  }

  async myApplications(user: any) {
    if (user.role !== Role.SEEKER) {
      throw new ForbiddenException(
        'Only seekers can view their applications',
      );
    }

    return this.applicationRepository.find({
      where: {
        applicant: {
          id: user.userId,
        },
      },
      relations: ['job'],
    });
  }

  async getApplicationsForJob(
    jobId: number,
    user: any,
  ) {
    if (user.role !== Role.EMPLOYER) {
      throw new ForbiddenException(
        'Only employers can view applicants',
      );
    }

    const job = await this.jobRepository.findOne({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const applications = await this.applicationRepository.find({
      where: {
        job: {
          id: jobId,
        },
      },
      relations: ['applicant', 'job'],
    });

    return applications.map((application) => ({
      ...application,
      applicant: {
        id: application.applicant.id,
        email: application.applicant.email,
        fullName: application.applicant.fullName,
        role: application.applicant.role,
      },
    }));
  }

  async findAll() {
    const applications = await this.applicationRepository.find({
      relations: ['applicant', 'job'],
    });

    return applications.map((application) => ({
      ...application,
      applicant: {
        id: application.applicant.id,
        email: application.applicant.email,
        fullName: application.applicant.fullName,
        role: application.applicant.role,
      },
    }));
  }
}
