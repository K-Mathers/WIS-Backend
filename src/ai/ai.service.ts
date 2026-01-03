import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ChatMode } from '@prisma/client';
import { error } from 'console';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async createSession(userId: string, mode: ChatMode) {
    const session = await this.prisma.chatSession.create({
      data: {
        userId,
        mode,
      },
    });

    return {
      sessionId: session.id,
      mode: session.mode,
      createdAt: session.createdAt,
    };
  }

  async sendMessage(userId: string, sessionId: string, userText: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new BadRequestException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Forbidden');

    
  }
}
