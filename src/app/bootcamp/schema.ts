import { z } from 'zod';

// Define registration validation schema
export const registrationSchema = z.object({
  parentName: z.string().min(2, 'Parent name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(7, 'Please enter a valid phone number.'),
  childName: z.string().min(2, "Child's name must be at least 2 characters."),
  childAge: z.coerce.number().min(5, 'Age must be at least 5.').max(18, 'Age must be under 18.'),
  schoolName: z.string().min(2, 'School name is required.'),
  numberOfChildren: z.coerce.number().min(1, 'At least 1 child is required.'),
  preferredSession: z.enum(['morning', 'afternoon'], {
    required_error: 'Please select a preferred session.',
  }),
  howDidYouHear: z.string().optional(),
  referredBy: z.string().optional(),
});

export type RegistrationData = z.infer<typeof registrationSchema>;
