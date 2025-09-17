

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


// Schema for AI Mock Interview
export const InterviewPrepInputSchema = z.object({
  userName: z.string().describe('The name of the user engaging with the AI.'),
  topic: z.string().describe('The interview topic the user wants to practice (e.g., React, Python, Data Structures).'),
  message: z.string().describe("The user's answer or message to the AI interviewer."),
  history: z
    .array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    }))
    .describe('The history of the conversation so far.'),
});
export type InterviewPrepInput = z.infer<typeof InterviewPrepInputSchema>;

export const InterviewPrepOutputSchema = z.object({
  reply: z.string().describe("The AI interviewer's next question, follow-up, or feedback."),
});
export type InterviewPrepOutput = z.infer<typeof InterviewPrepOutputSchema>;

// Schema for AI Exam Tutor
const ExamQuestionSchema = z.object({
    id: z.string(),
    text: z.string(),
});

export const TutorMeInputSchema = z.object({
  userName: z.string().describe('The name of the user engaging with the AI.'),
  examTitle: z.string().describe('The title of the exam.'),
  questions: z.array(ExamQuestionSchema).describe('The list of questions from the exam.'),
  studentAnswers: z.record(z.string()).describe('A map of question IDs to the student\'s answers.'),
  message: z.string().describe("The user's question or message to the AI Tutor."),
  history: z
    .array(z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
    }))
    .describe('The history of the conversation so far.'),
});
export type TutorMeInput = z.infer<typeof TutorMeInputSchema>;

export const TutorMeOutputSchema = z.object({
  reply: z.string().describe("The AI Tutor's response, which could be an analysis, a study plan, or an answer to a question."),
});
export type TutorMeOutput = z.infer<typeof TutorMeOutputSchema>;
