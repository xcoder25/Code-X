

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
import { interviewPrep, InterviewPrepOutput, InterviewPrepInput } from '@/ai/flows/interview-prep-flow';
import { sendMessageFormSchema } from './schema';
import { getDownloadURL, ref, uploadString, deleteObject } from 'firebase/storage';
import { auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';


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
  userId: z.string(),
});

export async function submitExamAction(
  input: z.infer<typeof submitExamSchema>
) {
    const parsed = submitExamSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error('Invalid exam submission data.');
    }
    
    const { examId, answers, userId } = parsed.data;
    
    const examDocRef = doc(db, 'exams', examId);
    const examDoc = await getDoc(examDocRef);
    if (!examDoc.exists()) {
        throw new Error('Exam not found.');
    }

    // Save the submission to a subcollection for the user
    const submissionRef = doc(db, 'users', userId, 'examSubmissions', examId);
    await setDoc(submissionRef, {
        examId,
        examTitle: examDoc.data().title,
        answers,
        submittedAt: serverTimestamp(),
        status: 'Pending Review',
        grade: null
    });

    return { success: true };
}


export async function chatWithElaraAction(
  input: ChatWithElaraInput,
): Promise<ChatWithElaraOutput> {
  return chatWithElara(input);
}

export async function analyzeCodeAction(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
    return analyzeCode(input);
}

export async function interviewPrepAction(input: InterviewPrepInput): Promise<InterviewPrepOutput> {
    return interviewPrep(input);
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


// --- Exam Actions ---

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Question text cannot be empty."),
});

const examFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Please select a course."),
  duration: z.number().min(1, "Duration must be at least 1 minute."),
  questions: z.array(questionSchema).min(1, "An exam must have at least one question."),
});


export async function createExamAction(data: z.infer<typeof examFormSchema>) {
  const parsed = examFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid exam data.');
  }

  const { title, courseId, duration, questions } = parsed.data;

  const courseDocRef = doc(db, 'courses', courseId);
  const courseDoc = await getDoc(courseDocRef);
  if (!courseDoc.exists()) {
    throw new Error('Selected course not found.');
  }
  const courseTitle = courseDoc.data().title;

  const examRef = await addDoc(collection(db, 'exams'), {
    title,
    courseId,
    courseTitle,
    duration: duration * 60, // convert minutes to seconds
    createdAt: serverTimestamp(),
  });

  const batch = writeBatch(db);
  const questionsRef = collection(db, 'exams', examRef.id, 'questions');
  questions.forEach(question => {
    const questionRef = doc(questionsRef, question.id);
    batch.set(questionRef, question);
  });

  await batch.commit();

  return { id: examRef.id };
}

const updateExamFormSchema = examFormSchema.extend({
  examId: z.string(),
});


export async function updateExamAction(data: z.infer<typeof updateExamFormSchema>) {
    const parsed = updateExamFormSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error('Invalid exam data.');
    }

    const { examId, title, courseId, duration, questions } = parsed.data;
    
    const courseDocRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseDocRef);
    if (!courseDoc.exists()) {
        throw new Error('Selected course not found.');
    }
    const courseTitle = courseDoc.data().title;

    const examRef = doc(db, 'exams', examId);
    await updateDoc(examRef, {
        title,
        courseId,
        courseTitle,
        duration: duration * 60, // convert minutes to seconds
    });

    const batch = writeBatch(db);
    const questionsRef = collection(db, 'exams', examId, 'questions');

    // Simple approach: delete old questions and add new ones.
    // A more complex diffing logic could be used for performance if needed.
    const oldQuestionsSnap = await getDocs(questionsRef);
    oldQuestionsSnap.forEach(doc => batch.delete(doc.ref));

    questions.forEach(question => {
        const questionRef = doc(questionsRef, question.id);
        batch.set(questionRef, question);
    });

    await batch.commit();
}


export async function deleteExamAction(examId: string) {
    if (!examId) {
        throw new Error('Exam ID is required.');
    }
    const examRef = doc(db, 'exams', examId);
    
    // Also delete subcollection
    const questionsRef = collection(db, 'exams', examId, 'questions');
    const questionsSnap = await getDocs(questionsRef);
    const batch = writeBatch(db);
    questionsSnap.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    await deleteDoc(examRef);
}


