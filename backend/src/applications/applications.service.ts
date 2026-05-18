import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Application,
  ApplicationStatus,
} from './entities/application.entity';
import { Job } from '../jobs/entities/job.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Role } from '../users/enums/role.enum';
import { MailService } from '../mail/mail.service';

const APPLICATION_STATUSES: ApplicationStatus[] = [
  'pending',
  'accepted',
  'rejected',
];

function sanitizeApplication(application: Application) {
  return {
    ...application,
    applicant: application.applicant
      ? {
          id: application.applicant.id,
          email: application.applicant.email,
          fullName: application.applicant.fullName,
          role: application.applicant.role,
        }
      : application.applicant,
    job: application.job
      ? {
          id: application.job.id,
          title: application.job.title,
          company: application.job.company,
          location: application.job.location,
          salary: application.job.salary,
          description: application.job.description,
        }
      : application.job,
  };
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private readonly mailService: MailService,
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
      relations: ['createdBy'],
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

    const savedApplication =
      await this.applicationRepository.save(
      application,
    );

    const applicationWithRelations =
      await this.applicationRepository.findOne({
        where: { id: savedApplication.id },
        relations: ['applicant', 'job', 'job.createdBy'],
      });

    if (applicationWithRelations?.job.createdBy?.email) {
      await this.mailService.sendApplicationSubmittedEmail({
        employerEmail:
          applicationWithRelations.job.createdBy.email,
        seekerName:
          applicationWithRelations.applicant.fullName,
        seekerEmail:
          applicationWithRelations.applicant.email,
        jobTitle: applicationWithRelations.job.title,
      });
    }

    return applicationWithRelations
      ? sanitizeApplication(applicationWithRelations)
      : savedApplication;
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

  async updateStatus(
    id: number,
    status: string,
    user: any,
  ) {
    if (user.role !== Role.EMPLOYER) {
      throw new ForbiddenException(
        'Only employers can update application status',
      );
    }

    if (
      !APPLICATION_STATUSES.includes(
        status as ApplicationStatus,
      )
    ) {
      throw new BadRequestException(
        'Status must be pending, accepted, or rejected',
      );
    }

    const application =
      await this.applicationRepository.findOne({
        where: { id },
        relations: ['applicant', 'job', 'job.createdBy'],
      });

    if (!application) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    if (application.job.createdBy.id !== user.userId) {
      throw new ForbiddenException(
        'You can only update applications for your own jobs',
      );
    }

    application.status = status as ApplicationStatus;

    const updatedApplication =
      await this.applicationRepository.save(
        application,
      );

    await this.mailService.sendApplicationStatusUpdatedEmail({
      seekerEmail: updatedApplication.applicant.email,
      seekerName: updatedApplication.applicant.fullName,
      jobTitle: updatedApplication.job.title,
      status: updatedApplication.status,
    });

    return sanitizeApplication(updatedApplication);
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
