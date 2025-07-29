'use server';

import { chatWithElara, ChatWithElaraInput, ChatWithElaraOutput } from '@/ai/flows/ai-coach-flow';
import { analyzeCode, AnalyzeCodeInput, AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { z } from 'zod';
import { exams as examData } from '@/lib/exam-data';
import { BaseMessage } from '@google/generative-ai';

const chatWithElaraFormSchema = z.object({
  userName: z.string(),
  message: z.string(),
  history: z.array(z.any()),
});

export async function chatWithElaraAction(
  input: ChatWithElaraInput
): Promise<ChatWithElaraOutput> {
  const parsedInput = chatWithElaraFormSchema.safeParse(input);

  if (!parsedInput.success) {
    console.error('Invalid input:', parsedInput.error);
    throw new Error('Invalid input');
  }

  try {
    // Convert generic message history to the format required by Firebase AI SDK
    const history: BaseMessage[] = input.history.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
    const output = await chatWithElara({ ...parsedInput.data, history });
    return output;
  } catch (error) {
    console.error('Error chatting with Elara:', error);
    return { reply: 'Sorry, I encountered an error. Please try again.' };
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

const submitExamFormSchema = z.object({
  examId: z.string(),
  answers: z.record(z.string()),
});

export async function submitExamAction(
  input: z.infer<typeof submitExamFormSchema>
): Promise<{ score: number }> {
  const parsedInput = submitExamForm-schema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid input');
  }
  
  const { examId, answers } = parsedInput.data;
  const exam = examData[examId as keyof typeof examData];

  if (!exam) {
    throw new Error('Exam not found');
  }

  let correctAnswers = 0;
  exam.questions.forEach((q: any) => {
    if (answers[q.id] === q.correctAnswer) {
      correctAnswers++;
    }
  });

  const score = (correctAnswers / exam.questions.length) * 100;
  return { score };
}
