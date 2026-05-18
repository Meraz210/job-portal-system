import {
  Body,
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Get,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

import { JwtGuard } from '../auth/jwt.guard';

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
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  apply(
    @Body() dto: CreateApplicationDto,
    @Req() req,
  ) {
    return this.applicationsService.apply(
      dto,
      req.user,
    );
  }

  @Post(':jobId')
  @ApiOperation({
    summary: 'Apply to a job by job id',
  })
  @ApiParam({
    name: 'jobId',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
  })
  applyToJob(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Req() req,
  ) {
    return this.applicationsService.applyToJob(
      jobId,
      req.user,
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
