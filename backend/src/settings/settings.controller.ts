import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    getSettings(@Request() req) {
        return this.settingsService.getSettings(req.user.userId);
    }

    @Put()
    updateSettings(@Request() req, @Body() body: { leftEyeColor: string; rightEyeColor: string; eyeDominance: string }) {
        return this.settingsService.updateSettings(req.user.userId, body);
    }
}
