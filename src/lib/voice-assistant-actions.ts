'use server';

/**
 * Enhanced Voice Assistant Actions
 * Integrates website context, conversation memory, and AI processing
 */

import { adminAssistantFlow, AdminAssistantInput } from '@/ai/flows/admin-assistant-flow';
import { getWebsiteContext, getCourseDetails, getUserDetails, getAnalytics, searchContent } from './voice-assistant-context';

export interface VoiceAssistantRequest {
  userMessage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userId?: string;
  specificContext?: {
    courseId?: string;
    userId?: string;
    topic?: string;
  };
}

export interface VoiceAssistantResponse {
  message: string;
  actions?: any[];
  data?: any;
  suggestions?: string[];
}

/**
 * Process voice command with full website context and memory
 */
export async function processVoiceCommand(
  request: VoiceAssistantRequest
): Promise<VoiceAssistantResponse> {
  try {
    const { userMessage, conversationHistory = [], specificContext } = request;

    // Get complete website context
    const websiteContext = await getWebsiteContext();

    // Build comprehensive context string
    let contextString = buildContextString(websiteContext);

    // Add specific context if provided
    if (specificContext?.courseId) {
      const courseDetails = await getCourseDetails(specificContext.courseId);
      if (courseDetails) {
        contextString += `\n\nCurrent Course Context:\n${JSON.stringify(courseDetails, null, 2)}`;
      }
    }

    if (specificContext?.userId) {
      const userDetails = await getUserDetails(specificContext.userId);
      if (userDetails) {
        contextString += `\n\nCurrent User Context:\n${JSON.stringify(userDetails, null, 2)}`;
      }
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      const historyString = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Elara'}: ${msg.content}`)
        .join('\n');
      contextString += `\n\nPrevious Conversation:\n${historyString}`;
    }

    // Determine task type from user message
    const taskType = determineTaskType(userMessage);

    // Prepare AI input
    const aiInput: AdminAssistantInput = {
      task: taskType as any,
      context: `${userMessage}\n\n${contextString}`,
      courseData: specificContext?.courseId ? { title: specificContext.courseId } : undefined,
    };

    // Call AI flow
    const aiResponse = await adminAssistantFlow(aiInput);

    return {
      message: aiResponse.response,
      suggestions: aiResponse.suggestions,
      data: aiResponse.generatedContent,
    };
  } catch (error) {
    console.error('Error processing voice command:', error);
    return {
      message: "I'm sorry, I encountered an error processing your request. Please try again or rephrase your question.",
      suggestions: ['Try asking about courses', 'Ask for help', 'Check platform statistics'],
    };
  }
}

/**
 * Build comprehensive context string from website data
 */
function buildContextString(context: any): string {
  const lines: string[] = [];

  lines.push('=== COMPLETE WEBSITE KNOWLEDGE ===\n');

  // Platform Statistics
  lines.push('## Platform Statistics');
  lines.push(`Total Courses: ${context.stats.totalCourses}`);
  lines.push(`Total Users: ${context.stats.totalUsers}`);
  lines.push(`Total Teachers: ${context.stats.totalTeachers}`);
  lines.push(`Total Enrollments: ${context.stats.totalEnrollments}`);
  lines.push(`Active Subscriptions: ${context.stats.activeSubscriptions}\n`);

  // Courses
  if (context.courses.length > 0) {
    lines.push('## Available Courses');
    context.courses.forEach((course: any) => {
      lines.push(
        `- ${course.title} (ID: ${course.id})
          Status: ${course.status || 'Draft'}
          Enrollments: ${course.enrollments || 0}
          Tags: ${course.tags?.join(', ') || 'None'}
          Teacher: ${course.teacherId || 'Unassigned'}
          Premium: ${course.premium ? 'Yes' : 'No'}
          Price: ${course.price || 0}`
      );
    });
    lines.push('');
  }

  // Teachers
  if (context.teachers.length > 0) {
    lines.push('## Available Teachers');
    context.teachers.forEach((teacher: any) => {
      lines.push(
        `- ${teacher.displayName} (ID: ${teacher.id})
          Email: ${teacher.email}`
      );
    });
    lines.push('');
  }

  // Users Summary
  if (context.users.length > 0) {
    lines.push(`## Users (${context.users.length} total)`);
    lines.push(
      `Active Students: ${context.users.filter((u: any) => u.subscription?.status === 'active').length}`
    );
    lines.push('');
  }

  // Assignments
  if (context.assignments.length > 0) {
    lines.push(`## Assignments (${context.assignments.length} total)`);
    context.assignments.slice(0, 5).forEach((assignment: any) => {
      lines.push(`- ${assignment.title} (Course: ${assignment.courseTitle})`);
    });
    lines.push('');
  }

  // Projects
  if (context.projects.length > 0) {
    lines.push(`## Projects (${context.projects.length} total)`);
    context.projects.slice(0, 5).forEach((project: any) => {
      lines.push(`- ${project.title} (Course: ${project.courseTitle})`);
    });
    lines.push('');
  }

  // Exams
  if (context.exams.length > 0) {
    lines.push(`## Exams (${context.exams.length} total)`);
    context.exams.slice(0, 5).forEach((exam: any) => {
      lines.push(`- ${exam.title} (Course: ${exam.courseTitle})`);
    });
    lines.push('');
  }

  // Submissions
  if (context.submissions.length > 0) {
    lines.push(`## Recent Submissions (${context.submissions.length} total)`);
    lines.push(
      `Pending: ${context.submissions.filter((s: any) => s.status === 'Pending').length}`
    );
    lines.push(
      `Graded: ${context.submissions.filter((s: any) => s.status === 'Graded').length}`
    );
    lines.push('');
  }

  // Live Classes
  if (context.liveClasses.length > 0) {
    lines.push(`## Scheduled Live Classes (${context.liveClasses.length} total)`);
    context.liveClasses.slice(0, 5).forEach((liveClass: any) => {
      lines.push(`- ${liveClass.title} (Course: ${liveClass.courseTitle})`);
    });
    lines.push('');
  }

  lines.push('=== END OF WEBSITE KNOWLEDGE ===');

  return lines.join('\n');
}

