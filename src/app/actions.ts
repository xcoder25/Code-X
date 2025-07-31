
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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { z } from 'zod';
import { sendNotificationFormSchema } from '@/app/schema';
import { exams } from '@/lib/exam-data';

// Zod inferred type for notification form
export async function sendNotificationAction(
  input: z.infer<typeof sendNotificationFormSchema>,
): Promise<void> {
  const parsed = sendNotificationFormSchema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
    console.error('Zod validation failed:', errorMessage);
    throw new Error(`Invalid notification input: ${errorMessage}`);
  }

  const { title, message, targetType, courseId, userIds } = parsed.data;

  try {
    if (targetType === 'user' && userIds && userIds.length > 0) {
      // Send notification to multiple specific users
      const batch = writeBatch(db);
      userIds.forEach(userId => {
        const notifRef = doc(collection(db, 'notifications')); // auto-generates ID
        batch.set(notifRef, {
          title,
          message,
          createdAt: serverTimestamp(),
          read: false,
          type: 'announcement',
          target: {
            type: 'user',
            userId,
          },
        });
      });
      await batch.commit();
    } else {
      // Send a general or course notification
      const target: any = { type: targetType };
      if (targetType === 'course' && courseId) {
        const courseDocRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseDocRef);
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          target.courseId = courseId;
          target.courseTitle = courseData.title || 'Course'; 
        } else {
            throw new Error('Course not found.');
        }
      }

      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        createdAt: serverTimestamp(),
        read: false,
        type: 'announcement',
        target,
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Could not send notification.');
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

  // In a real app, you would save this result to Firestore
  // await addDoc(collection(db, 'examResults'), { ... });

  return { score };
}
