import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class sendMessageAi {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsOptional()
  userText?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}