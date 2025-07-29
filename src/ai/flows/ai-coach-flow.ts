
'use server';

/**
 * @fileOverview A conversational AI coach named Elara, using the Firebase AI SDK.
 *
 * - chatWithElara - A function that handles the conversational chat with Elara.
 * - ChatWithElaraInput - The input type for the chatWithElara function.
 * - ChatWithElaraOutput - The return type for the chatWithElara function.
 */

import { z } from 'zod';
import { getAI, getGenerativeModel } from "firebase/ai";
import { app } from '@/lib/firebase';
import type { Message } from '@/components/ai-coach';
import type { BaseMessage } from '@google/generative-ai';


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

// Initialize the Gemini Developer API backend service
const ai = getAI(app);

// Create a `GenerativeModel` instance with a model that supports your use case
const model = getGenerativeModel(ai, { 
    model: "gemini-1.5-flash",
    systemInstruction: `You are Elara, an expert, friendly, and encouraging AI learning coach for the Code-X platform. Your goal is to provide personalized guidance, clarify concepts, and help users on their coding journey.

    - Your persona is supportive, patient, and knowledgeable.
    - When the conversation starts, if the history is empty, greet the user by their name and introduce yourself.
    - Ask clarifying questions to understand the user's needs before providing detailed explanations or learning plans.
    - Keep your responses concise and easy to understand.
    - If asked to create a learning plan, format it as a numbered or bulleted list.
    - You are a programming expert and can explain code, debug issues, and clarify complex topics.`
});


export async function chatWithElara(
  input: ChatWithElaraInput
): Promise<ChatWithElaraOutput> {
  const { message, history } = input;
  
  // The SDK expects a `BaseMessage[]` with a specific format.
  const typedHistory: BaseMessage[] = history.map((msg: Message) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
  }));
  
  const chat = model.startChat({
      history: typedHistory,
  });
  
  const result = await chat.sendMessage(message);
  const response = result.response;
  const text = response.text();

  return { reply: text };
}
