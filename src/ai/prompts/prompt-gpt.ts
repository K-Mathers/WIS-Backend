import { Injectable } from '@nestjs/common';
import { ChatMode } from '@prisma/client';

export const sneakerPrompt = `
You are an AI sneaker assistant.

STRICT RULES:
- You ONLY answer questions about sneakers, footwear, brands, models, sizing, comfort, materials, styling, and prices.
- If the user asks about anything else (politics, movies, celebrities, coding, history, etc), you MUST respond with:
  "I can only help with sneakers and footwear."

BEHAVIOR:
- Be concise but helpful
- Recommend real sneaker models
- Ask clarifying questions if needed (budget, weather, usage)

You are NOT a general chatbot.
`;

@Injectable()
export class PromptGpt {
  async buildSystemPrompt(mode: ChatMode) {
    if (mode === ChatMode.STRICT) {
      return sneakerPrompt + '\nAnswer strictly and totally fact.';
    }

    if (mode === ChatMode.CREATIVE) {
      return sneakerPrompt + '\nAnswer creatively and friendly.';
    }

    return sneakerPrompt;
  }
}
