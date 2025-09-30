'use server';
/**
 * @fileOverview An AI agent for generating educational content.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateContentInputSchema,
  GenerateContentOutputSchema,
  type GenerateContentInput,
  type GenerateContentOutput,
} from './ai-content-schemas';

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
  prompt: 'Generate the learning module for the topic: {{{topic}}}',
});

export async function generateContent(
  input: GenerateContentInput
): Promise<GenerateContentOutput> {
  const llmResponse = await contentGenerationPrompt(input);
  return llmResponse.output!;
}
