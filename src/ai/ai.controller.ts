import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
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

  @Get('sessions')
  getSessions(@Request() req) {
    return this.aiService.getSessions(req.user.id);
  }

  @Get('session/:id')
  getSessionId(@Request() req, @Param('id') sessionId: string) {
    return this.aiService.getSessionId(req.user.id, sessionId);
  }

  @Delete('session/:id')
  deleteSession(@Request() req, @Param('id') sessionId: string) {
    return this.aiService.deleteSession(req.user.id, sessionId);
  }

  @Patch('session/:id')
  editSessionName(
    @Request() req,
    @Param('id') sessionId: string,
    @Body('title') newTitle: string,
  ) {
    return this.aiService.editSessionName(req.user.id, sessionId, newTitle);
  }
}
