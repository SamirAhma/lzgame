import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let emailService: EmailService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
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
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user and send verification email', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: registerDto.email,
        password: 'hashedPassword',
        verificationToken: 'verificationToken',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual({
        message: 'User created successfully. Please check your email to verify your account.',
        user: { id: mockUser.id, email: mockUser.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: expect.any(String),
          verificationToken: expect.any(String),
          isVerified: false,
        },
      });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        registerDto.email,
        expect.any(String)
      );
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
        isVerified: true,
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
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if email is not verified', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Email not verified');
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

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'valid_token';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        verificationToken: token,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.verifyEmail(token);

      expect(result).toEqual({ message: 'Email verified successfully' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      await expect(service.verifyEmail('invalid_token')).rejects.toThrow(BadRequestException);
    });
  });


  describe('forgotPassword', () => {
    it('should send reset password email if email exists', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        email,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({ message: 'If this email exists, a password reset link has been sent.' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          resetToken: expect.any(String),
          resetTokenExpiry: expect.any(Date),
        },
      });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        email,
        expect.any(String),
      );
    });

    it('should return success message even if email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toEqual({ message: 'If this email exists, a password reset link has been sent.' });
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const token = 'valid_token';
      const newPassword = 'newPassword123';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        resetToken: token,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual({ message: 'Password reset successfully' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          password: expect.any(String),
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
    });

    it('should throw BadRequestException if token is invalid or expired', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      await expect(service.resetPassword('invalid_token', 'password')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendVerification', () => {
    it('should resend verification email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        email,
        isVerified: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.resendVerification(email);

      expect(result).toEqual({ message: 'Verification email sent' });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { verificationToken: expect.any(String) },
      });
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        email,
        expect.any(String)
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.resendVerification('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already verified', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        isVerified: true,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      await expect(service.resendVerification('test@example.com')).rejects.toThrow(BadRequestException);
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
