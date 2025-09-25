
'use server';

/**
 * @fileOverview A mock technical interview AI agent.
 *
 * - interviewPrep - A function that handles the mock interview chat.
 * - InterviewPrepInput - The input type for the interviewPrep function.
 * - InterviewPrepOutput - The return type for the interviewPrep function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import {
  InterviewPrepInputSchema,
  InterviewPrepOutputSchema,
} from '@/app/schema';

export type {
  InterviewPrepInput,
  InterviewPrepOutput,
} from '@/app/schema';


const InterviewerSystemPrompt = `You are a friendly and professional AI technical interviewer. Your role is to conduct a mock interview with the user based on the topic they have chosen.

- Your name is Alex.
- The user's name is {{userName}}.
- The interview topic is: {{topic}}.

Your task:
1. Start the conversation by introducing yourself and confirming the interview topic. Ask the user if they are ready to begin.
2. If this is not the first message, analyze the user's previous answer and provide brief, constructive feedback before asking the next question.
3. Ask one technical question at a time, relevant to the topic. Keep the questions appropriate for a junior to mid-level role.
4. Keep your responses and questions concise.
5. If the user doesn't know an answer, gently encourage them to try and then move on to the next question.
`;


export async function interviewPrep(
  input: z.infer<typeof InterviewPrepInputSchema>
): Promise<z.infer<typeof InterviewPrepOutputSchema>> {
    const systemPrompt = InterviewerSystemPrompt
        .replace('{{userName}}', input.userName)
        .replace('{{topic}}', input.topic);

    const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        system: systemPrompt,
        history: input.history,
        prompt: input.message,
        output: {
            schema: InterviewPrepOutputSchema,
        },
    });

    return llmResponse.output!;
}
