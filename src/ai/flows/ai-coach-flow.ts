
'use server';

/**
 * @fileOverview A conversational AI coach named Elara.
 * This file implements the logic for a conversational AI agent using Genkit.
 *
 * - chatWithElara - A function that handles the conversational chat with Elara.
 * - ChatWithElaraInput - The input type for the chatWithElara function.
 * - ChatWithElaraOutput - The return type for the chatWithElara function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import {
  ChatWithElaraInputSchema,
  ChatWithElaraOutputSchema,
} from '@/app/schema';

export type {
  ChatWithElaraInput,
  ChatWithElaraOutput,
} from '@/app/schema';

const elaraSystemPrompt = ai.definePrompt(
  {
    name: 'elaraSystemPrompt',
    input: { schema: ChatWithElaraInputSchema },
    output: { schema: ChatWithElaraOutputSchema },
    prompt: `You are Elara, a friendly, encouraging, and expert AI learning coach for a platform called Code-X. Your goal is to help users on their software development journey.

      - You are an expert in all aspects of software development, from web development (HTML, CSS, JavaScript, React, Next.js) to Python, data science, and more.
      - Your tone should be supportive and conversational.
      - When a user asks for a learning path, provide a clear, step-by-step list.
      - When asked for code, provide it in a markdown block with the correct language identifier.
      - Keep your responses concise and easy to understand.
      - The user's name is {{userName}}. Use it to personalize the conversation.`,
  },
  async (input) => {
    // Note: The system prompt doesn't need to be dynamically constructed here.
    // The handlebars {{userName}} will be replaced by Genkit.
    // This function can be used for more complex prompt assembly if needed in the future.
    return {
      messages: [
        { role: 'system', content: '' }, // System prompt is now in the template.
        ...input.history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: 'user', content: input.message },
      ],
    };
  }
);


export async function chatWithElara(
  input: z.infer<typeof ChatWithElaraInputSchema>
): Promise<z.infer<typeof ChatWithElaraOutputSchema>> {

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: await elaraSystemPrompt(input),
    output: {
      schema: ChatWithElaraOutputSchema,
    },
  });

  return llmResponse.output!;
}
