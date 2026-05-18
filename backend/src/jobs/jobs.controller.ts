import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { Role } from '../users/enums/role.enum';

@Controller('jobs')
@ApiTags('Jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new job',
  })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully.',
  })
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
  @ApiOperation({
    summary: 'List jobs with optional search and filters',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Search title, company, description, or location.',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter jobs by location.',
  })
  @ApiQuery({
    name: 'company',
    required: false,
    description: 'Filter jobs by company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs returned successfully.',
  })
  findAll(
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('company') company?: string,
  ) {
    return this.jobsService.findAll({
      search,
      location,
      company,
    });
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Get('my-posted')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List jobs posted by the current employer',
  })
  @ApiResponse({
    status: 200,
    description: 'Employer jobs returned successfully.',
  })
  findMine(@Req() req) {
    return this.jobsService.findMine(req.user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a job by id',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Job returned successfully.',
  })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update an employer-owned job',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({ type: UpdateJobDto })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully.',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete an employer-owned job',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Job deleted successfully.',
  })
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
