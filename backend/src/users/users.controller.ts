import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from './enums/role.enum';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile.',
  })
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current authenticated user.',
  })
  getMe(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Get('employer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get employer-only data',
  })
  @ApiResponse({
    status: 200,
    description: 'Employer-only response.',
  })
  getEmployerData() {
    return {
      message: 'Welcome Employer',
    };
  }
}
