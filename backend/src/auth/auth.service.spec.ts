import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: registerDto.email,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        message: 'User created successfully',
        user: { id: mockUser.id, email: mockUser.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: expect.any(String),
        },
      });
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash('correctpassword', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token with valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        refreshToken: await bcrypt.hash(refreshToken, 10),
        refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwtService.verify.mockReturnValue({ sub: 1, email: 'test@example.com' });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_access_token');

      const result = await service.refreshAccessToken({ refreshToken });

      expect(result).toEqual({
        access_token: 'new_access_token',
      });
      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const refreshToken = 'expired_refresh_token';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        refreshToken: await bcrypt.hash(refreshToken, 10),
        refreshTokenExpiry: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwtService.verify.mockReturnValue({ sub: 1, email: 'test@example.com' });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.refreshAccessToken({ refreshToken })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const refreshToken = 'wrong_refresh_token';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        refreshToken: await bcrypt.hash('different_token', 10),
        refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwtService.verify.mockReturnValue({ sub: 1, email: 'test@example.com' });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.refreshAccessToken({ refreshToken })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user has no refresh token stored', async () => {
      const refreshToken = 'valid_refresh_token';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        refreshToken: null,
        refreshTokenExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwtService.verify.mockReturnValue({ sub: 1, email: 'test@example.com' });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.refreshAccessToken({ refreshToken })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token from database', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedPassword',
        refreshToken: null,
        refreshTokenExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.logout(userId);

      expect(result).toEqual({
        message: 'Logged out successfully',
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          refreshToken: null,
          refreshTokenExpiry: null,
        },
      });
    });
  });
});
