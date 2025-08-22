
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
  arrayUnion,
  deleteDoc,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { z } from 'zod';
import { analyzeCode, AnalyzeCodeOutput, AnalyzeCodeInput } from '@/ai/flows/analyze-code';
import { chatWithElara, ChatWithElaraOutput, ChatWithElaraInput } from '@/ai/flows/ai-coach-flow';
import { sendMessageFormSchema } from './schema';
import { exams } from '@/lib/exam-data';
import { getDownloadURL, ref, uploadString, deleteObject } from 'firebase/storage';


export async function sendMessageAction(
  input: z.infer<typeof sendMessageFormSchema>,
): Promise<void> {
  const parsed = sendMessageFormSchema.safeParse(input);
  if (!parsed.success) {
    // This should not happen if the form validation on the client-side is working.
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
    throw new Error(`Invalid input: ${errorMessage}`);
  }

  const { title, body, targetType, userId } = parsed.data;

  try {
    if (targetType === 'direct') {
         await addDoc(collection(db, 'notifications'), {
            title,
            body,
            targetType: 'direct',
            userIds: [userId], // Store recipient in an array
            createdAt: serverTimestamp(),
            readBy: [],
        });
    } else {
        await addDoc(collection(db, 'notifications'), {
            title,
            body,
            targetType: 'general',
            createdAt: serverTimestamp(),
            readBy: [],
        });
    }
  } catch (error) {
    // Log the specific Firestore error to the server console for debugging.
    console.error('Error sending message to Firestore:', error);
    // Throw a generic error to the client.
    throw new Error('Could not send message.');
  }
}

const lessonSchema = z.object({
    id: z.string(),
    title: z.string().min(1),
    content: z.string().min(1),
});

const moduleSchema = z.object({
    id: z.string(),
    title: z.string().min(1),
    lessons: z.array(lessonSchema),
});

const createCourseFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.string(),
  modules: z.array(moduleSchema),
});

export async function createCourseAction(
  data: z.infer<typeof createCourseFormSchema>
) {
  const parsed = createCourseFormSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Course creation validation failed:", parsed.error.issues);
    throw new Error('Invalid course data.');
  }

  const { title, description, tags, modules } = parsed.data;

  const courseRef = await addDoc(collection(db, 'courses'), {
    title,
    description,
    tags: tags.split(',').map(tag => tag.trim()),
    modules,
    createdAt: serverTimestamp(),
    enrollments: 0,
    status: 'Draft',
    resources: [], // Initialize with empty resources
  });

  return { id: courseRef.id };
}

const updateCourseSchema = z.object({
    courseId: z.string(),
    title: z.string().min(3, "Title must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    tags: z.string().min(1, "Please provide at least one tag."),
    modules: z.array(moduleSchema),
    resources: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        size: z.number(),
        url: z.string().url(),
    })),
    teacherId: z.string().optional(),
});


export async function updateCourseAction(data: z.infer<typeof updateCourseSchema>) {
    const parsed = updateCourseSchema.safeParse(data);
    if (!parsed.success) {
        // Log detailed error for debugging
        console.error("Course update validation failed:", parsed.error.issues);
        throw new Error('Invalid course data submitted.');
    }

    const { courseId, title, description, tags, modules, resources, teacherId } = parsed.data;
    
    const courseRef = doc(db, 'courses', courseId);
    
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
        throw new Error('Course not found.');
    }

    // --- File Deletion Logic for Resources ---
    const existingData = courseDoc.data();
    const existingResources = existingData.resources || [];
    const newResourceUrls = new Set(resources.map(r => r.url));
    const resourcesToDelete = existingResources.filter((res: any) => !newResourceUrls.has(res.url));

    for (const file of resourcesToDelete) {
        try {
            const fileRef = ref(storage, file.url);
            await deleteObject(fileRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                console.error(`Failed to delete file from storage: ${file.url}`, error);
            }
        }
    }

    await updateDoc(courseRef, {
        title,
        description,
        tags: tags.split(',').map(tag => tag.trim()),
        modules,
        resources,
        teacherId: teacherId || null,
    });
}


