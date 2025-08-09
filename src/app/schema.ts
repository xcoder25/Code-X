
import { z } from 'zod';

// This schema is now simplified for a one-way notification system.
// The admin provides a title and body.
export const sendMessageFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
});
