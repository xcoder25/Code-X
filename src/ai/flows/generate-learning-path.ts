'use server';

/**
 * @fileOverview AI agent that generates personalized learning paths based on user input.
 *
 * - generateLearningPath - A function that generates a personalized learning path.
 * - LearningPathInput - The input type for the generateLearningPath function.
 * - LearningPathOutput - The return type for the generateLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningPathInputSchema = z.object({
  skillLevel: z
    .string()
    .describe('The user\'s current skill level (e.g., beginner, intermediate, advanced).'),
  interests: z.string().describe('The user\'s interests (e.g., web development, data science, AI).'),
  goals: z.string().describe('The user\'s learning goals (e.g., build a portfolio, get a job, learn a new skill).'),
});
export type LearningPathInput = z.infer<typeof LearningPathInputSchema>;

const LearningPathOutputSchema = z.object({
  learningPath: z.string().describe('A personalized learning path for the user.'),
});
export type LearningPathOutput = z.infer<typeof LearningPathOutputSchema>;

export async function generateLearningPath(input: LearningPathInput): Promise<LearningPathOutput> {
  return generateLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningPathPrompt',
  input: {schema: LearningPathInputSchema},
  output: {schema: LearningPathOutputSchema},
  prompt: `You are an expert learning path generator. You will generate a personalized learning path for the user based on their skill level, interests, and goals.

Skill Level: {{{skillLevel}}}
Interests: {{{interests}}}
Goals: {{{goals}}}

Personalized Learning Path:`,
});

const generateLearningPathFlow = ai.defineFlow(
  {
    name: 'generateLearningPathFlow',
    inputSchema: LearningPathInputSchema,
    outputSchema: LearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
