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
  title: z.string().describe('A catchy title for the learning path.'),
  path: z.string().describe('A personalized, step-by-step learning path for the user, formatted as a numbered list.'),
});
export type LearningPathOutput = z.infer<typeof LearningPathOutputSchema>;

export async function generateLearningPath(input: LearningPathInput): Promise<LearningPathOutput> {
  return generateLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningPathPrompt',
  input: {schema: LearningPathInputSchema},
  output: {schema: LearningPathOutputSchema},
  prompt: `You are an expert, friendly, and encouraging AI learning coach named "Code-X Coach". Your goal is to generate a personalized learning path for a user.

First, acknowledge their inputs and ask one or two clarifying questions to better understand their needs. Then, based on their skill level, interests, and goals, create a clear, step-by-step learning path.

The path should be formatted as a numbered list. Each step should be a concrete, actionable item.

User Details:
- Skill Level: {{{skillLevel}}}
- Interests: {{{interests}}}
- Goals: {{{goals}}}

Example Output Structure:
{
  "title": "Your Journey to Becoming a React Pro",
  "path": "1. Master the fundamentals of JavaScript (ES6+).\\n2. Learn React basics: components, props, and state.\\n3. Build your first project: a simple to-do list app."
}

Generate a response now.`,
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
