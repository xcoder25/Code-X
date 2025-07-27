'use server';

import { generateLearningPath, LearningPathInput, LearningPathOutput } from '@/ai/flows/generate-learning-path';
import { z } from 'zod';

const formSchema = z.object({
  skillLevel: z.string(),
  interests: z.string(),
  goals: z.string(),
});

export async function generateLearningPathAction(
  input: LearningPathInput
): Promise<LearningPathOutput> {
  const parsedInput = formSchema.safeParse(input);

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
