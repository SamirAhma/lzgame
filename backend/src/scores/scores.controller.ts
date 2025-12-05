import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoresController {
    constructor(private readonly scoresService: ScoresService) { }

    @Get(':game')
    getScores(@Request() req, @Param('game') game: string) {
        return this.scoresService.getScores(req.user.userId, game);
    }

    @Post()
    addScore(@Request() req, @Body() body: { score: number; game: string; date: string; time: string }) {
        return this.scoresService.addScore(req.user.userId, body);
    }
}
