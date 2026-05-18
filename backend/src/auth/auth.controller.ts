import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a job seeker',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Job seeker registered successfully.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto,
    );
  }

  @Post('register/employer')
  @ApiOperation({
    summary: 'Register an employer',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Employer registered successfully.',
  })
  registerEmployer(@Body() registerDto: RegisterDto) {
    return this.authService.registerEmployer(
      registerDto,
    );
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login and receive a JWT access token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
