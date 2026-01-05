import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenRouterProvider {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  async askAi(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<string> {
    const response = await axios.post(
      this.apiUrl,
      {
        model: process.env.OPENROUTER_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}