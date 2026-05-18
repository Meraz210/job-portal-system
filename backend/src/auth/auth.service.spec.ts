import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: jest.Mock;
    findByEmail: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject duplicate registration emails', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
    });

    await expect(
      service.register({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'secret123',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('should hash password and create a new user', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 1,
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
    });
    jest
      .mocked(bcrypt.hash)
      .mockResolvedValue('hashed-password' as never);

    await service.register({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'secret123',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
    });
  });
});
