import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

export interface JobFilters {
  search?: string;
  location?: string;
  company?: string;
}

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

  async findAll(filters: JobFilters = {}) {
    const query =
      this.jobRepository.createQueryBuilder('job');

    const search = filters.search?.trim();
    const location = filters.location?.trim();
    const company = filters.company?.trim();

    if (search) {
      query.andWhere(
        '(LOWER(job.title) LIKE :search OR LOWER(job.company) LIKE :search OR LOWER(job.description) LIKE :search OR LOWER(job.location) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (location) {
      query.andWhere(
        'LOWER(job.location) LIKE :location',
        { location: `%${location.toLowerCase()}%` },
      );
    }

    if (company) {
      query.andWhere(
        'LOWER(job.company) LIKE :company',
        { company: `%${company.toLowerCase()}%` },
      );
    }

    return query.orderBy('job.id', 'DESC').getMany();
  }

  async findMine(user: any) {
    return this.jobRepository.find({
      where: {
        createdBy: {
          id: user.userId,
        },
      },
      relations: ['createdBy'],
      order: {
        id: 'DESC',
      },
    });
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
      throw new ForbiddenException(
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
      throw new ForbiddenException(
        'You can only delete your own jobs',
      );
    }

    await this.jobRepository.delete(id);

    return {
      message: 'Job deleted successfully',
    };
  }
}
