
import { z } from 'zod';

// Schema for sending general notifications from admin
export const sendMessageFormSchema = z.discriminatedUnion("targetType", [
    z.object({
        targetType: z.literal("general"),
        title: z.string().min(1, 'Title is required.'),
        body: z.string().min(1, 'Body is required.'),
        userId: z.string().optional(), // Not needed for general
    }),
    z.object({
        targetType: z.literal("direct"),
        title: z.string().min(1, 'Title is required.'),
        body: z.string().min(1, 'Body is required.'),
        userId: z.string().min(1, "A recipient is required for direct messages."),
    }),
]);


// Schema for AI Code Analysis
export const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

export const AnalyzeCodeOutputSchema = z.object({
  explanation: z.string().describe("A description of what the code is intended to do, its logic, and flow."),
  feedback: z.string().describe("Constructive feedback identifying potential bugs, style issues, or areas for improvement. If the code is good, acknowledge it."),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;


// Schema for AI Coach Chat
export const ChatWithElaraInputSchema = z.object({
  userName: z.string().describe('The name of the user engaging with the AI.'),
  message: z.string().describe("The user's message to Elara."),
  history: z
    .array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    }))
    .describe('The history of the conversation so far.'),
});
export type ChatWithElaraInput = z.infer<typeof ChatWithElaraInputSchema>;

export const ChatWithElaraOutputSchema = z.object({
  reply: z.string().describe("Elara's response to the user."),
});
export type ChatWithElaraOutput = z.infer<typeof ChatWithElaraOutputSchema>;

// Schema for Admin Agent Chat
export const ChatWithAdminAgentInputSchema = z.object({
  adminName: z.string().describe('The name of the admin engaging with the AI.'),
  message: z.string().describe("The admin's message or command."),
  history: z
    .array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    }))
    .describe('The history of the conversation so far.'),
});
export type ChatWithAdminAgentInput = z.infer<typeof ChatWithAdminAgentInputSchema>;

export const ChatWithAdminAgentOutputSchema = z.object({
  reply: z.string().describe("The agent's response."),
  suggestedAction: z.object({
    type: z.enum([
      'CREATE_EXAM',
      'DELETE_EXAM',
      'CREATE_ASSIGNMENT',
      'DELETE_ASSIGNMENT',
      'GRADE_SUBMISSION',
      'SEND_NOTIFICATION',
      'CREATE_COURSE',
      'DELETE_COURSE',
      'GENERATE_ACCESS_CODES',
      'NAVIGATE',
      'GENERATE_COURSE_CONTENT',
      'NONE'
    ]),
    data: z.any().optional(),
  }).optional(),
});
export type ChatWithAdminAgentOutput = z.infer<typeof ChatWithAdminAgentOutputSchema>;

