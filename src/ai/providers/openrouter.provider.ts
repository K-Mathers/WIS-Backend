import { Injectable } from '@nestjs/common';
import OpenAi from 'openai';

@Injectable()
export class OpenRouterProvider {
  private openai: OpenAi;

  constructor() {
    this.openai = new OpenAi({
      baseURL: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async askAiStream(systemPrompt: string, messages: any[], model?: string) {
    return this.openai.chat.completions.create({
      model: model || process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
    });
  }

  async askAi(systemPrompt: string, messages: any[], model?: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: model || process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: false,
    });

    return response.choices[0].message.content || '';
  }
}