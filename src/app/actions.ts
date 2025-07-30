
'use server';

import { chatWithElara, ChatWithElaraInput, ChatWithElaraOutput } from '@/ai/flows/ai-coach-flow';
import { analyzeCode, AnalyzeCodeInput, AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
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

const createCourseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  tags: z.string().min(1, 'Please add at least one tag (comma-separated).'),
  modules: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

export async function createCourseAction(values: z.infer<typeof createCourseFormSchema>) {
  const parsedInput = createCourseFormSchema.safeParse(values);
  if (!parsedInput.success) {
    console.error(parsedInput.error.flatten());
    throw new Error('Invalid input for creating a course.');
  }

  try {
    const newCourseRef = doc(collection(db, "courses"));
    
    // In a real app, you would upload files to storage here and get URLs.
    // For this prototype, we'll just store the file metadata.
    const modulesWithFileInfo = parsedInput.data.modules?.map(module => ({
        // In a real app, this would be a download URL from Firebase Storage
        url: 'mock_url_placeholder', 
        ...module,
    })) || [];
    
    await setDoc(newCourseRef, {
      id: newCourseRef.id,
      title: parsedInput.data.title,
      description: parsedInput.data.description,
      tags: parsedInput.data.tags.split(',').map(tag => tag.trim()),
      status: 'Draft',
      enrollments: 0,
      createdAt: serverTimestamp(),
      modules: modulesWithFileInfo,
    });
    
    console.log("Uploaded modules:", parsedInput.data.modules);

    return { success: true, courseId: newCourseRef.id };
  } catch (error) {
    console.error("Error creating course: ", error);
    throw new Error("Could not create course.");
  }
}

const generateCodesFormSchema = z.object({
  courseId: z.string().min(1, "Course is required."),
  prefix: z.string().optional(),
  quantity: z.number().min(1).max(100),
  maxRedemptions: z.number().min(1),
});


export async function generateAccessCodesAction(values: z.infer<typeof generateCodesFormSchema>) {
    const parsedInput = generateCodesFormSchema.safeParse(values);
    if (!parsedInput.success) {
        throw new Error('Invalid input for generating codes.');
    }

    const { courseId, prefix, quantity, maxRedemptions } = parsedInput.data;

    try {
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (!courseDoc.exists()) {
            throw new Error("Selected course does not exist.");
        }
        const courseTitle = courseDoc.data()?.title;

        const generatedCodes = [];
        for (let i = 0; i < quantity; i++) {
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const code = prefix ? `${prefix}-${randomPart}` : randomPart;
            
            const newCodeRef = doc(collection(db, 'accessCodes'));
            await setDoc(newCodeRef, {
                id: newCodeRef.id,
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
        console.error("Error generating access codes: ", error);
        if (error.code === 'unavailable' || error.message.includes('Could not reach Cloud Firestore backend')) {
             throw new Error("Could not connect to the database. Please check your internet connection and Firebase project setup.");
        }
        throw new Error("Could not generate access codes due to a server error.");
    }
}
