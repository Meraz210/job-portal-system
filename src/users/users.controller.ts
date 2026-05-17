import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';

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
}
