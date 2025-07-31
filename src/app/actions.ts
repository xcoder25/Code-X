
'use server';

import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { z } from 'zod';
import { sendNotificationFormSchema } from '@/app/schema';
import {
  generateAccessCodesAction,
  createCourseAction,
  submitExamAction,
} from '@/app/actions';

// Zod inferred type
export async function sendNotificationAction(
  input: z.infer<typeof sendNotificationFormSchema>,
): Promise<void> {
  const parsed = sendNotificationFormSchema.safeParse(input);
  if (!parsed.success) {
    // This provides more detailed error messages in the console.
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
          description: message,
          createdAt: serverTimestamp(),
          read: false, // Explicitly set read status
          type: 'announcement', // Or a more specific type like 'direct_message'
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
          // CORRECTED: Access the title property from the course data.
          target.courseTitle = courseData.title || 'Course'; // Fallback added
        } else {
            throw new Error('Course not found.');
        }
      }

      await addDoc(collection(db, 'notifications'), {
        title,
        description: message,
        createdAt: serverTimestamp(),
        read: false, // Explicitly set read status
        type: 'announcement',
        target,
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Could not send notification.');
  }
}

export { generateAccessCodesAction, createCourseAction, submitExamAction };
