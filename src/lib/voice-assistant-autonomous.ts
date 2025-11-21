'use server';

/**
 * Autonomous Voice Assistant
 * Natural language processing with action execution
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getWebsiteContext, getCourseDetails, getUserDetails } from './voice-assistant-context';
import { executeAction, fetchCourseIds, findCourseByName } from './voice-assistant-executor';
import type { ExecutionResult, AutonomousResponse } from './voice-assistant-types';

// Schema for AI to determine intent and actions
const IntentAnalysisSchema = z.object({
  intent: z.string().describe('The user\'s intent in natural language'),
  actionRequired: z.boolean().describe('Whether an action needs to be executed'),
  actionType: z.string().optional().describe('Type of action: create_course, update_course, assign_teacher, enroll_student, create_assignment, send_notification, grade_submission, publish_course, delete_course, etc.'),
  actionParams: z.record(z.any()).optional().describe('Parameters for the action'),
  needsConfirmation: z.boolean().describe('Whether user confirmation is needed'),
  response: z.string().describe('Natural conversational response to the user'),
  followUpQuestions: z.array(z.string()).optional().describe('Questions to ask if more information is needed'),
});

type IntentAnalysis = z.infer<typeof IntentAnalysisSchema>;

/**
 * Process natural language input and execute actions autonomously
 */
export async function processAutonomousCommand(params: {
  userMessage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userId?: string;
  autoExecute?: boolean; // If true, executes actions without confirmation
}): Promise<AutonomousResponse> {
  try {
    const { userMessage, conversationHistory = [], autoExecute = false } = params;

    const lowerMessage = userMessage.toLowerCase();

    // Handle course ID requests directly
    if (lowerMessage.includes('course id') || 
        lowerMessage.includes('course ids') || 
        (lowerMessage.includes('show') && lowerMessage.includes('id')) ||
        (lowerMessage.includes('list') && lowerMessage.includes('id')) ||
        (lowerMessage.includes('get') && lowerMessage.includes('course') && lowerMessage.includes('id'))) {
      
      const courses = await fetchCourseIds();
      
      let responseMessage = `Here are all ${courses.length} course IDs:\n\n`;
      courses.forEach(course => {
        responseMessage += `• **${course.title}**\n  ID: \`${course.id}\`\n  Status: ${course.status || 'Draft'}\n  Enrollments: ${course.enrollments || 0}\n\n`;
      });
      
      return {
        message: responseMessage,
        actionExecuted: false,
        data: { courses },
      };
    }

    // Handle finding specific course by name
    if ((lowerMessage.includes('find') || lowerMessage.includes('get') || lowerMessage.includes('show')) && 
        (lowerMessage.includes('course') && !lowerMessage.includes('all'))) {
      
      // Extract course name from message
      const words = userMessage.split(' ');
      const courseKeywords = words.slice(words.findIndex(w => w.toLowerCase().includes('course')) + 1);
      const courseName = courseKeywords.join(' ').replace(/[?.!]/g, '').trim();
      
      if (courseName) {
        const course = await findCourseByName(courseName);
        
        if (course) {
          return {
            message: `Found course: **${course.title}**\nID: \`${course.id}\`\nStatus: ${course.status || 'Draft'}\nEnrollments: ${course.enrollments || 0}\nDescription: ${course.description || 'No description'}`,
            actionExecuted: false,
            data: { course },
          };
        } else {
          return {
            message: `I couldn't find a course matching "${courseName}". Would you like me to list all available courses?`,
            actionExecuted: false,
          };
        }
      }
    }

    // Get complete website context
    const websiteContext = await getWebsiteContext();

    // Build context string
    const contextString = buildContextString(websiteContext, conversationHistory);

    // Analyze intent with AI
    const intentAnalysis = await analyzeIntent(userMessage, contextString);

    // If no action required, just return the response
    if (!intentAnalysis.actionRequired) {
      return {
        message: intentAnalysis.response,
        actionExecuted: false,
      };
    }

    // If needs confirmation and autoExecute is false, ask for confirmation
    if (intentAnalysis.needsConfirmation && !autoExecute) {
      return {
        message: intentAnalysis.response,
        needsConfirmation: true,
        followUpQuestions: intentAnalysis.followUpQuestions,
        actionExecuted: false,
      };
    }

    // Execute the action
    if (intentAnalysis.actionType && intentAnalysis.actionParams) {
      const executionResult = await executeAction(
        intentAnalysis.actionType,
        intentAnalysis.actionParams
      );

      // Build response based on execution result
      const finalResponse = executionResult.success
        ? `${intentAnalysis.response}\n\n✅ ${executionResult.message}`
        : `${intentAnalysis.response}\n\n❌ ${executionResult.message}`;

      return {
        message: finalResponse,
        actionExecuted: true,
        executionResult,
      };
    }

    // If we have follow-up questions, ask them
    if (intentAnalysis.followUpQuestions && intentAnalysis.followUpQuestions.length > 0) {
      return {
        message: intentAnalysis.response,
        followUpQuestions: intentAnalysis.followUpQuestions,
        actionExecuted: false,
      };
    }

    // Default: just return the response
    return {
      message: intentAnalysis.response,
      actionExecuted: false,
    };
  } catch (error) {
    console.error('Error in autonomous command processing:', error);
    return {
      message: "I'm sorry, I encountered an error processing your request. Could you please rephrase that?",
      actionExecuted: false,
    };
  }
}

