
'use server';

/**
 * @fileOverview A conversational AI coach named Elara, using Genkit.
 *
 * - chatWithElara - A function that handles the conversational chat with Elara.
 * - ChatWithElaraInput - The input type for the chatWithElara function.
 * - ChatWithElaraOutput - The return type for the chatWithElara function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { MessageData } from 'genkit';

const ChatWithElaraInputSchema = z.object({
  userName: z.string().describe('The name of the user engaging with the AI.'),
  message: z.string().describe("The user's message to Elara."),
  history: z
    .array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    }))
    .describe('The history of the conversation so far.'),
});
export type ChatWithElaraInput = z.infer<typeof ChatWithElaraInputSchema>;

const ChatWithElaraOutputSchema = z.object({
  reply: z.string().describe("Elara's response to the user."),
});
export type ChatWithElaraOutput = z.infer<typeof ChatWithElaraOutputSchema>;

const conversationalSystemInstruction = `You are Elara, an expert, friendly, and encouraging AI learning coach for the Code-X platform. Your goal is to provide personalized guidance, clarify concepts, and help users on their coding journey.

    - Your persona is supportive, patient, and knowledgeable.
    - DO NOT greet the user or introduce yourself. The user interface already handles the initial greeting. Jump directly into a helpful response.
    - Keep your responses concise and easy to understand.
    - You are a programming expert and can explain code, debug issues, and clarify complex topics.`;
    
const learningPathSystemInstruction = `You are an expert curriculum planner. Your task is to generate a structured, step-by-step learning path based on a user's goal.

- The output MUST be a numbered list.
- Each step should be a clear, actionable item.
- Do not include any introductory or concluding text, only the numbered list.
- Start directly with "1.".`;

const chatPrompt = ai.definePrompt({
    name: 'chatWithElaraPrompt',
    input: { schema: ChatWithElaraInputSchema },
    output: { schema: ChatWithElaraOutputSchema },
    prompt: (input) => {
        const isLearningPath = input.message.toLowerCase().includes('learning path');
        
        const history: MessageData[] = (input.history || []).map(msg => ({
            role: msg.role,
            content: [{ text: msg.content }],
        }));
        
        const messages: MessageData[] = [
            {
                role: 'system',
                content: [{ text: isLearningPath ? learningPathSystemInstruction : conversationalSystemInstruction }],
            },
            ...history,
            {
                role: 'user',
                content: [{ text: `My name is ${input.userName}. ${input.message}` }],
            }
        ];
        return messages;
    },
    // We can't use `model` and `prompt` together, so we'll pass the model in the flow.
});


const chatWithElaraFlow = ai.defineFlow(
  {
    name: 'chatWithElaraFlow',
    inputSchema: ChatWithElaraInputSchema,
    outputSchema: ChatWithElaraOutputSchema,
  },
  async (input) => {
    const { output } = await chatPrompt(input, {
        model: 'googleai/gemini-1.5-flash',
    });
    return { reply: output!.reply };
  }
);


export async function chatWithElara(
  input: ChatWithElaraInput,
): Promise<ChatWithElaraOutput> {
  return await chatWithElaraFlow(input);
}
