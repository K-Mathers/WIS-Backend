import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class sendMessageAi {
  @ApiProperty({ example: 'uuid-session-id', description: 'Session ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiPropertyOptional({ example: 'Hello AI', description: 'User message text' })
  @IsString()
  @IsOptional()
  userText?: string;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/...', description: 'Image URL for vision' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}