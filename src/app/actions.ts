
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

// Zod inferred type
export async function sendNotificationAction(
  input: z.infer<typeof sendNotificationFormSchema>,
): Promise<void> {
  const parsed = sendNotificationFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Invalid notification input');
  }

  const { title, message, targetType, courseId, userIds } = parsed.data;

  try {
    if (targetType === 'user' && userIds && userIds.length > 0) {
      // Send notification to multiple specific users
      const batch = writeBatch(db);
      userIds.forEach(userId => {
        const notifRef = doc(collection(db, 'notifications')); // ✅ auto-generates ID
        batch.set(notifRef, {
          title,
          description: message,
          createdAt: serverTimestamp(),
          readBy: [],
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
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          target.courseId = courseId;
          target.courseTitle = courseDoc.data().title;
        }
      }

      await addDoc(collection(db, 'notifications'), {
        title,
        description: message,
        createdAt: serverTimestamp(),
        readBy: [],
        type: 'announcement',
        target,
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Could not send notification.');
  }
}
