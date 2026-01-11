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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { createSessionDto } from './dto/create-session.dto';
import { sendMessageAi } from './dto/send-message.dto';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('ai')
@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService, private readonly cloudinaryProvider: CloudinaryProvider) { }

  @ApiOperation({ summary: 'Create new chat session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  @Post('session')
  createSession(@Request() req, @Body() dto: createSessionDto) {
    return this.aiService.createSession(req.user.id, dto.mode);
  }

  @ApiOperation({ summary: 'Send message to AI' })
  @ApiResponse({ status: 200, description: 'AI response with history' })
  @Post('message')
  sendMessage(@Request() req, @Body() dto: sendMessageAi) {
    return this.aiService.sendMessage(req.user.id, dto.sessionId, dto.userText, dto.imageUrl);
  }

  @ApiOperation({ summary: 'Upload image for vision analysis' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded', schema: { example: { imageUrl: 'url' } } })
  @Post("upload")
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.cloudinaryProvider.uploadFile(file);
    return { imageUrl: url };
  }

  @ApiOperation({ summary: 'Get all user sessions' })
  @ApiResponse({ status: 200, description: 'List of sessions' })
  @Get('sessions')
  getSessions(@Request() req) {
    return this.aiService.getSessions(req.user.id);
  }

  @ApiOperation({ summary: 'Get specific session details' })
  @ApiResponse({ status: 200, description: 'Session details with messages' })
  @Get('session/:id')
  getSessionId(@Request() req, @Param('id') sessionId: string) {
    return this.aiService.getSessionId(req.user.id, sessionId);
  }

  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({ status: 200, description: 'Session deleted' })
  @Delete('session/:id')
  deleteSession(@Request() req, @Param('id') sessionId: string) {
    return this.aiService.deleteSession(req.user.id, sessionId);
  }

  @ApiOperation({ summary: 'Rename channel/session' })
  @ApiBody({ schema: { type: 'object', properties: { title: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Session renamed' })
  @Patch('session/:id')
  editSessionName(
    @Request() req,
    @Param('id') sessionId: string,
    @Body('title') newTitle: string,
  ) {
    return this.aiService.editSessionName(req.user.id, sessionId, newTitle);
  }
}
