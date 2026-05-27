import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { AiService } from './ai.service';
import { AiJobMatchDto } from './dto/job-match.dto';
import { AiJobRecommendationsDto } from './dto/job-recommendations.dto';
import { AiCoverLetterDto } from './dto/cover-letter.dto';
import { AiApplicationSummaryDto } from './dto/application-summary.dto';

@ApiTags('ai')
@ApiBearerAuth('JWT-auth')
@Controller('ai')
@UseGuards(JwtGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('job-match')
  @Roles(Role.SEEKER)
  @ApiOperation({
    summary: 'Generate a local AI job match score for a seeker',
  })
  jobMatch(@Body() dto: AiJobMatchDto) {
    return this.aiService.createJobMatch(
      dto.job,
      dto.seekerProfile,
      dto.cvText,
    );
  }

  @Post('job-recommendations')
  @Roles(Role.SEEKER)
  @ApiOperation({
    summary: 'Generate local AI job recommendations for a seeker',
  })
  jobRecommendations(@Body() dto: AiJobRecommendationsDto) {
    return this.aiService.createJobRecommendations(
      dto.jobs,
      dto.seekerProfile,
      dto.cvText,
    );
  }

  @Post('cover-letter')
  @Roles(Role.SEEKER)
  @ApiOperation({
    summary: 'Generate an editable cover letter for a job',
  })
  coverLetter(@Body() dto: AiCoverLetterDto) {
    return this.aiService.createCoverLetter(
      dto.job,
      dto.seekerProfile,
    );
  }

  @Post('application-summary')
  @Roles(Role.EMPLOYER, Role.ADMIN)
  @ApiOperation({
    summary: 'Generate a local AI summary for an application',
  })
  applicationSummary(@Body() dto: AiApplicationSummaryDto) {
    return this.aiService.createApplicationSummary(
      dto.application,
      dto.job,
    );
  }
}
