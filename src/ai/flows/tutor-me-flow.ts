'use server';

/**
 * @fileOverview An AI tutor for analyzing exam performance.
 *
 * - tutorMeAction - A function that handles the tutoring chat.
 * - TutorMeInput - The input type for the tutorMeAction function.
 * - TutorMeOutput - The return type for the tutorMeAction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import {
  TutorMeInputSchema,
  TutorMeOutputSchema,
} from '@/app/schema';

export type {
  TutorMeInput,
  TutorMeOutput,
} from '@/app/schema';


const TutorSystemPrompt = `You are an expert and friendly AI Tutor. Your role is to help a student, {{userName}}, understand their performance on an exam they just took titled "{{examTitle}}".

- **Initial Analysis (First Message Only):** If this is the start of the conversation (history is empty), you must begin by providing a brief, overall analysis of the student's answers. Then, give them a personalized, step-by-step study plan in Markdown format to help them improve on the topics they struggled with.
- **Conversational Follow-up:** For all subsequent messages, act as a helpful tutor. Answer the student's questions about the exam questions, their answers, or the underlying concepts. Be encouraging and clear in your explanations.
- **Your Persona:** Your name is Professor Alex. Be supportive, and never judgmental. Your goal is to build the student's confidence.

Here are the exam questions and the student's answers:
{{#each questions}}
- Question {{index}}: {{this.text}}
- Student's Answer: {{lookup ../studentAnswers this.id}}
{{/each}}
`;

const replaceHandlebars = (template: string, data: any) => {
    let output = template;
    for (const key in data) {
        if (key === 'questions') {
             const questionsText = data.questions.map((q: any, index: number) => 
                `- Question ${index + 1}: ${q.text}\n- Student's Answer: ${data.studentAnswers[q.id] || '(No answer provided)'}`
            ).join('\n');
            output = output.replace(/{{#each questions}}.*?{{\/each}}/s, questionsText);
        } else {
            const regex = new RegExp(`{{${key}}}`, 'g');
            output = output.replace(regex, data[key]);
        }
    }
    return output;
}


export async function tutorMeAction(
  input: z.infer<typeof TutorMeInputSchema>
): Promise<z.infer<typeof TutorMeOutputSchema>> {

    const systemPrompt = replaceHandlebars(TutorSystemPrompt, {
        userName: input.userName,
        examTitle: input.examTitle,
        questions: input.questions,
        studentAnswers: input.studentAnswers
    });

    const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        system: systemPrompt,
        history: input.history,
        prompt: input.message,
        output: {
            schema: TutorMeOutputSchema,
        },
    });

    return llmResponse.output!;
}
