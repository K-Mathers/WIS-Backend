import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { createSessionDto } from './dto/create-session.dto';
import { sendMessageAi } from './dto/send-message.dto';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('session')
  createSession(@Request() req, @Body() dto: createSessionDto) {
    return this.aiService.createSession(req.user.id, dto.mode);
  }

  @Post('message')
  sendMessage(@Request() req, @Body() dto: sendMessageAi) {
    return this.aiService.sendMessage(req.user.id, dto.sessionId, dto.userText);
  }

  @Get("sessions")
  getSessions(@Request() req) {
    return this.aiService.getSessions(req.user.id)
  }
}
