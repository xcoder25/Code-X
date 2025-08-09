
import { z } from 'zod';

export const sendMessageFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  targetType: z.enum(['general', 'course', 'user', 'admin']),
  courseId: z.string().optional().or(z.literal('')),
  userIds: z.array(z.string()).optional(),
  senderId: z.string().optional(),
  senderName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.targetType === 'course' && !data.courseId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A course selection is required.',
      path: ['courseId'],
    });
  }
  if (data.targetType === 'user' && (!data.userIds || data.userIds.length === 0)) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one user must be selected.',
      path: ['userIds'],
    });
  }
  if (data.targetType === 'admin' && !data.senderId) {
      ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sender ID is required for admin messages.',
          path: ['senderId'],
      })
  }
});
