import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SupportService } from './support.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  namespace: 'support',
})
export class SupportGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly supportService: SupportService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      let token =
        client.handshake.auth.token || client.handshake.headers.authorization;

      if (!token && client.handshake.headers.cookie) {
        const cookies = client.handshake.headers.cookie.split(';');
        const tokenCookie = cookies.find((c) => c.trim().startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }

      if (!token || token === 'Bearer null') {
        client.disconnect();
        return;
      }

      const cleanToken = token.replace('Bearer ', '');
      const payload = this.jwtService.verify(cleanToken);

      client.data.user = { id: payload.sub, role: payload.role };
    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const chat = await this.supportService.findOrCreateChat(userId);
    const roomName = `support:${chat.id}`;

    await client.join(roomName);

    client.emit('chat_info', chat);
    const history = await this.supportService.getMessages(chat.id);
    client.emit('message_history', history);
  }

  @SubscribeMessage('admin_join_chat')
  async handleAdminJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string },
  ) {
    const roomName = `support:${payload.chatId}`;
    await client.join(roomName);

    const history = await this.supportService.getMessages(payload.chatId);
    client.emit('message_history', {
      chatId: payload.chatId,
      messages: history,
    });

    client.emit('joined_room', { chatId: payload.chatId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { content: string; chatId?: string },
  ) {
    if (!payload.content || payload.content.trim() === '') {
      console.log('Blocked empty message');
      return;
    }

    const user = client.data.user;
    let chatId = payload.chatId;
    const senderRole = user.role === 'ADMIN' ? Role.ADMIN : Role.USER;

    if (senderRole === Role.USER) {
      const chat = await this.supportService.findOrCreateChat(user.id);
      chatId = chat.id;
    }

    if (!chatId) return;

    const message = await this.supportService.saveMessage(
      chatId,
      senderRole,
      payload.content,
    );
    const roomName = `support:${chatId}`;
    this.server.to(roomName).emit('new_message', message);
  }
}
