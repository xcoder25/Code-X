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

// We still keep the system prompt template
const ELARA_SYSTEM_PROMPT_TEMPLATE = `You are Elara, a friendly, encouraging, and expert AI learning coach for a platform called Code-X. Your goal is to help users on their software development journey.

      - You are an expert in all aspects of software development, from web development (HTML, CSS, JavaScript, React, Next.js) to Python, data science, and more.
      - Your tone should be supportive and conversational.
      - When a user asks for a learning path, provide a clear, step-by-step list.
      - When asked for code, provide it in a markdown block with the correct language identifier.
      - Keep your responses concise and easy to understand.
      - The user's name is {{userName}}. Use it to personalize the conversation.`;

//
// We no longer need ai.definePrompt here.
// We will call ai.generate directly from within the function.
//

export async function chatWithElara(
  input: z.infer<typeof ChatWithElaraInputSchema>
): Promise<z.infer<typeof ChatWithElaraOutputSchema>> {
  
  try {
    // 1. Render the system prompt string
    const systemPrompt = ELARA_SYSTEM_PROMPT_TEMPLATE.replace(
      '{{userName}}',
      input.userName
    );

    // 2. Call ai.generate with updated syntax
    const prompt = `System: ${systemPrompt}

Conversation history:
${(input.history || []).map(h => `${h.role}: ${h.content}`).join('\n')}

Current message from ${input.userName}: ${input.message}`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash'
    });

    return {
      reply: llmResponse.text || "I'm sorry, I couldn't generate a response. Please try again."
    };
  } catch (error) {
    console.error('Error in chatWithElara:', error);
    throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}