import { IsString, IsUUID } from 'class-validator';

export class sendMessageAi {
  @IsUUID()
  sessionId: string;

  @IsString()
  userText: string;
}
