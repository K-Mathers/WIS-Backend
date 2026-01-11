import { ChatMode } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createSessionDto {
  @ApiProperty({ enum: ChatMode, description: 'Chat mode', example: 'just_chat' })
  @IsEnum(ChatMode)
  mode: ChatMode;
}
