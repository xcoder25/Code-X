
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


export async function chatWithElara(
  input: ChatWithElaraInput,
  isLearningPathRequest: boolean = false
): Promise<ChatWithElaraOutput> {
  const { message, history } = input;
  
  const model = getGenerativeModel(ai, { 
    model: "gemini-1.5-flash",
    systemInstruction: isLearningPathRequest ? learningPathSystemInstruction : conversationalSystemInstruction,
  });

  // The SDK expects a `BaseMessage[]` with a specific format.
  // This maps the incoming history to the required format.
  const typedHistory: BaseMessage[] = (history || []).map((msg) => ({
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
