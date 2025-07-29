'use server';

/**
 * @fileOverview A conversational AI coach named Elara.
 *
 * - chatWithElara - A function that handles the conversational chat with Elara.
 * - ChatWithElaraInput - The input type for the chatWithElara function.
 * - ChatWithElaraOutput - The return type for the chatWithElara function.
 */

import {ai} from '@/ai/genkit';
import {generate} from 'genkit/ai';
import {z} from 'genkit';

const ChatWithElaraInputSchema = z.object({
  userName: z.string().describe('The name of the user engaging with the AI.'),
  message: z.string().describe("The user's message to Elara."),
  history: z
    .array(z.any())
    .describe('The history of the conversation so far.'),
});
export type ChatWithElaraInput = z.infer<typeof ChatWithElaraInputSchema>;

const ChatWithElaraOutputSchema = z.object({
  reply: z.string().describe("Elara's response to the user."),
});
export type ChatWithElaraOutput = z.infer<typeof ChatWithElaraOutputSchema>;

export async function chatWithElara(
  input: ChatWithElaraInput
): Promise<ChatWithElaraOutput> {
  const {userName, message, history} = input;

  const systemPrompt = `You are Elara, an expert, friendly, and encouraging AI learning coach for the Code-X platform. Your goal is to provide personalized guidance, clarify concepts, and help users on their coding journey.

    - Your persona is supportive, patient, and knowledgeable.
    - When the conversation starts, greet the user by their name, "${userName}", and introduce yourself.
    - Ask clarifying questions to understand the user's needs before providing detailed explanations or learning plans.
    - Keep your responses concise and easy to understand.
    - If asked to create a learning plan, format it as a numbered or bulleted list.
    - You are a programming expert and can explain code, debug issues, and clarify complex topics.`;

  const model = 'googleai/gemini-2.0-flash';

  const response = await generate({
    model,
    system: systemPrompt,
    history,
    prompt: message,
  });

  return {reply: response.text};
}
