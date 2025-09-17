'use server';
/**
 * @fileOverview An AI agent for generating educational content.
 *
 * - generateContent - A function that handles course content generation.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateContentInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate educational content.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe("The text of the multiple-choice question."),
    options: z.array(z.string()).describe("An array of 4 possible answers."),
    correctAnswerIndex: z.number().describe("The 0-based index of the correct answer in the options array.")
});

export const GenerateContentOutputSchema = z.object({
  lessonPlan: z.string().describe("A detailed, structured lesson plan for the topic, formatted in Markdown. It should include learning objectives, key concepts, and a step-by-step teaching guide."),
  codeExample: z.string().describe("A clear and concise code example that illustrates the core concepts of the topic. The code should be well-commented and provided within a Markdown code block with the appropriate language identifier (e.g., ```python)."),
  quizQuestion: QuizQuestionSchema.describe("A multiple-choice quiz question to test understanding of the topic.")
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;


const generatorSystemPrompt = `You are an expert curriculum developer for a software development academy. Your task is to generate a complete learning module for a given topic.

For the user-provided topic, you must generate three things:
1.  A comprehensive lesson plan in Markdown format. This should be structured with clear learning objectives, key concepts, and a step-by-step guide.
2.  A practical, well-commented code example in a Markdown block with the correct language identifier.
3.  A single, relevant multiple-choice quiz question with four options and a clearly identified correct answer.

Your output must be in the structured JSON format defined by the output schema.`;


const contentGenerationPrompt = ai.definePrompt({
    name: 'contentGenerationPrompt',
    system: generatorSystemPrompt,
    input: { schema: GenerateContentInputSchema },
    output: { schema: GenerateContentOutputSchema },
    prompt: 'Generate the learning module for the topic: {{{topic}}}'
});


export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
    const llmResponse = await contentGenerationPrompt(input);
    return llmResponse.output!;
}
