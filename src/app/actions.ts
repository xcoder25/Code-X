'use server';

import { generateLearningPath, LearningPathInput, LearningPathOutput } from '@/ai/flows/generate-learning-path';
import { analyzeCode, AnalyzeCodeInput, AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { z } from 'zod';

const learningPathFormSchema = z.object({
  skillLevel: z.string(),
  interests: z.string(),
  goals: z.string(),
});

export async function generateLearningPathAction(
  input: LearningPathInput
): Promise<LearningPathOutput> {
  const parsedInput = learningPathFormSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid input');
  }

  try {
    const output = await generateLearningPath(parsedInput.data);
    return output;
  } catch (error) {
    console.error('Error generating learning path:', error);
    return { title: '', path: '' };
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
