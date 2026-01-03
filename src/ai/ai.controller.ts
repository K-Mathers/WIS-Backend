import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { createSessionDto } from './dto/create-session.dto';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('session')
  createSession(@Request() req, @Body() dto: createSessionDto) {
    return this.aiService.createSession(req.user.id, dto.mode);
  }

  @Post('message')
  sentMessage(
    @Request() req,
    @Body('sessionId') sessionId,
    @Body('userText') userText,
  ) {
    const userId = req.user.id;
    return this.aiService.sendMessage(userId, sessionId, userText);
  }
}
