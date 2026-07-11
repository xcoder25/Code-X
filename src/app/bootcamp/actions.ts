'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
});

export type RegistrationData = z.infer<typeof registrationSchema>;

// Helper to generate a unique registration ID
function generateRegistrationId() {
  const yearMonth = '2607'; // July 2026
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like O, 0, I, 1
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CX-${yearMonth}-${randomPart}`;
}

interface ProcessRegistrationParams {
  formData: RegistrationData;
  amount: number;
  paymentReference: string;
  isSimulated: boolean;
}

export async function processRegistration({
  formData,
  amount,
  paymentReference,
  isSimulated,
}: ProcessRegistrationParams) {
  // Validate incoming form data
  const validated = registrationSchema.safeParse(formData);
  if (!validated.success) {
    throw new Error(`Validation failed: ${validated.error.issues.map(i => i.message).join(', ')}`);
  }

  const registrationId = generateRegistrationId();

  try {
    // 1. Save registration details to Firestore
    const registrationRecord = {
      ...validated.data,
      registrationId,
      amountPaid: amount / 100, // convert kobo back to NGN
      paymentReference,
      paymentStatus: 'success',
      paymentMethod: isSimulated ? 'simulated' : 'paystack',
      paymentDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bootcamp_registrations'), registrationRecord);

    // 2. Simulate sending confirmation email
    const emailPayload = {
      to: validated.data.email,
      parentName: validated.data.parentName,
      subject: `Registration Confirmed: Build with AI Holiday Bootcamp! 🚀 (ID: ${registrationId})`,
      body: `
        Dear ${validated.data.parentName},

        Thank you for registering your child, ${validated.data.childName}, for the **Build with AI Holiday Bootcamp** organized by **CODE-X Tech**!

        We have successfully received your payment of ₦${(amount / 100).toLocaleString()}.

        **Here are your registration details:**
        - **Registration ID**: ${registrationId}
        - **Child Name**: ${validated.data.childName}
        - **Child Age**: ${validated.data.childAge} years old
        - **Age Group**: ${validated.data.childAge >= 12 ? 'Senior Builders (12-15)' : 'Junior Builders (8-11)'}
        - **Preferred Session**: ${validated.data.preferredSession === 'morning' ? 'Morning Batch (10:00 AM - 12:00 PM WAT)' : 'Afternoon Batch (2:00 PM - 4:00 PM WAT)'}
        - **Start Date**: Saturday, 27th July 2026
        - **Format**: 100% Virtual (Zoom & Google Classroom)

        **What happens next?**
        1. A week before the bootcamp, we will send an onboarding email containing the virtual classroom links, links to download/prepare coding tools, and guidelines.
        2. If you registered multiple children, they will be grouped into their respective age classes.

        Should you have any questions, feel free to contact us via WhatsApp at +2349000000000 or email us at info@codextech.com.

        Get ready for a month of exciting coding, games, website building, and AI creation!

        Best regards,
        **The CODE-X Tech Team**
        *Empowering Young Innovators*
      `,
      registrationId,
      sentAt: new Date().toISOString(),
    };

    // Log the email in Firestore (since we don't have a mail server)
    await addDoc(collection(db, 'bootcamp_emails'), emailPayload);

    // Also print to the server console for developers to inspect
    console.log('============================================================');
    console.log(`[SIMULATED EMAIL SENT] to ${validated.data.email}`);
    console.log(`Subject: ${emailPayload.subject}`);
    console.log(`Body excerpt: \n${emailPayload.body.trim().substring(0, 400)}...`);
    console.log('============================================================');

    return {
      success: true,
      registrationId,
      docId: docRef.id,
    };
  } catch (error: any) {
    console.error('Error processing bootcamp registration:', error);
    throw new Error(error.message || 'Failed to save registration. Please contact support.');
  }
}
