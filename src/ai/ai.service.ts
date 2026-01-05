import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ChatMode, ChatRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { PromptGpt } from './prompts/prompt-gpt';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private openRouter: OpenRouterProvider,
    private promptGpt: PromptGpt,
  ) {}

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

  async saveMessage(sessionId: string, role: ChatRole, content: string) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
  }

  async loadHistory(sessionId: string, limit: number) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async sendMessage(userId: string, sessionId: string, userText: string) {
    if (!userText || userText.trim().length === 0) {
      throw new BadRequestException('Message is empty');
    }

    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new BadRequestException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Forbidden');

    await this.saveMessage(sessionId, ChatRole.USER, userText);
    const history = await this.loadHistory(sessionId, 10);
    const aiMessages: { role: 'user' | 'assistant'; content: string }[] =
      history.map((m) => ({
        role: m.role === ChatRole.USER ? 'user' : 'assistant',
        content: m.content,
      }));

    const systemPrompt = await this.promptGpt.buildSystemPrompt(session.mode);
    const aiResponse = await this.openRouter.askAi(systemPrompt, aiMessages);
    await this.saveMessage(sessionId, ChatRole.ASSISTANT, aiResponse);

    return {
      answer: aiResponse,
      history,
    };
  }

  async getSessions(userId: string) {
    const sessions = await this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        mode: true,
        createdAt: true,
      },
    });

    return sessions;
  }
}