/**
 * Analyze user intent with AI
 */
async function analyzeIntent(
  userMessage: string,
  context: string
): Promise<IntentAnalysis> {
  const systemPrompt = `You are Elara, an advanced autonomous AI assistant for Code-X, a coding education platform.

**Your Capabilities:**
You can ACTUALLY PERFORM ACTIONS on the website, not just provide information. You have full control to:
- Create, update, and delete courses
- Assign teachers to courses
- Enroll students
- Create assignments, projects, and exams
- Grade submissions
- Send notifications
- Publish courses
- Generate access codes
- Update user roles
- And ANY other administrative task

**Your Personality:**
- Natural, conversational, and friendly
- Proactive and intelligent
- Understand context and intent perfectly
- Ask clarifying questions when needed
- Execute actions confidently when intent is clear

**Decision Making:**
1. Understand what the user wants
2. Determine if you have enough information to act
3. If yes: Execute the action autonomously
4. If no: Ask specific follow-up questions
5. For destructive actions (delete, remove): Ask for confirmation
6. For everything else: Just do it and confirm after

**Action Types Available:**
- create_course: Create a new course
- update_course: Modify existing course
- delete_course: Remove a course
- assign_teacher: Assign teacher to course
- publish_course: Publish a draft course
- enroll_student: Enroll a student in a course
- create_assignment: Create new assignment
- send_notification: Send message/notification
- grade_submission: Grade student work
- generate_access_codes: Create access codes
- update_user_role: Change user permissions
- bulk_publish: Publish multiple courses

**Response Guidelines:**
- Be conversational and natural
- Confirm actions AFTER executing them
- Explain what you're doing
- If something is unclear, ask specific questions
- Don't ask for permission unless it's destructive
- Be proactive and helpful`;

  const userPrompt = `User Message: "${userMessage}"

Website Context:
${context}

Analyze this request and determine:
1. What does the user want?
2. Should an action be executed?
3. If yes, what action and with what parameters?
4. Should I ask for confirmation? (Only for destructive actions like delete)
5. What should I say to the user?

Remember: You can and should execute actions directly. Only ask for confirmation for deletions or bulk operations.`;

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-1.5-flash-latest',
    system: systemPrompt,
    prompt: userPrompt,
    output: {
      schema: IntentAnalysisSchema,
    },
  });

  return llmResponse.output as IntentAnalysis;
}

/**
 * Build context string for AI
 */
function buildContextString(
  websiteContext: any,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const lines: string[] = [];

  // Add conversation history
  if (conversationHistory.length > 0) {
    lines.push('=== RECENT CONVERSATION ===');
    conversationHistory.slice(-10).forEach(msg => {
      lines.push(`${msg.role === 'user' ? 'User' : 'Elara'}: ${msg.content}`);
    });
    lines.push('');
  }

  // Add website state
  lines.push('=== CURRENT WEBSITE STATE ===');
  lines.push(`Courses: ${websiteContext.stats.totalCourses} (${websiteContext.courses.filter((c: any) => c.status === 'Published').length} published)`);
  lines.push(`Users: ${websiteContext.stats.totalUsers}`);
  lines.push(`Teachers: ${websiteContext.stats.totalTeachers}`);
  lines.push(`Enrollments: ${websiteContext.stats.totalEnrollments}`);
  lines.push('');

  // Add courses summary
  if (websiteContext.courses.length > 0) {
    lines.push('Courses:');
    websiteContext.courses.forEach((course: any) => {
      lines.push(`- "${course.title}" (ID: ${course.id}, Status: ${course.status || 'Draft'}, Teacher: ${course.teacherId || 'None'}, Enrollments: ${course.enrollments || 0})`);
    });
    lines.push('');
  }

  // Add teachers summary
  if (websiteContext.teachers.length > 0) {
    lines.push('Teachers:');
    websiteContext.teachers.forEach((teacher: any) => {
      lines.push(`- ${teacher.displayName} (ID: ${teacher.id})`);
    });
    lines.push('');
  }

  // Add pending items
  const pendingSubmissions = websiteContext.submissions.filter((s: any) => s.status === 'Pending');
  if (pendingSubmissions.length > 0) {
    lines.push(`Pending Submissions: ${pendingSubmissions.length}`);
  }

  return lines.join('\n');
}

/**
 * Process confirmation response
 */
export async function processConfirmation(params: {
  confirmed: boolean;
  actionType: string;
  actionParams: any;
  originalMessage: string;
}): Promise<AutonomousResponse> {
  const { confirmed, actionType, actionParams, originalMessage } = params;

  if (!confirmed) {
    return {
      message: "Okay, I won't proceed with that action. Is there anything else I can help you with?",
      actionExecuted: false,
    };
  }

  // Execute the action
  const executionResult = await executeAction(actionType, actionParams);

  const message = executionResult.success
    ? `Perfect! ${executionResult.message}`
    : `I encountered an issue: ${executionResult.message}`;

  return {
    message,
    actionExecuted: true,
    executionResult,
  };
}

