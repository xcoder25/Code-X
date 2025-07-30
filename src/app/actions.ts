'use server';

// ──────────────────────────────────────
// Imports
// ──────────────────────────────────────
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { z } from 'zod';

import {
  chatWithElara,
  ChatWithElaraInput,
  ChatWithElaraOutput,
} from '@/ai/flows/ai-coach-flow';

import {
  analyzeCode,
  AnalyzeCodeInput,
  AnalyzeCodeOutput,
} from '@/ai/flows/analyze-code';

import { exams as examData } from '@/lib/exam-data';

// ──────────────────────────────────────
// 1. Chat with Elara
// ──────────────────────────────────────
const chatWithElaraFormSchema = z.object({
  userName: z.string(),
  message: z.string(),
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    }),
  ),
});

export async function chatWithElaraAction(
  input: ChatWithElaraInput,
): Promise<ChatWithElaraOutput> {
  const parsed = chatWithElaraFormSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  const isLearningPathRequest = parsed.data.message.includes('Create a learning path');

  try {
    const response = await chatWithElara(parsed.data, isLearningPathRequest);
    return response;
  } catch (error) {
    console.error('Error chatting with Elara:', error);
    return {
      reply: 'Sorry, I encountered an error. Please try again.',
    };
  }
}

// ──────────────────────────────────────
// 2. Analyze Code
// ──────────────────────────────────────
const analyzeCodeFormSchema = z.object({
  code: z.string(),
});

export async function analyzeCodeAction(
  input: AnalyzeCodeInput,
): Promise<AnalyzeCodeOutput> {
  const parsed = analyzeCodeFormSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  try {
    return await analyzeCode(parsed.data);
  } catch (error) {
    console.error('Error analyzing code:', error);
    return {
      explanation: 'Sorry, an error occurred.',
      feedback: 'Please try again later.',
    };
  }
}

// ──────────────────────────────────────
// 3. Submit Exam
// ──────────────────────────────────────
const submitExamFormSchema = z.object({
  examId: z.string(),
  answers: z.record(z.string()),
});

export async function submitExamAction(
  input: z.infer<typeof submitExamFormSchema>,
): Promise<{ score: number }> {
  const parsed = submitExamFormSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  const { examId, answers } = parsed.data;
  const exam = examData[examId as keyof typeof examData];
  if (!exam) throw new Error('Exam not found');

  let correctAnswers = 0;
  exam.questions.forEach((q: any) => {
    if (answers[q.id] === q.correctAnswer) correctAnswers++;
  });

  const score = (correctAnswers / exam.questions.length) * 100;
  return { score };
}

// ──────────────────────────────────────
// 4. Send Notification
// ──────────────────────────────────────
const sendNotificationFormSchema = z
  .object({
    title: z.string().min(3),
    message: z.string().min(10),
    targetType: z.enum(['general', 'course', 'user']),
    courseId: z.string().optional(),
    userId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.targetType === 'course') return !!data.courseId;
      if (data.targetType === 'user') return !!data.userId;
      return true;
    },
    {
      message: 'A course or user ID is required based on target type.',
      path: ['courseId'],
    },
  );

export async function sendNotificationAction(
  input: z.infer<typeof sendNotificationFormSchema>,
): Promise<void> {
  const parsed = sendNotificationFormSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid notification input');

  const { title, message, targetType, courseId, userId } = parsed.data;

  const target: any = { type: targetType };
  if (targetType === 'course' && courseId) {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (courseDoc.exists()) {
      target.courseId = courseId;
      target.courseTitle = courseDoc.data().title;
    }
  } else if (targetType === 'user' && userId) {
    target.userId = userId;
  }

  try {
    await addDoc(collection(db, 'notifications'), {
      title,
      description: message,
      createdAt: serverTimestamp(),
      readBy: [],
      type: 'announcement',
      target,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Could not send notification.');
  }
}

// ──────────────────────────────────────
// 5. Create Course
// ──────────────────────────────────────
const createCourseFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.string().min(1),
  modules: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        url: z.string(),
      }),
    )
    .optional(),
});

export async function createCourseAction(
  values: z.infer<typeof createCourseFormSchema>,
): Promise<{ success: boolean; courseId?: string }> {
  const parsed = createCourseFormSchema.safeParse(values);
  if (!parsed.success) throw new Error('Invalid input for course');

  try {
    const ref = doc(collection(db, 'courses'));
    await setDoc(ref, {
      id: ref.id,
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags.split(',').map((tag) => tag.trim()),
      status: 'Draft',
      enrollments: 0,
      createdAt: serverTimestamp(),
      modules: parsed.data.modules || [],
    });

    return { success: true, courseId: ref.id };
  } catch (error: any) {
    console.error('Error creating course:', error);
    throw new Error(`Could not create course: ${error.message}`);
  }
}

// ──────────────────────────────────────
// 6. Generate Access Codes
// ──────────────────────────────────────
const generateCodesFormSchema = z.object({
  courseId: z.string().min(1),
  prefix: z.string().optional(),
  quantity: z.number().min(1).max(100),
  maxRedemptions: z.number().min(1),
});

export async function generateAccessCodesAction(
  values: z.infer<typeof generateCodesFormSchema>,
): Promise<{ success: boolean; count: number }> {
  const parsed = generateCodesFormSchema.safeParse(values);
  if (!parsed.success) throw new Error('Invalid input for generating codes');

  const { courseId, prefix, quantity, maxRedemptions } = parsed.data;

  const courseDoc = await getDoc(doc(db, 'courses', courseId));
  if (!courseDoc.exists()) {
    throw new Error('Course does not exist');
  }

  const courseTitle = courseDoc.data().title;
  const generatedCodes: string[] = [];

  try {
    for (let i = 0; i < quantity; i++) {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = prefix ? `${prefix}-${randomPart}` : randomPart;

      const codeRef = doc(collection(db, 'accessCodes'));
      await setDoc(codeRef, {
        id: codeRef.id,
        code,
        courseId,
        courseTitle,
        status: 'Active',
        redemptions: 0,
        maxRedemptions,
        createdAt: serverTimestamp(),
      });

      generatedCodes.push(code);
    }

    return { success: true, count: generatedCodes.length };
  } catch (error: any) {
    console.error('Error generating access codes:', error);
    if (
      error.code === 'unavailable' ||
      error.message.includes('Could not reach Cloud Firestore backend')
    ) {
      throw new Error('Could not connect to Firestore. Check internet or Firebase setup.');
    }
    throw new Error('Could not generate access codes due to a server error.');
  }
}