const updateCourseModulesSchema = z.object({
    courseId: z.string(),
    modules: z.array(z.object({
        id: z.string(),
        title: z.string(),
        lessons: z.array(z.object({
            id: z.string(),
            title: z.string(),
            content: z.string(),
        })),
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
  return chatWithElara(input);
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
    
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const assignmentSnap = await getDoc(assignmentRef);
    if (!assignmentSnap.exists()) {
      throw new Error("Assignment not found.");
    }
    const assignment = assignmentSnap.data();

    const submissionRef = doc(db, 'users', userId, 'submissions', assignmentId);
    
    await setDoc(submissionRef, {
        assignmentId,
        assignmentTitle: assignment.title,
        courseId: assignment.courseId,
        courseTitle: assignment.courseTitle,
        userId,
        userName,
        colabLink,
        status: 'Pending',
        grade: null,
        submittedAt: serverTimestamp(),
    });
    
    return { success: true };
}

const gradeAssignmentSchema = z.object({
  userId: z.string(),
  submissionId: z.string(),
  grade: z.string().min(1, { message: "Grade is required." }),
});

export async function gradeAssignmentAction(
  input: z.infer<typeof gradeAssignmentSchema>
) {
  const parsed = gradeAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
    throw new Error(`Invalid input: ${errorMessage}`);
  }
  
  const { userId, submissionId, grade } = parsed.data;
  
  const submissionRef = doc(db, 'users', userId, 'submissions', submissionId);
  
  await updateDoc(submissionRef, {
    grade: grade,
    status: 'Graded',
  });
  
  return { success: true };
}

export async function markMessagesAsRead(userId: string) {
    const messagesRef = collection(db, 'notifications');
    
    // This query is intentionally simple to avoid needing a composite index.
    // It fetches all messages and filters client-side in the hook/component.
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(messagesQuery);

    const batch = writeBatch(db);
    
    querySnapshot.forEach((docSnap) => {
        const messageData = docSnap.data();
        const isGeneral = messageData.targetType === 'general';
        const isDirectToUser = Array.isArray(messageData.userIds) && messageData.userIds.includes(userId);
        const isUnread = !messageData.readBy || !messageData.readBy.includes(userId);

        if ((isGeneral || isDirectToUser) && isUnread) {
            batch.update(docSnap.ref, {
                readBy: arrayUnion(userId)
            });
        }
    });

    try {
        await batch.commit();
    } catch(e) {
        console.error("Error marking messages as read", e);
    }
}

export async function deleteCourseAction(courseId: string) {
    if (!courseId) {
        throw new Error('Course ID is required.');
    }
    const courseRef = doc(db, 'courses', courseId);
    await deleteDoc(courseRef);
}

const friendActionSchema = z.object({
  currentUserId: z.string(),
  targetUserId: z.string(),
});

export async function sendFriendRequestAction(input: z.infer<typeof friendActionSchema>) {
  const { currentUserId, targetUserId } = friendActionSchema.parse(input);
  if (currentUserId === targetUserId) throw new Error("You cannot add yourself as a friend.");

  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  
  const currentUserSnap = await getDoc(currentUserRef);
  const targetUserSnap = await getDoc(targetUserRef);

  if (!currentUserSnap.exists() || !targetUserSnap.exists()) {
    throw new Error("User not found.");
  }
  
  const currentUserData = currentUserSnap.data();
  const targetUserData = targetUserSnap.data();

  const batch = writeBatch(db);

  const currentUserFriendRef = doc(db, `users/${currentUserId}/friends/${targetUserId}`);
  batch.set(currentUserFriendRef, {
    status: 'sent',
    since: serverTimestamp(),
    displayName: targetUserData.displayName,
    photoURL: targetUserData.photoURL || null
  });

  const targetUserFriendRef = doc(db, `users/${targetUserId}/friends/${currentUserId}`);
  batch.set(targetUserFriendRef, {
    status: 'received',
    since: serverTimestamp(),
    displayName: currentUserData.displayName,
    photoURL: currentUserData.photoURL || null
  });
  
  await batch.commit();
  return { success: true };
}

export async function acceptFriendRequestAction(input: z.infer<typeof friendActionSchema>) {
  const { currentUserId, targetUserId } = friendActionSchema.parse(input);

  const batch = writeBatch(db);
  
  const currentUserFriendRef = doc(db, `users/${currentUserId}/friends/${targetUserId}`);
  batch.update(currentUserFriendRef, { status: 'accepted', since: serverTimestamp() });
  
  const targetUserFriendRef = doc(db, `users/${targetUserId}/friends/${currentUserId}`);
  batch.update(targetUserFriendRef, { status: 'accepted', since: serverTimestamp() });
  
  await batch.commit();
  return { success: true };
}

export async function declineFriendRequestAction(input: z.infer<typeof friendActionSchema>) {
  const { currentUserId, targetUserId } = friendActionSchema.parse(input);

  const batch = writeBatch(db);
  
  const currentUserFriendRef = doc(db, `users/${currentUserId}/friends/${targetUserId}`);
  batch.delete(currentUserFriendRef);
  
  const targetUserFriendRef = doc(db, `users/${targetUserId}/friends/${currentUserId}`);
  batch.delete(targetUserFriendRef);
  
  await batch.commit();
  return { success: true };
}

const assignmentFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Please select a course."),
  dueDate: z.date(),
  description: z.string().optional(),
});

export async function createAssignmentAction(
  data: z.infer<typeof assignmentFormSchema>
) {
  const parsed = assignmentFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid assignment data.');
  }

  const { title, courseId, dueDate, description } = parsed.data;

  const courseDocRef = doc(db, 'courses', courseId);
  const courseDoc = await getDoc(courseDocRef);

  if (!courseDoc.exists()) {
    throw new Error('Selected course not found.');
  }
  const courseTitle = courseDoc.data().title;


  await addDoc(collection(db, 'assignments'), {
    title,
    courseId,
    courseTitle,
    dueDate: Timestamp.fromDate(dueDate),
    description,
    createdAt: serverTimestamp(),
  });

  return { success: true };
}


const updateAssignmentFormSchema = assignmentFormSchema.extend({
    assignmentId: z.string(),
});

export async function updateAssignmentAction(
  data: z.infer<typeof updateAssignmentFormSchema>
) {
  const parsed = updateAssignmentFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid assignment data.');
  }

  const { assignmentId, title, courseId, dueDate, description } = parsed.data;

  const courseDocRef = doc(db, 'courses', courseId);
  const courseDoc = await getDoc(courseDocRef);

  if (!courseDoc.exists()) {
    throw new Error('Selected course not found.');
  }
  const courseTitle = courseDoc.data().title;
  
  const assignmentRef = doc(db, 'assignments', assignmentId);

  await updateDoc(assignmentRef, {
    title,
    courseId,
    courseTitle,
    dueDate: Timestamp.fromDate(dueDate),
    description,
  });

  return { success: true };
}

export async function deleteAssignmentAction(assignmentId: string) {
  if (!assignmentId) {
    throw new Error('Assignment ID is required.');
  }
  const assignmentRef = doc(db, 'assignments', assignmentId);
  await deleteDoc(assignmentRef);
}
