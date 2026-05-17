import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { Role } from '../users/enums/role.enum';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Post()
  create(
    @Body() createJobDto: CreateJobDto,
    @Req() req,
  ) {
    return this.jobsService.create(
      createJobDto,
      req.user,
    );
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req,
  ) {
    return this.jobsService.update(
      +id,
      updateJobDto,
      req.user,
    );
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.jobsService.remove(
      +id,
      req.user,
    );
  }
}