export async function claimAdminAction(userId: string) {
    if (!userId) {
        throw new Error("User not found to claim admin role.");
    }

    const adminsCollectionRef = collection(db, 'admins');
    const adminsSnapshot = await getDocs(adminsCollectionRef);

    // Only allow the first user to claim the admin role for initial setup
    if (!adminsSnapshot.empty && adminsSnapshot.docs.length > 0) {
        throw new Error("An admin already exists.");
    }
    
    // Add the user to the 'admins' collection
    await setDoc(doc(db, 'admins', userId), {
        createdAt: serverTimestamp(),
    });
    
    return { success: true, message: "Admin role claimed successfully." };
}

// --- Project Actions ---

const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Please select a course."),
  dueDate: z.date(),
  description: z.string().optional(),
});

export async function createProjectAction(
  data: z.infer<typeof projectFormSchema>
) {
  const parsed = projectFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid project data.');
  }

  const { title, courseId, dueDate, description } = parsed.data;

  const courseDocRef = doc(db, 'courses', courseId);
  const courseDoc = await getDoc(courseDocRef);

  if (!courseDoc.exists()) {
    throw new Error('Selected course not found.');
  }
  const courseTitle = courseDoc.data().title;


  await addDoc(collection(db, 'projects'), {
    title,
    courseId,
    courseTitle,
    dueDate: Timestamp.fromDate(dueDate),
    description,
    createdAt: serverTimestamp(),
  });

  return { success: true };
}


const updateProjectFormSchema = projectFormSchema.extend({
    projectId: z.string(),
});

export async function updateProjectAction(
  data: z.infer<typeof updateProjectFormSchema>
) {
  const parsed = updateProjectFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid project data.');
  }

  const { projectId, title, courseId, dueDate, description } = parsed.data;

  const courseDocRef = doc(db, 'courses', courseId);
  const courseDoc = await getDoc(courseDocRef);

  if (!courseDoc.exists()) {
    throw new Error('Selected course not found.');
  }
  const courseTitle = courseDoc.data().title;
  
  const projectRef = doc(db, 'projects', projectId);

  await updateDoc(projectRef, {
    title,
    courseId,
    courseTitle,
    dueDate: Timestamp.fromDate(dueDate),
    description,
  });

  return { success: true };
}

export async function deleteProjectAction(projectId: string) {
  if (!projectId) {
    throw new Error('Project ID is required.');
  }
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
}


const submitProjectSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  userName: z.string(),
  colabLink: z.string().url({ message: "Please enter a valid URL." }),
});

export async function submitProjectAction(
    input: z.infer<typeof submitProjectSchema>
) {
    const parsed = submitProjectSchema.safeParse(input);
    if (!parsed.success) {
        const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
        throw new Error(`Invalid input: ${errorMessage}`);
    }
    
    const { projectId, userId, userName, colabLink } = parsed.data;
    
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) {
      throw new Error("Project not found.");
    }
    const project = projectSnap.data();

    // The subcollection will be 'projectSubmissions' to distinguish from assignment submissions
    const submissionRef = doc(db, 'users', userId, 'projectSubmissions', projectId);
    
    await setDoc(submissionRef, {
        projectId,
        projectTitle: project.title,
        courseId: project.courseId,
        courseTitle: project.courseTitle,
        userId,
        userName,
        colabLink,
        status: 'Pending',
        grade: 10, // Early submission grade
        submittedAt: serverTimestamp(),
    });
    
    return { success: true };
}

const gradeProjectSchema = z.object({
  userId: z.string(),
  submissionId: z.string(), // This is the projectId
  grade: z.coerce.number().min(0, "Grade must be a positive number."),
});

export async function gradeProjectAction(
  input: z.infer<typeof gradeProjectSchema>
) {
  const parsed = gradeProjectSchema.safeParse(input);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues.map(issue => issue.message).join(', ');
    throw new Error(`Invalid input: ${errorMessage}`);
  }
  
  const { userId, submissionId, grade } = parsed.data;
  
  const submissionRef = doc(db, 'users', userId, 'projectSubmissions', submissionId);
  
  await updateDoc(submissionRef, {
    grade: grade,
    status: 'Graded',
  });
  
  return { success: true };
}
// --- User Settings Actions ---

const userProfileSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  photoDataUrl: z.string().url().optional(),
});

export async function updateUserProfileAction(data: z.infer<typeof userProfileSchema>) {
  const parsed = userProfileSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid profile data.');
  }

  const { userId, firstName, lastName, email, photoDataUrl } = parsed.data;

  const userDocRef = doc(db, 'users', userId);
  const currentUser = auth.currentUser;
  
  if (!currentUser || currentUser.uid !== userId) {
      throw new Error("You are not authorized to perform this action.");
  }
  
  let photoURL = currentUser.photoURL;

  // If a new photo is provided, upload it
  if (photoDataUrl) {
    const storageRef = ref(storage, `profile-pictures/${userId}`);
    await uploadString(storageRef, photoDataUrl, 'data_url');
    photoURL = await getDownloadURL(storageRef);
  }

  // Update Auth profile
  await updateProfile(currentUser, {
    displayName: `${firstName} ${lastName}`,
    photoURL: photoURL,
  });

  // Update Firestore document
  await updateDoc(userDocRef, {
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    photoURL: photoURL,
  });

  return { success: true, photoURL };
}


const notificationSettingsSchema = z.object({
    userId: z.string(),
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
});

export async function updateNotificationSettingsAction(data: z.infer<typeof notificationSettingsSchema>) {
    const parsed = notificationSettingsSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Invalid notification settings data.");
    }
    const { userId, emailNotifications, pushNotifications } = parsed.data;

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        'settings.notifications.email': emailNotifications,
        'settings.notifications.push': pushNotifications,
    });
    return { success: true };
}

// --- Course Seeding Action ---

const initialCourses = [
    {
        id: 'intro-to-python',
        title: 'Introduction to Python',
        description: 'Learn the fundamentals of Python, one of the most popular programming languages in the world.',
        tags: ['Python', 'Beginner', 'Programming'],
        premium: false,
        modules: [
            {
                id: 'py-mod-1',
                title: 'Module 1: Getting Started',
                lessons: [
                    { id: 'py-l-1-1', title: 'What is Python?', content: 'An overview of Python, its history, and why it\'s a great language for beginners. Covers real-world applications of Python.' },
                    { id: 'py-l-1-2', title: 'Installing Python & VS Code', content: 'A step-by-step guide to installing Python and setting up Visual Studio Code as your editor on Windows, macOS, and Linux.' },
                    { id: 'py-l-1-3', title: 'Running Your First Script', content: 'A hands-on tutorial where you write and run your first "Hello, World!" program in Python.' },
                ],
            },
            {
                id: 'py-mod-2',
                title: 'Module 2: Variables and Basic Data Types',
                lessons: [
                    { id: 'py-l-2-1', title: 'Understanding Variables', content: 'Learn how to store data in variables. Covers naming conventions and assigning values.' },
                    { id: 'py-l-2-2', title: 'Working with Numbers', content: 'Explore integers and floating-point numbers. Covers basic arithmetic operations like addition, subtraction, multiplication, and division.' },
                    { id: 'py-l-2-3', title: 'Manipulating Strings', content: 'An introduction to text data. Covers string concatenation, slicing, and common string methods.' },
                    { id: 'py-l-2-4', title: 'Introduction to Booleans', content: 'Understand the concept of True and False values, which are fundamental for control flow.' },
                ],
            },
        ],
        resources: [],
    },
    {
        id: 'web-dev-bootcamp',
        title: 'Web Development Bootcamp',
        description: 'A comprehensive bootcamp covering HTML, CSS, JavaScript, and everything you need to become a web developer.',
        tags: ['HTML', 'CSS', 'JavaScript', 'Fullstack'],
        premium: false,
        modules: [
            {
                id: 'wd-mod-1',
                title: 'Module 1: HTML Fundamentals',
                lessons: [
                    { id: 'wd-l-1-1', title: 'Introduction to HTML', content: 'Learn the basic structure of a web page and the most common HTML tags.' },
                    { id: 'wd-l-1-2', title: 'Creating Forms', content: 'Understand how to collect user input with HTML forms, including various input types.' },
                ],
            },
            {
                id: 'wd-mod-2',
                title: 'Module 2: CSS Styling',
                lessons: [
                    { id: 'wd-l-2-1', title: 'Introduction to CSS', content: 'Learn how to apply styles to your HTML documents to make them visually appealing.' },
                    { id: 'wd-l-2-2', title: 'The Box Model', content: 'A deep dive into the CSS box model, including margins, padding, borders, and content.' },
                    { id: 'wd-l-2-3', title: 'Flexbox and Grid', content: 'Master modern CSS layout techniques with Flexbox and CSS Grid for creating responsive designs.' },
                ],
            },
        ],
        resources: [],
    },
     {
        id: 'advanced-react',
        title: 'Advanced React & State Management',
        description: 'Take your React skills to the next level by mastering advanced concepts like state management, performance optimization, and testing.',
        tags: ['React', 'Advanced', 'State Management', 'Premium'],
        premium: true,
        modules: [
            {
                id: 'ar-mod-1',
                title: 'Module 1: Advanced Hooks',
                lessons: [
                    { id: 'ar-l-1-1', title: 'Deep Dive into `useEffect`', content: 'Mastering the dependency array and avoiding common pitfalls.' },
                    { id: 'ar-l-1-2', title: 'Optimizing with `useCallback` and `useMemo`', content: 'Learn when and how to use memoization to prevent unnecessary re-renders.' },
                    { id: 'ar-l-1-3', title: 'Creating Custom Hooks', content: 'Abstracting logic into reusable custom hooks to keep your components clean.' },
                ],
            },
            {
                id: 'ar-mod-2',
                title: 'Module 2: State Management with Redux Toolkit',
                lessons: [
                    { id: 'ar-l-2-1', title: 'Introduction to Redux', content: 'Understanding the core concepts of Redux and why it\'s used.' },
                    { id: 'ar-l-2-2', title: 'Setting up Redux Toolkit', content: 'Learn the modern, efficient way to write Redux logic.' },
                    { id: 'ar-l-2-3', title: 'Async Logic with Thunks', content: 'Handling API calls and other asynchronous actions within Redux.' },
                ],
            },
        ],
        resources: [],
    }
];

