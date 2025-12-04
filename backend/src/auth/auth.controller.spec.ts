import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshAccessToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = {
        message: 'User created successfully',
        user: { id: 1, email: registerDto.email },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshAccessToken', async () => {
      const refreshTokenDto = { refreshToken: 'refresh_token' };
      const expectedResult = { access_token: 'new_access_token' };

      mockAuthService.refreshAccessToken.mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const req = { user: { userId: 1 } };
      const expectedResult = { message: 'Logged out successfully' };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(req);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
    });
  });
});
