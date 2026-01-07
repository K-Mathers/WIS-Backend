import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { PromptGpt } from './prompts/prompt-gpt';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, OpenRouterProvider, PromptGpt, CloudinaryProvider],
})
export class AiModule { }
