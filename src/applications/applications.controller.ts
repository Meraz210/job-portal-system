import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';

import { ApplicationsService } from './applications.service';

import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { Role } from '../users/enums/role.enum';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SEEKER)
  @Post(':jobId')
  apply(
    @Param('jobId') jobId: string,
    @Req() req,
  ) {
    return this.applicationsService.apply(
      +jobId,
      req.user,
    );
  }

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }
}
