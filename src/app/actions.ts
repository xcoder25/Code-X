
'use server';

import { db, storage } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { z } from 'zod';
import { analyzeCode, AnalyzeCodeOutput, AnalyzeCodeInput } from '@/ai/flows/analyze-code';
import { chatWithElara, ChatWithElaraOutput, ChatWithElaraInput } from '@/ai/flows/ai-coach-flow';

const sendMessageFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  targetType: z.enum(['general', 'course', 'user']),
  courseId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
});

export async function sendMessageAction(
  input: z.infer<typeof sendMessageFormSchema>,
): Promise<void> {
  const parsed = sendMessageFormSchema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
    throw new Error(`Invalid input: ${errorMessage}`);
  }

  const { title, body, targetType, courseId, userIds } = parsed.data;

  const messagePayload: any = {
    title,
    body,
    targetType,
    createdAt: serverTimestamp(),
  };

  if (targetType === 'course') {
    if (!courseId) throw new Error('Course ID is required for course-specific messages.');
    const courseDocRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseDocRef);
    if (!courseDoc.exists()) throw new Error('Course not found.');
    messagePayload.courseId = courseId;
    messagePayload.courseName = courseDoc.data().title || 'Untitled Course';
  } else if (targetType === 'user') {
    if (!userIds || userIds.length === 0) throw new Error('At least one user ID is required for user-specific messages.');
    messagePayload.userIds = userIds;
  }
  
  try {
    await addDoc(collection(db, 'in-app-messages'), messagePayload);
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Could not send message.');
  }
}


const createCourseFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.string(),
  modules: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string().url(),
  })).optional(),
});

export async function createCourseAction(
  data: z.infer<typeof createCourseFormSchema>
) {
  const parsed = createCourseFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid course data.');
  }

  await addDoc(collection(db, 'courses'), {
    ...parsed.data,
    createdAt: serverTimestamp(),
    enrollments: 0,
    status: 'Draft',
    tags: parsed.data.tags.split(',').map(tag => tag.trim()),
  });
}

const generateAccessCodesSchema = z.object({
  courseId: z.string().min(1, "Course is required."),
  prefix: z.string().optional(),
  quantity: z.number().min(1).max(100),
  maxRedemptions: z.number().min(1),
});

function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function generateAccessCodesAction(
  input: z.infer<typeof generateAccessCodesSchema>
) {
  const parsed = generateAccessCodesSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid input for generating access codes.');
  }

  const { courseId, prefix, quantity, maxRedemptions } = parsed.data;

  const courseDocRef = doc(db, 'courses', courseId);
  const courseDoc = await getDoc(courseDocRef);

  if (!courseDoc.exists()) {
    throw new Error('Selected course not found.');
  }

  const courseTitle = courseDoc.data().title || 'Untitled Course';

  const batch = writeBatch(db);
  for (let i = 0; i < quantity; i++) {
    const code = prefix ? `${prefix}-${generateRandomCode(6)}` : generateRandomCode(10);
    const codeRef = doc(collection(db, 'accessCodes'));
    batch.set(codeRef, {
      code,
      courseId,
      courseTitle,
      maxRedemptions,
      redemptions: 0,
      status: 'Active',
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();

  return { success: true, count: quantity };
}

const submitExamSchema = z.object({
  examId: z.string(),
  answers: z.record(z.string()),
});

export async function submitExamAction(
  input: z.infer<typeof submitExamSchema>
) {
  const parsed = submitExamSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid exam submission data.');
  }
  
  const { examId, answers } = parsed.data;
  const exam = exams[examId as keyof typeof exams];

  if (!exam) {
    throw new Error('Exam not found.');
  }

  let correctAnswers = 0;
  exam.questions.forEach((question: any) => {
    if (answers[question.id] === question.correctAnswer) {
      correctAnswers++;
    }
  });

  const score = (correctAnswers / exam.questions.length) * 100;

  return { score };
}

export async function chatWithElaraAction(
  input: ChatWithElaraInput,
): Promise<ChatWithElaraOutput> {
  const isLearningPathRequest = input.message.toLowerCase().includes('learning path');
  return chatWithElara(input, isLearningPathRequest);
}

export async function analyzeCodeAction(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
    return analyzeCode(input);
}
