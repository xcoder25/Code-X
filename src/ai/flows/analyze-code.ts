'use server';

/**
 * @fileOverview An AI agent that analyzes and provides feedback on code snippets.
 *
 * - analyzeCode - A function that takes a code snippet and returns an analysis.
 * - AnalyzeCodeInput - The input type for the analyzeCode function.
 * - AnalyzeCodeOutput - The return type for the analyzeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

const AnalyzeCodeOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of what the code does.'),
  feedback: z.string().describe('Suggestions for improvement, bug fixes, or best practices.'),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;

export async function analyzeCode(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
  return analyzeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCodePrompt',
  input: {schema: AnalyzeCodeInputSchema},
  output: {schema: AnalyzeCodeOutputSchema},
  prompt: `You are an expert code reviewer and AI assistant. Your task is to analyze the following code snippet and provide a clear explanation and constructive feedback.

Task:
1.  **Explain the Code**: Describe what the code is intended to do. Explain the logic and flow.
2.  **Provide Feedback**: Identify any potential bugs, style issues, or areas for improvement. Suggest specific changes and explain why they are better. If the code is good, acknowledge it.

Code to analyze:
\`\`\`
{{{code}}}
\`\`\`

Generate your analysis now.`,
});


const analyzeCodeFlow = ai.defineFlow(
  {
    name: 'analyzeCodeFlow',
    inputSchema: AnalyzeCodeInputSchema,
    outputSchema: AnalyzeCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
