
import { z } from 'zod';

export const sendNotificationFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  targetType: z.enum(['general', 'course', 'user'], { required_error: 'You must select a target audience.' }),
  courseId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
}).refine(data => {
  if (data.targetType === 'course') return !!data.courseId;
  if (data.targetType === 'user') return !!data.userIds && data.userIds.length > 0;
  return true;
}, {
  message: 'A selection is required for this target type.',
  path: ['courseId'], // This path is a bit of a misnomer now, but keeps error logic simple
});
