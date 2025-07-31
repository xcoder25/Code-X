import { z } from 'zod';

export const sendMessageFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  targetType: z.enum(['general', 'course', 'user', 'admin']),
  courseId: z.string().optional().or(z.literal('')),
  userIds: z.array(z.string()).optional(),
  senderId: z.string().optional(),
  senderName: z.string().optional(),
}).refine(data => {
  if (data.targetType === 'course') return !!data.courseId && data.courseId.length > 0;
  if (data.targetType === 'user') return data.userIds && data.userIds.length > 0;
  return true;
}, {
  message: 'A selection is required for this target type.',
  path: ['courseId'],
});
