import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
            },
        });
        return {
            message: 'User created successfully',
            user: { id: user.id, email: user.email },
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '3m' }); // 3 minutes for testing
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // 7 days

        // Hash and store refresh token
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days from now

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: hashedRefreshToken,
                refreshTokenExpiry,
            },
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refreshAccessToken(refreshTokenDto: RefreshTokenDto) {
        try {
            // Verify the refresh token
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

            // Find user by ID from token payload
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.refreshToken || !user.refreshTokenExpiry) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Check if refresh token has expired
            if (new Date() > user.refreshTokenExpiry) {
                throw new UnauthorizedException('Refresh token has expired');
            }

            // Verify the refresh token matches the stored hash
            const isRefreshTokenValid = await bcrypt.compare(
                refreshTokenDto.refreshToken,
                user.refreshToken,
            );

            if (!isRefreshTokenValid) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new access token
            const newPayload = { email: user.email, sub: user.id };
            const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '3m' }); // 3 minutes for testing

            return {
                access_token: newAccessToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async logout(userId: number) {
        // Clear refresh token from database
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshToken: null,
                refreshTokenExpiry: null,
            },
        });

        return {
            message: 'Logged out successfully',
        };
    }
}