/**
 * Determine task type from user message
 */
function determineTaskType(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('create') && lowerMessage.includes('course')) {
    return 'create_course';
  }
  if (lowerMessage.includes('assign') && (lowerMessage.includes('teacher') || lowerMessage.includes('instructor'))) {
    return 'assign_course';
  }
  if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return 'upload_course';
  }
  if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
    return 'analyze_course';
  }
  if (lowerMessage.includes('improve') || lowerMessage.includes('suggestion')) {
    return 'suggest_improvements';
  }

  return 'create_course'; // Default to general assistance
}

/**
 * Quick query for simple information requests
 */
export async function quickQuery(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase();

  // Handle stats queries
  if (lowerQuery.includes('how many') || lowerQuery.includes('total')) {
    const context = await getWebsiteContext();
    
    if (lowerQuery.includes('course')) {
      return `We currently have ${context.stats.totalCourses} courses on the platform. ${context.courses.filter((c: any) => c.status === 'Published').length} are published and ${context.courses.filter((c: any) => c.status === 'Draft').length} are in draft.`;
    }
    if (lowerQuery.includes('user') || lowerQuery.includes('student')) {
      return `We have ${context.stats.totalUsers} registered users, with ${context.stats.activeSubscriptions} active subscriptions.`;
    }
    if (lowerQuery.includes('teacher')) {
      return `We have ${context.stats.totalTeachers} teachers on the platform.`;
    }
    if (lowerQuery.includes('enrollment')) {
      return `There are ${context.stats.totalEnrollments} total course enrollments across the platform.`;
    }
  }

  // Handle search queries
  if (lowerQuery.includes('find') || lowerQuery.includes('search')) {
    const searchTerm = query.replace(/find|search|for|me/gi, '').trim();
    if (searchTerm) {
      const results = await searchContent(searchTerm);
      const coursesFound = results.courses.length;
      const usersFound = results.users.length;
      
      return `I found ${coursesFound} courses and ${usersFound} users matching "${searchTerm}". Would you like more details about any of these?`;
    }
  }

  // Handle analytics queries
  if (lowerQuery.includes('analytics') || lowerQuery.includes('report') || lowerQuery.includes('statistics')) {
    const analytics = await getAnalytics();
    if (analytics) {
      return `Here's a quick overview: ${analytics.overview.totalCourses} total courses (${analytics.courses.published} published, ${analytics.courses.draft} draft), ${analytics.overview.totalUsers} users, ${analytics.engagement.totalSubmissions} submissions, and ${analytics.engagement.totalAssignments} assignments. The top course is "${analytics.popular.topCourses[0]?.title}" with ${analytics.popular.topCourses[0]?.enrollments} enrollments.`;
    }
  }

  return '';
}

/**
 * Get context-aware suggestions based on current state
 */
export async function getSmartSuggestions(): Promise<string[]> {
  const context = await getWebsiteContext();
  const suggestions: string[] = [];

  // Suggest based on current state
  if (context.courses.length === 0) {
    suggestions.push('Create your first course');
  } else {
    const draftCourses = context.courses.filter((c: any) => c.status === 'Draft');
    if (draftCourses.length > 0) {
      suggestions.push(`Publish ${draftCourses.length} draft courses`);
    }
  }

  const unassignedCourses = context.courses.filter((c: any) => !c.teacherId);
  if (unassignedCourses.length > 0) {
    suggestions.push(`Assign teachers to ${unassignedCourses.length} courses`);
  }

  const pendingSubmissions = context.submissions.filter((s: any) => s.status === 'Pending');
  if (pendingSubmissions.length > 0) {
    suggestions.push(`Grade ${pendingSubmissions.length} pending submissions`);
  }

  if (context.assignments.length === 0 && context.courses.length > 0) {
    suggestions.push('Create assignments for your courses');
  }

  suggestions.push('View platform analytics');
  suggestions.push('Generate course content');

  return suggestions.slice(0, 5);
}

