import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Support & Chat')
@ApiBearerAuth()
@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('chats')
  @ApiOperation({
    summary: 'Get active support chats & WebSocket Info',
    description: `
### WebSocket API (Socket.io)
**Endpoint:** \`ws://localhost:3000/support\`  
**Name:** \`/support\`

#### 1. Connection
Need token in auth object with handshake ex:
\`\`\`javascript
const socket = io("http://localhost:3000/support", {
  auth: { token: "Bearer <JWT_TOKEN>" }
});
\`\`\`

#### 2. Client (User) Events
- **emit** join_chat: Initialize session.
- **emit** send_message: {"content": "..."}
- **listen** chat_info: Returns chat details.
- **listen** message_history: Returns past messages.
- **listen** new_message: Real-time updates.

#### 3. Admin Events
- **emit** admin_join_chat: {"chatId": "uuid"}
- **emit** send_message: {"chatId": "uuid", "content": "..."}
- **listen** joined_room: Join confirmation.

---
`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of chats retrieved successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Admin role required.' })
  async getOpenchat() {
    return this.supportService.getOpenChats();
  }
}
