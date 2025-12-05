import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
    score: {
        findMany: jest.fn(),
        create: jest.fn(),
    },
};

describe('ScoresService', () => {
    let service: ScoresService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScoresService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ScoresService>(ScoresService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getScores', () => {
        it('should return top 10 scores for a user and game', async () => {
            const userId = 1;
            const game = 'tetris';
            const mockScores = [{ id: 1, score: 100, userId, game, date: '2023-01-01', time: '12:00' }];

            (prisma.score.findMany as jest.Mock).mockResolvedValue(mockScores);

            const result = await service.getScores(userId, game);

            expect(prisma.score.findMany).toHaveBeenCalledWith({
                where: { userId, game },
                orderBy: { score: 'desc' },
                take: 10,
            });
            expect(result).toEqual(mockScores);
        });
    });

    describe('addScore', () => {
        it('should create a new score', async () => {
            const userId = 1;
            const scoreData = { score: 150, game: 'tetris', date: '2023-01-02', time: '14:00' };
            const mockCreatedScore = { id: 2, ...scoreData, userId };

            (prisma.score.create as jest.Mock).mockResolvedValue(mockCreatedScore);

            const result = await service.addScore(userId, scoreData);

            expect(prisma.score.create).toHaveBeenCalledWith({
                data: {
                    ...scoreData,
                    userId,
                },
            });
            expect(result).toEqual(mockCreatedScore);
        });
    });
});
