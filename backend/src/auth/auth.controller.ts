import { Controller, Post, Body, UsePipes, UseGuards, Get, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @UsePipes(ZodValidationPipe)
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @UsePipes(ZodValidationPipe)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @UsePipes(ZodValidationPipe)
    refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshAccessToken(refreshTokenDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Request() req) {
        return this.authService.logout(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
