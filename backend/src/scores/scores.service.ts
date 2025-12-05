import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScoresService {
    constructor(private prisma: PrismaService) { }

    async getScores(userId: number, game: string) {
        return this.prisma.score.findMany({
            where: {
                userId,
                game,
            },
            orderBy: {
                score: 'desc',
            },
            take: 10,
        });
    }

    async addScore(userId: number, data: { score: number; game: string; date: string; time: string }) {
        // --- MODIFICATION HERE: Do not save if the score is 0 ---
        if (data.score === 0) {
            console.log(`Score of 0 rejected for userId: ${userId}, game: ${data.game}`);
            return null; // Return null or a meaningful response indicating rejection
        }
        return this.prisma.score.create({
            data: {
                ...data,
                userId,
            },
        });
    }
}
