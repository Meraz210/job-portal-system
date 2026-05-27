import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { MailService } from '../mail/mail.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const PASSWORD_RESET_EXPIRES_MINUTES = 30;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      10,
    );

    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  async registerEmployer(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      10,
    );

    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: Role.EMPLOYER,
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(
      forgotPasswordDto.email,
    );

    if (!user) {
      return {
        message:
          'If an account exists for this email, password reset instructions have been sent.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    user.passwordResetTokenHash = this.hashResetToken(resetToken);
    user.passwordResetExpiresAt = new Date(
      Date.now() + PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000,
    );

    await this.usersService.save(user);

    const frontendUrl =
      process.env.FRONTEND_URL?.split(',')[0]?.trim() ||
      'http://localhost:5173';
    const resetUrl = `${frontendUrl}/?resetToken=${resetToken}`;

    await this.mailService.sendPasswordResetEmail({
      email: user.email,
      name: user.fullName || 'there',
      resetUrl,
      token: resetToken,
    });

    return {
      message:
        'If an account exists for this email, password reset instructions have been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const resetTokenHash = this.hashResetToken(resetPasswordDto.token);
    const user =
      await this.usersService.findByPasswordResetTokenHash(resetTokenHash);

    if (
      !user ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'Password reset token is invalid or expired.',
      );
    }

    user.password = await bcrypt.hash(resetPasswordDto.password, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    await this.usersService.save(user);

    return {
      message: 'Password reset successful. Please login with your new password.',
    };
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
