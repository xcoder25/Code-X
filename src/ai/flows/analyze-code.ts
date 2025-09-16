'use server';

/**
 * @fileOverview An AI agent that analyzes and provides feedback on code snippets.
 *
 * - analyzeCode - A function that takes a code snippet and returns an analysis.
 * - AnalyzeCodeInput - The input type for the analyzeCode function.
 * - AnalyzeCodeOutput - The return type for the analyzeCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import { AnalyzeCodeInputSchema, AnalyzeCodeOutputSchema } from '@/app/schema';

export type { AnalyzeCodeInput, AnalyzeCodeOutput } from '@/app/schema';

const CodeAnalysisSystemPrompt = `You are an expert code reviewer. Your purpose is to provide a clear, concise, and constructive analysis of the provided code snippet.

Analyze the user's code for the following:
1.  **Explanation**: Briefly describe what the code does, its logic, and its flow.
2.  **Feedback**: Provide constructive feedback. Identify potential bugs, style issues, or areas for improvement in terms of best practices, performance, or readability. If the code is well-written, acknowledge its strengths before suggesting any minor improvements.

Your response must be in the structured JSON format defined by the output schema.`;

const codeAnalysisPrompt = ai.definePrompt({
  name: 'codeAnalysisPrompt',
  system: CodeAnalysisSystemPrompt,
  input: { schema: AnalyzeCodeInputSchema },
  output: { schema: AnalyzeCodeOutputSchema },
  prompt: 'Please analyze this code: \n\n```\n{{{code}}}\n```',
});

export async function analyzeCode(
  input: z.infer<typeof AnalyzeCodeInputSchema>
): Promise<z.infer<typeof AnalyzeCodeOutputSchema>> {
  const llmResponse = await codeAnalysisPrompt(input);
  return llmResponse.output!;
}
