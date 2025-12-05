import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getSettings(userId: number) {
        return this.prisma.setting.findUnique({
            where: { userId },
        });
    }

    async updateSettings(userId: number, data: { leftEyeColor: string; rightEyeColor: string; eyeDominance: string }) {
        return this.prisma.setting.upsert({
            where: { userId },
            update: data,
            create: {
                ...data,
                userId,
            },
        });
    }
}
