import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ChatMode, ChatRole } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { nameChatPrompt, PromptGpt } from './prompts/prompt-gpt';
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

  async saveMessage(
    sessionId: string,
    role: ChatRole,
    content: string | null,
    imageUrl?: string,
  ) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        imageUrl,
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

  async sendMessage(
    userId: string,
    sessionId: string,
    userText?: string,
    imageUrl?: string,
  ) {
    if ((!userText || userText.trim().length === 0) && !imageUrl) {
      throw new BadRequestException('Message must contain text or image');
    }

    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new BadRequestException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Forbidden');

    await this.saveMessage(
      sessionId,
      ChatRole.USER,
      userText || null,
      imageUrl,
    );

    if (session?.title === 'New chat' && userText) {
      const generatedTitle = await this.openRouter.askAi(nameChatPrompt, [
        { role: 'user', content: userText },
      ]);
      await this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: generatedTitle.replace(/"/g, '') },
      });
    }
    const history = await this.loadHistory(sessionId, 10);

    const aiMessages = history.map((m) => {
      const role: 'user' | 'assistant' =
        m.role === ChatRole.USER ? 'user' : 'assistant';
      if (m.imageUrl) {
        return {
          role,
          content: [
            { type: 'text', text: m.content || 'Image context' },
            { type: 'image_url', image_url: { url: m.imageUrl } },
          ],
        };
      }
      return {
        role,
        content: m.content,
      };
    });
    const needVision = aiMessages.some((m) => Array.isArray(m.content));
    const modelToUse = needVision
      ? process.env.OPENROUTER_VISION_MODEL
      : undefined;

    const systemPrompt = await this.promptGpt.buildSystemPrompt(session.mode);
    const aiResponse = await this.openRouter.askAi(
      systemPrompt,
      aiMessages,
      modelToUse,
    );
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

  async getSessionId(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) throw new BadRequestException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Forbidden');
    return session;
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new BadRequestException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Forbidden');

    await this.prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return { message: 'Delete session' };
  }

  async editSessionName(userId: string, sessionId: string, newTitle: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new BadRequestException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Forbidden');

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: newTitle },
    });

    return { message: 'Title updated', title: newTitle };
  }
}
