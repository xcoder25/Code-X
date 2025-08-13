
'use server';

import { db, storage } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs,
  Timestamp,
  increment,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { z } from 'zod';
import { analyzeCode, AnalyzeCodeOutput, AnalyzeCodeInput } from '@/ai/flows/analyze-code';
import { chatWithElara, ChatWithElaraOutput, ChatWithElaraInput } from '@/ai/flows/ai-coach-flow';
import { sendMessageFormSchema } from './schema';
import { exams } from '@/lib/exam-data';

export async function sendMessageAction(
  input: z.infer<typeof sendMessageFormSchema>,
): Promise<void> {
  const parsed = sendMessageFormSchema.safeParse(input);
  if (!parsed.success) {
    // This should not happen if the form validation on the client-side is working.
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
    throw new Error(`Invalid input: ${errorMessage}`);
  }

  const { title, body } = parsed.data;

  try {
    // The only action is to create a general notification for all users.
    await addDoc(collection(db, 'in-app-messages'), {
        title,
        body,
        targetType: 'general', // Hardcoded to 'general' for simplicity
        createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Log the specific Firestore error to the server console for debugging.
    console.error('Error sending message to Firestore:', error);
    // Throw a generic error to the client.
    throw new Error('Could not send message.');
  }
}


const createCourseFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.string(),
});

export async function createCourseAction(
  data: z.infer<typeof createCourseFormSchema>
) {
  const parsed = createCourseFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid course data.');
  }

  const courseRef = await addDoc(collection(db, 'courses'), {
    ...parsed.data,
    createdAt: serverTimestamp(),
    enrollments: 0,
    status: 'Draft',
    tags: parsed.data.tags.split(',').map(tag => tag.trim()),
    modules: [],
  });

  return { id: courseRef.id };
}

const updateCourseModulesSchema = z.object({
    courseId: z.string(),
    modules: z.array(z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        url: z.string().url(),
    })),
});

export async function updateCourseModulesAction(
    data: z.infer<typeof updateCourseModulesSchema>
) {
    const parsed = updateCourseModulesSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error('Invalid module data.');
    }
    const courseRef = doc(db, 'courses', parsed.data.courseId);
    await updateDoc(courseRef, {
        modules: parsed.data.modules,
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

  const courseData = courseDoc.data();
  const courseTitle = courseData?.title || 'Untitled Course';

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


const redeemAccessCodeSchema = z.object({
  accessCode: z.string().min(1, "Access code is required."),
  courseId: z.string().min(1, "Course ID is required."),
  userId: z.string().min(1, "User ID is required."),
});

export async function redeemAccessCodeAction(
    input: z.infer<typeof redeemAccessCodeSchema>
) {
    const parsed = redeemAccessCodeSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error('Invalid input for redeeming access code.');
    }
    
    const { accessCode, courseId, userId } = parsed.data;
    
    // Check if user is already enrolled
    const enrollmentDocRef = doc(db, 'users', userId, 'enrollments', courseId);
    const enrollmentDoc = await getDoc(enrollmentDocRef);
    if (enrollmentDoc.exists()) {
        throw new Error("You are already enrolled in this course.");
    }

    const accessCodesRef = collection(db, 'accessCodes');
    const q = query(accessCodesRef, where("code", "==", accessCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error('Invalid access code.');
    }

    const codeDoc = querySnapshot.docs[0];
    const codeData = codeDoc.data();
    
    if (codeData.courseId !== courseId) {
        throw new Error('This code is not valid for this course.');
    }
    
    if (codeData.status !== 'Active') {
        throw new Error('This access code is not active.');
    }
    
    if (codeData.redemptions >= codeData.maxRedemptions) {
        throw new Error('This access code has reached its redemption limit.');
    }

    const batch = writeBatch(db);

    // Increment redemption count on the code
    batch.update(codeDoc.ref, { redemptions: increment(1) });
    
    // Create an enrollment document for the user
    batch.set(enrollmentDocRef, {
        courseId: courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
    });
    
    // Increment enrollment count on the course
    const courseDocRef = doc(db, 'courses', courseId);
    batch.update(courseDocRef, { enrollments: increment(1) });

    await batch.commit();

    return { success: true };
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


const submitAssignmentSchema = z.object({
  assignmentId: z.string(),
  userId: z.string(),
  userName: z.string(),
  colabLink: z.string().url({ message: "Please enter a valid URL." }),
});

export async function submitAssignmentAction(
    input: z.infer<typeof submitAssignmentSchema>
) {
    const parsed = submitAssignmentSchema.safeParse(input);
    if (!parsed.success) {
        const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
        throw new Error(`Invalid input: ${errorMessage}`);
    }
    
    const { assignmentId, userId, userName, colabLink } = parsed.data;
    
    // The path will be /users/{userId}/submissions/{assignmentId}
    const submissionRef = doc(db, 'users', userId, 'submissions', assignmentId);
    
    await setDoc(submissionRef, {
        assignmentId,
        userId,
        userName,
        colabLink,
        status: 'Pending',
        grade: null,
        submittedAt: serverTimestamp(),
    });
    
    return { success: true };
}
