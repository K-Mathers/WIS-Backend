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

export const nameChatPrompt = `
Analyze the user's message and create a concise, 1-3 word title that captures the core topic.
Rules:
1. No punctuation (no periods, no quotes).
2. Use the same language as the user.
3. Be specific but brief (e.g., "Baking Bread" instead of "How to bake bread at home").
4. If the message is just a greeting or nonsense, use "General Conversation".
5. Return ONLY the title text.
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
