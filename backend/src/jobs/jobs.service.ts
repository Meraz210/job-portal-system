import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async create(
    createJobDto: CreateJobDto,
    user: any,
  ) {
    const job = this.jobRepository.create({
      ...createJobDto,
      createdBy: {
        id: user.userId,
      },
    });

    return this.jobRepository.save(job);
  }

  async findAll() {
    return this.jobRepository.find();
  }

  async findOne(id: number) {
    return this.jobRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
  }

  async update(
    id: number,
    updateJobDto: UpdateJobDto,
    user: any,
  ) {
    const job = await this.findOne(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.createdBy.id !== user.userId) {
      throw new Error(
        'You can only update your own jobs',
      );
    }

    await this.jobRepository.update(
      id,
      updateJobDto,
    );

    return this.findOne(id);
  }

  async remove(id: number, user: any) {
    const job = await this.findOne(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.createdBy.id !== user.userId) {
      throw new Error(
        'You can only delete your own jobs',
      );
    }

    await this.jobRepository.delete(id);

    return {
      message: 'Job deleted successfully',
    };
  }
}
