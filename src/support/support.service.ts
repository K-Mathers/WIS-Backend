import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Role, StatusChat } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SupportService {
    constructor(private readonly prisma: PrismaService) { }

    async findOrCreateChat(userId: string) {
        let chat = await this.prisma.supportChat.findFirst({
            where: { userId, status: StatusChat.OPEN },
        });

        if (!chat) {
            chat = await this.prisma.supportChat.create({
                data: {
                    userId,
                    status: StatusChat.OPEN,
                },
            });
        }
        return chat;
    }

    async getOpenChats() {
        return this.prisma.supportChat.findMany({
            where: { status: StatusChat.OPEN },
            include: {
                user: {
                    select: { email: true }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async saveMessage(chatId: string, role: Role, content: string) {
        return this.prisma.supportMessage.create({
            data: {
                chatId,
                senderRole: role,
                content,
            },
        });
    }

    async validateChatAccess(chatId: string, userId: string) {
        const chat = await this.prisma.supportChat.findUnique({
            where: { id: chatId },
        });
        if (!chat) throw new NotFoundException('Chat not found');
        if (chat.userId !== userId) {
            throw new ForbiddenException("Don't have access");
        }
        return chat;
    }

    async getMessages(chatId: string) {
        return this.prisma.supportMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
        });
    }
}
