import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from './enums/role.enum';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtGuard)
  getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @Get('employer')
  getEmployerData() {
    return {
      message: 'Welcome Employer',
    };
  }
}
