'use server';

import { chatWithElara, ChatWithElaraInput, ChatWithElaraOutput } from '@/ai/flows/ai-coach-flow';
import { analyzeCode, AnalyzeCodeInput, AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { z } from 'zod';

const chatWithElaraFormSchema = z.object({
  userName: z.string(),
  message: z.string(),
  history: z.array(z.any()),
});

export async function chatWithElaraAction(
  input: ChatWithElaraInput
): Promise<ChatWithElaraOutput> {
  const parsedInput = chatWithElaraFormSchema.safeParse(input);

  if (!parsedInput.success) {
    console.error('Invalid input:', parsedInput.error);
    throw new Error('Invalid input');
  }

  try {
    const output = await chatWithElara(parsedInput.data);
    return output;
  } catch (error) {
    console.error('Error chatting with Elara:', error);
    return { reply: 'Sorry, I encountered an error. Please try again.' };
  }
}


const analyzeCodeFormSchema = z.object({
  code: z.string(),
});

export async function analyzeCodeAction(
  input: AnalyzeCodeInput
): Promise<AnalyzeCodeOutput> {
    const parsedInput = analyzeCodeFormSchema.safeParse(input);

    if (!parsedInput.success) {
        throw new Error('Invalid input');
    }
    
    try {
        const output = await analyzeCode(parsedInput.data);
        return output;
    } catch (error) {
        console.error('Error analyzing code:', error);
        return { explanation: 'Sorry, an error occurred.', feedback: 'Please try again later.' };
    }
}