export async function seedInitialCoursesAction() {
    const coursesCollection = collection(db, 'courses');
    const batch = writeBatch(db);
    let coursesAdded = 0;

    for (const courseData of initialCourses) {
        const courseDocRef = doc(coursesCollection, courseData.id);
        const docSnap = await getDoc(courseDocRef);

        if (!docSnap.exists()) {
            batch.set(courseDocRef, {
                ...courseData,
                createdAt: serverTimestamp(),
                enrollments: 0,
                status: 'Draft',
            });
            coursesAdded++;
        }
    }

    if (coursesAdded > 0) {
        await batch.commit();
    }

    return { coursesAdded };
}

// --- Paystack Subscription Action ---

const createSubscriptionSchema = z.object({
    userId: z.string(),
    planCode: z.string(),
    planName: z.string(),
});

export async function createSubscriptionAction(input: z.infer<typeof createSubscriptionSchema>) {
    const { userId, planCode, planName } = createSubscriptionSchema.parse(input);

    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error('User not found.');
    }

    const userData = userDoc.data();
    let paystackCustomerCode = userData.paystackCustomerCode;

    // 1. Create a Paystack customer if one doesn't exist
    if (!paystackCustomerCode) {
        const customerResponse = await fetch('https://api.paystack.co/customer', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                first_name: userData.firstName,
                last_name: userData.lastName,
            }),
        });

        const customerData = await customerResponse.json();
        if (!customerResponse.ok) {
            throw new Error(customerData.message || 'Failed to create Paystack customer.');
        }

        paystackCustomerCode = customerData.data.customer_code;
        await updateDoc(userDocRef, { paystackCustomerCode });
    }

    // 2. Create the subscription
    const subscriptionResponse = await fetch('https://api.paystack.co/subscription', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customer: paystackCustomerCode,
            plan: planCode,
        }),
    });

    const subscriptionData = await subscriptionResponse.json();
    if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData.message || 'Failed to create subscription.');
    }

    // 3. Update user's plan in Firestore
    await updateDoc(userDocRef, {
        plan: planName,
        subscriptionId: subscriptionData.data.subscription_code,
        subscriptionStatus: 'active',
    });

    return { success: true };
}
