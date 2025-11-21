/**
 * Type definitions for admin assistant
 */

import { z } from 'zod';

// Input schema for admin assistant
export const AdminAssistantInputSchema = z.object({
  task: z.enum(['create_course', 'assign_course', 'upload_course', 'analyze_course', 'suggest_improvements']),
  context: z.string().describe('Context or description of what the admin wants to do'),
  courseData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    learningObjectives: z.array(z.string()).optional(),
  }).optional(),
  teacherInfo: z.object({
    teacherId: z.string().optional(),
    teacherName: z.string().optional(),
    specialization: z.string().optional(),
  }).optional(),
  uploadData: z.object({
    fileType: z.enum(['video', 'document', 'presentation', 'code', 'other']).optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    description: z.string().optional(),
  }).optional(),
});

// Output schema for admin assistant
export const AdminAssistantOutputSchema = z.object({
  response: z.string().describe('AI assistant response'),
  suggestions: z.array(z.string()).optional().describe('Suggested actions or improvements'),
  generatedContent: z.object({
    courseStructure: z.object({
      modules: z.array(z.object({
        title: z.string(),
        description: z.string(),
        lessons: z.array(z.object({
          title: z.string(),
          content: z.string(),
          duration: z.string(),
        })),
      })),
    }).optional(),
    assignmentSuggestions: z.array(z.object({
      teacherId: z.string(),
      teacherName: z.string(),
      reason: z.string(),
      compatibility: z.number().min(0).max(100),
    })).optional(),
    uploadRecommendations: z.array(z.object({
      fileType: z.string(),
      fileName: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
    })).optional(),
  }).optional(),
  nextSteps: z.array(z.string()).optional().describe('Recommended next steps'),
});

export type AdminAssistantInput = z.infer<typeof AdminAssistantInputSchema>;
export type AdminAssistantOutput = z.infer<typeof AdminAssistantOutputSchema>;

