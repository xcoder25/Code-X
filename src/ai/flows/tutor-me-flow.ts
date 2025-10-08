'use server';

/**
 * @fileOverview An AI tutor for analyzing exam performance.
 *
 * - tutorMeAction - A function that handles the tutoring chat.
 * - TutorMeInput - The input type for the tutorMeAction function.
 * - TutorMeOutput - The return type for the tutorMeAction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  TutorMeInputSchema,
  TutorMeOutputSchema,
} from '@/app/schema';

export type {
  TutorMeInput,
  TutorMeOutput,
} from '@/app/schema';


const TutorSystemPromptTemplate = `You are an expert and friendly AI Tutor. Your role is to help a student, {{userName}}, understand their performance on an exam they just took titled "{{examTitle}}".

- **Initial Analysis (First Message Only):** If this is the start of the conversation (history is empty), you must begin by providing a brief, overall analysis of the student's answers. Then, give them a personalized, step-by-step study plan in Markdown format to help them improve on the topics they struggled with.
- **Conversational Follow-up:** For all subsequent messages, act as a helpful tutor. Answer the student's questions about the exam questions, their answers, or the underlying concepts. Be encouraging and clear in your explanations.
- **Your Persona:** Your name is Professor Alex. Be supportive, and never judgmental. Your goal is to build the student's confidence.

Here are the exam questions and the student's answers:
{{questionsAndAnswers}}
`;

const tutorMeFlow = ai.defineFlow({
    name: 'tutorMeFlow',
    inputSchema: TutorMeInputSchema,
    outputSchema: TutorMeOutputSchema,
}, async (input) => {
    const questionsAndAnswers = input.questions.map((q, index) => 
        `- Question ${index + 1}: ${q.text}\n- Student's Answer: ${input.studentAnswers[q.id] || '(No answer provided)'}`
    ).join('\n');

    const systemPrompt = TutorSystemPromptTemplate
        .replace('{{userName}}', input.userName)
        .replace('{{examTitle}}', input.examTitle)
        .replace('{{questionsAndAnswers}}', questionsAndAnswers);


    const prompt = `System: ${systemPrompt}

Previous conversation history:
${input.history.map(h => `${h.role}: ${h.content}`).join('\n')}

Current message from ${input.userName}: ${input.message}`;

    const llmResponse = await ai.generate({
<<<<<<< HEAD
        model: 'googleai/gemini-1.5-flash-latest',
        system: systemPrompt,
        history: input.history,
        prompt: input.message,
    });

    return { reply: llmResponse.text };
});
=======
      prompt: prompt,
      model: 'googleai/gemini-2.5-flash'
    });

    return {
        reply: llmResponse.text || "I'm sorry, I couldn't generate a response. Please try again."
    };
  }
);
>>>>>>> b7efc99ed47ef1222a03a4962b57786f3ae09296


export async function tutorMeAction(
  input: z.infer<typeof TutorMeInputSchema>
): Promise<z.infer<typeof TutorMeOutputSchema>> {
    return tutorMeFlow(input);
}
