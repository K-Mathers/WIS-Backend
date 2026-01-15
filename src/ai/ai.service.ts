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
  ) { }

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

  async sendMessageStream(userId: string,
    sessionId: string,
    userText?: string,
    imageUrl?: string,) {
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
      const role = m.role === ChatRole.USER ? 'user' : 'assistant';
      if (m.imageUrl) {
        return {
          role,
          content: [
            { type: 'text', text: m.content || 'Image context' },
            { type: 'image_url', image_url: { url: m.imageUrl } },
          ],
        };
      }
      return { role, content: m.content };
    });

    const systemPrompt = await this.promptGpt.buildSystemPrompt(session.mode);
    const stream = await this.openRouter.askAiStream(systemPrompt, aiMessages);

    const service = this;
    async function* streamInterceptor() {
      let fullContent = '';
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullContent += content;
          yield chunk;
        }
      } finally {
        if (fullContent) {
          await service.saveMessage(sessionId, ChatRole.ASSISTANT, fullContent);
        }
      }
    }

    return streamInterceptor();
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
