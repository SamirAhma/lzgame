import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor(private configService: ConfigService) {
        this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
    }

    async sendVerificationEmail(email: string, token: string) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3002');
        const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

        await this.resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify your email address',
            html: `
                <h1>Verify your email</h1>
                <p>Click the link below to verify your email address:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
            `,
        });
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3002');
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

        await this.resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Reset your password',
            html: `
                <h1>Reset your password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `,
        });
    }
}
