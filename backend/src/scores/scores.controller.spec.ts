import { Test, TestingModule } from '@nestjs/testing';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';

describe('ScoresController', () => {
    let controller: ScoresController;
    let service: ScoresService;

    const mockScoresService = {
        getScores: jest.fn(),
        addScore: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ScoresController],
            providers: [
                {
                    provide: ScoresService,
                    useValue: mockScoresService,
                },
            ],
        }).compile();

        controller = module.get<ScoresController>(ScoresController);
        service = module.get<ScoresService>(ScoresService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getScores', () => {
        it('should return scores for a user and game', async () => {
            const mockRequest = { user: { userId: 1 } };
            const mockScores = [
                { id: 1, score: 100, game: 'tetris', date: '2023-01-01', time: '12:00', userId: 1 },
                { id: 2, score: 50, game: 'tetris', date: '2023-01-02', time: '14:00', userId: 1 },
            ];

            mockScoresService.getScores.mockResolvedValue(mockScores);

            const result = await controller.getScores(mockRequest, 'tetris');

            expect(service.getScores).toHaveBeenCalledWith(1, 'tetris');
            expect(result).toEqual(mockScores);
        });
    });

    describe('addScore', () => {
        it('should add a score with correct value', async () => {
            const mockRequest = { user: { userId: 1 } };
            const scoreData = { score: 150, game: 'snake', date: '2023-01-03', time: '16:00' };
            const createdScore = { id: 3, ...scoreData, userId: 1, createdAt: new Date() };

            mockScoresService.addScore.mockResolvedValue(createdScore);

            const result = await controller.addScore(mockRequest, scoreData);

            expect(service.addScore).toHaveBeenCalledWith(1, scoreData);
            expect(result).toEqual(createdScore);
        });

        it('should handle zero scores (edge case)', async () => {
            const mockRequest = { user: { userId: 1 } };
            const scoreData = { score: 0, game: 'tetris', date: '2023-01-04', time: '18:00' };
            const createdScore = { id: 4, ...scoreData, userId: 1, createdAt: new Date() };

            mockScoresService.addScore.mockResolvedValue(createdScore);

            const result = await controller.addScore(mockRequest, scoreData);

            expect(service.addScore).toHaveBeenCalledWith(1, scoreData);
            expect(result.score).toBe(0);
        });

        it('should handle large scores', async () => {
            const mockRequest = { user: { userId: 1 } };
            const scoreData = { score: 999999, game: 'tetris', date: '2023-01-05', time: '20:00' };
            const createdScore = { id: 5, ...scoreData, userId: 1, createdAt: new Date() };

            mockScoresService.addScore.mockResolvedValue(createdScore);

            const result = await controller.addScore(mockRequest, scoreData);

            expect(service.addScore).toHaveBeenCalledWith(1, scoreData);
            expect(result.score).toBe(999999);
        });
    });
});
