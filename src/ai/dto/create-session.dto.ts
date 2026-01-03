import { ChatMode } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class createSessionDto {
  @IsEnum(ChatMode)
  mode: ChatMode;
}
