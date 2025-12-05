import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password } = registerDto;

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    verificationToken,
                    isVerified: false,
                },
            });

            try {
                await this.emailService.sendVerificationEmail(user.email, verificationToken);
            } catch (error) {
                console.error('Failed to send verification email:', error);
                // User is created but email failed - they can resend later
            }

            return {
                message: 'User created successfully. Please check your email to verify your account.',
                user: {
                    id: user.id,
                    email: user.email,
                },
            };
        } catch (error) {
            console.error(error);
            if (error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }
            throw error;
        }
    }

    async verifyEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            throw new BadRequestException('Invalid verification token');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
            },
        });

        return { message: 'Email verified successfully' };
    }

    async resendVerification(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('Email already verified');
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verificationToken },
        });

        try {
            await this.emailService.sendVerificationEmail(user.email, verificationToken);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw new BadRequestException('Failed to send verification email. Please try again later.');
        }

        return { message: 'Verification email sent' };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // To prevent enumeration, we can return success even if user not found, 
            // but for this project explicit errors might be better for dev.
            // Let's return success to mock security best practice
            return { message: 'If this email exists, a password reset link has been sent.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        try {
            await this.emailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            // Still return success to prevent email enumeration
            // In production, you might want to log this to a monitoring service
        }

        return { message: 'If this email exists, a password reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return { message: 'Password reset successfully' };
    }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Email not verified');
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
