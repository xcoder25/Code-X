/**
 * Type definitions for voice assistant
 */

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface AutonomousResponse {
  message: string;
  actionExecuted?: boolean;
  executionResult?: ExecutionResult;
  needsConfirmation?: boolean;
  followUpQuestions?: string[];
  data?: any;
}

export interface CourseInfo {
  id: string;
  title: string;
  description?: string;
  status?: string;
  teacherId?: string;
  enrollments?: number;
  tags?: string[];
}

