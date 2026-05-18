import {
  Body,
  BadRequestException,
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import {
  extname,
  join,
} from 'path';
import {
  existsSync,
  mkdirSync,
} from 'fs';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

import { JwtGuard } from '../auth/jwt.guard';

const allowedCvExtensions = ['.pdf', '.doc', '.docx'];
const cvUploadDirectory = join(
  process.cwd(),
  'uploads',
  'cv',
);

if (!existsSync(cvUploadDirectory)) {
  mkdirSync(cvUploadDirectory, { recursive: true });
}

const cvUploadInterceptor = FileInterceptor('cv', {
  storage: diskStorage({
    destination: cvUploadDirectory,
    filename: (_req, file, callback) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extname(file.originalname).toLowerCase()}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();

    if (!allowedCvExtensions.includes(extension)) {
      return callback(
        new BadRequestException(
          'Only PDF, DOC, or DOCX CV files are allowed',
        ),
        false,
      );
    }

    callback(null, true);
  },
});

@Controller('applications')
@UseGuards(JwtGuard)
@ApiTags('Applications')
@ApiBearerAuth('JWT-auth')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Apply to a job as a seeker',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['jobId', 'cv'],
      properties: {
        jobId: { type: 'number', example: 1 },
        cv: {
          type: 'string',
          format: 'binary',
        },
        coverLetter: {
          type: 'string',
          example: 'I am interested in this role.',
        },
        portfolioUrl: {
          type: 'string',
          example: 'https://portfolio.example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  @UseInterceptors(cvUploadInterceptor)
  apply(
    @Body() dto: CreateApplicationDto,
    @Req() req,
    @UploadedFile() cv?: Express.Multer.File,
  ) {
    return this.applicationsService.apply(
      dto,
      req.user,
      cv,
    );
  }

  @Post(':jobId')
  @ApiOperation({
    summary: 'Apply to a job by job id',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['cv'],
      properties: {
        cv: {
          type: 'string',
          format: 'binary',
        },
        coverLetter: {
          type: 'string',
          example: 'I am interested in this role.',
        },
        portfolioUrl: {
          type: 'string',
          example: 'https://portfolio.example.com',
        },
      },
    },
  })
  @ApiParam({
    name: 'jobId',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  @UseInterceptors(cvUploadInterceptor)
  applyToJob(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Body() dto: CreateApplicationDto,
    @Req() req,
    @UploadedFile() cv?: Express.Multer.File,
  ) {
    return this.applicationsService.applyToJob(
      jobId,
      req.user,
      dto,
      cv,
    );
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get current seeker applications',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications returned successfully.',
  })
  myApplications(@Req() req) {
    return this.applicationsService.myApplications(
      req.user,
    );
  }

  @Get('job/:jobId')
  @ApiOperation({
    summary: 'Get applicants for a job',
  })
  @ApiParam({
    name: 'jobId',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Applicants returned successfully.',
  })
  getApplicationsForJob(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Req() req,
  ) {
    return this.applicationsService.getApplicationsForJob(
      jobId,
      req.user,
    );
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update application status',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully.',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req,
  ) {
    return this.applicationsService.updateStatus(
      id,
      dto.status,
      req.user,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all applications',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications returned successfully.',
  })
  findAll() {
    return this.applicationsService.findAll();
  }
}
