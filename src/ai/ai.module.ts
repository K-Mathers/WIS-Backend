import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { PromptGpt } from './prompts/prompt-gpt';

@Module({
  controllers: [AiController],
  providers: [AiService, OpenRouterProvider, PromptGpt],
})
export class AiModule {}
