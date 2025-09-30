// This file only exports types/schemas; it will be imported by server code.
import { z } from 'zod';

export const GenerateContentInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate educational content.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The text of the multiple-choice question.'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  correctAnswerIndex: z.number().describe('The 0-based index of the correct answer in the options array.'),
});

export const GenerateContentOutputSchema = z.object({
  lessonPlan: z
    .string()
    .describe(
      'A detailed, structured lesson plan for the topic, formatted in Markdown. It should include learning objectives, key concepts, and a step-by-step teaching guide.'
    ),
  codeExample: z
    .string()
    .describe(
      'A clear and concise code example that illustrates the core concepts of the topic. The code should be well-commented and provided within a Markdown code block with the appropriate language identifier (e.g., ```python).'
    ),
  quizQuestion: QuizQuestionSchema.describe(
    'A multiple-choice quiz question to test understanding of the topic.'
  ),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;


