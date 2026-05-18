import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Application } from './entities/application.entity';
import { Job } from '../jobs/entities/job.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async apply(
    jobId: number,
    user: any,
  ) {
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

  async findAll() {
    return this.applicationRepository.find({
      relations: ['applicant', 'job'],
    });
  }
}
