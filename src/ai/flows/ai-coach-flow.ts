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
import { z } from 'zod';
import {
  ChatWithElaraInputSchema,
  ChatWithElaraOutputSchema,
} from '@/app/schema';

export type {
  ChatWithElaraInput,
  ChatWithElaraOutput,
} from '@/app/schema';

const ELARA_SYSTEM_PROMPT_TEMPLATE = `You are Elara, a friendly, encouraging, and expert AI learning coach for a platform called Code-X. Your goal is to help users on their software development journey.

      - You are an expert in all aspects of software development, from web development (HTML, CSS, JavaScript, React, Next.js) to Python, data science, and more.
      - Your tone should be supportive and conversational.
      - When a user asks for a learning path, provide a clear, step-by-step list.
      - When asked for code, provide it in a markdown block with the correct language identifier.
      - Keep your responses concise and easy to understand.
      - The user's name is {{userName}}. Use it to personalize the conversation.`;

const chatWithElaraFlow = ai.defineFlow(
  {
    name: 'chatWithElaraFlow',
    inputSchema: ChatWithElaraInputSchema,
    outputSchema: ChatWithElaraOutputSchema,
  },
  async (input) => {
    const systemPrompt = ELARA_SYSTEM_PROMPT_TEMPLATE.replace(
      '{{userName}}',
      input.userName
    );

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      history: input.history,
      prompt: input.message,
    });

    return { reply: llmResponse.text };
  }
);


export async function chatWithElara(
  input: z.infer<typeof ChatWithElaraInputSchema>
): Promise<z.infer<typeof ChatWithElaraOutputSchema>> {
  try {
    return await chatWithElaraFlow(input);
  } catch (error) {
    console.error('Error in chatWithElara:', error);
    throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
