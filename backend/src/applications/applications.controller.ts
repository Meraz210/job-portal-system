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

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';

import { JwtGuard } from '../auth/jwt.guard';

@Controller('applications')
@UseGuards(JwtGuard)
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  @Post()
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
  myApplications(@Req() req) {
    return this.applicationsService.myApplications(
      req.user,
    );
  }

  @Get('job/:jobId')
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
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Req() req,
  ) {
    return this.applicationsService.updateStatus(
      id,
      status,
      req.user,
    );
  }

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }
}
