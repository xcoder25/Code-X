
'use server';

import { chatWithElara, ChatWithElaraInput, ChatWithElaraOutput } from '@/ai/flows/ai-coach-flow';
import { analyzeCode, AnalyzeCodeInput, AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { exams as examData } from '@/lib/exam-data';

const chatWithElaraFormSchema = z.object({
  userName: z.string(),
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
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
    // When generating a learning path, we can simplify the system prompt
    const isLearningPathRequest = parsedInput.data.message.includes('Create a learning path');
    
    const output = await chatWithElara(parsedInput.data, isLearningPathRequest);
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
  const parsedInput = submitExamFormSchema.safeParse(input);

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

const sendNotificationFormSchema = z.object({
  title: z.string(),
  message: z.string(),
});

export async function sendNotificationAction(
  input: z.infer<typeof sendNotificationFormSchema>
) {
    const parsedInput = sendNotificationFormSchema.safeParse(input);

    if (!parsedInput.success) {
        throw new Error('Invalid input for notification');
    }

    try {
        await addDoc(collection(db, 'notifications'), {
            title: parsedInput.data.title,
            description: parsedInput.data.message,
            createdAt: serverTimestamp(),
            readBy: [], // Used to track which users have read it
            type: 'announcement', // Example type
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        throw new Error('Could not send notification.');
    }
}
