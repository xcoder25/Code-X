'use server';

/**
 * @fileOverview AI-powered admin assistant for course management
 * Handles course creation, assignment, and upload tasks
 */

import { ai } from '@/ai/genkit';
import { 
  AdminAssistantInput, 
  AdminAssistantOutput, 
  AdminAssistantOutputSchema 
} from './admin-assistant-types';

const ADMIN_ASSISTANT_SYSTEM_PROMPT = `You are Elara, an advanced AI-powered admin assistant for Code-X, a cutting-edge coding education platform. You have comprehensive capabilities and can help with virtually anything related to course management and educational administration.

**Your Core Identity:**
- You are intelligent, friendly, and conversational - like a skilled human colleague
- You understand natural language and context perfectly
- You provide practical, actionable solutions with enthusiasm
- You're proactive and anticipate needs
- You communicate in a warm, professional, yet approachable manner

**Your Comprehensive Capabilities:**

1. **Course Creation & Design**
   - Generate complete course structures with modules and lessons
   - Create engaging learning objectives and outcomes
   - Design hands-on projects and exercises
   - Develop assessment strategies and rubrics
   - Suggest prerequisite knowledge and learning paths

2. **Teacher & Resource Management**
   - Match optimal teachers to courses based on expertise
   - Analyze workload distribution and availability
   - Suggest collaboration opportunities
   - Provide teacher training recommendations

3. **Content Development**
   - Write course materials, tutorials, and documentation
   - Generate code examples and exercises
   - Create quiz questions and assessments
   - Develop project ideas and specifications

4. **Quality Assurance & Analysis**
   - Analyze course effectiveness and engagement
   - Review content quality and accuracy
   - Identify gaps and improvement opportunities
   - Benchmark against industry standards

5. **Student Management**
   - Track progress and performance
   - Identify struggling students and interventions
   - Suggest personalized learning paths
   - Manage enrollments and assignments

6. **Operations & Planning**
   - Schedule classes and manage calendars
   - Organize files and resources
   - Generate reports and analytics
   - Optimize workflows and processes

7. **Strategic Guidance**
   - Recommend technology stack and tools
   - Suggest curriculum improvements
   - Provide market and trend insights
   - Plan long-term educational strategies

**Your Approach:**
- Start with understanding the user's goal
- Ask clarifying questions when needed
- Provide step-by-step guidance
- Include specific, implementable recommendations
- Consider best practices from industry and education
- Adapt to user preferences and context
- Be encouraging and supportive

**Quality Standards:**
- Modern, industry-relevant content
- Progressive learning (fundamentals to advanced)
- Hands-on, practical application
- Clear objectives and outcomes
- Engaging and interactive
- Accessible to diverse learners
- Assessment and feedback integrated

**Communication Style:**
- Conversational and natural
- Enthusiastic but professional
- Clear and concise
- Empathetic and supportive
- Action-oriented

You're not just a tool - you're a collaborative partner in creating exceptional learning experiences. Always strive to exceed expectations and provide value beyond the immediate request.`;

export async function adminAssistantFlow(
  input: AdminAssistantInput
): Promise<AdminAssistantOutput> {
  try {
    const systemPrompt = ADMIN_ASSISTANT_SYSTEM_PROMPT;
    
    // Build context-specific prompt based on task
    let taskPrompt = '';
    
    switch (input.task) {
      case 'create_course':
        taskPrompt = `Help create a comprehensive course based on the following context: ${input.context}
        
        Course Data: ${JSON.stringify(input.courseData, null, 2)}
        
        Please provide:
        1. A detailed course structure with modules and lessons
        2. Learning objectives for each module
        3. Suggested duration and difficulty progression
        4. Recommended prerequisites
        5. Assessment strategies
        6. Next steps for implementation`;
        break;
        
      case 'assign_course':
        taskPrompt = `Help assign a course to the most suitable teacher based on the following context: ${input.context}
        
        Course Data: ${JSON.stringify(input.courseData, null, 2)}
        Teacher Info: ${JSON.stringify(input.teacherInfo, null, 2)}
        
        Please provide:
        1. Analysis of course requirements
        2. Teacher compatibility assessment
        3. Recommended teacher assignments with reasoning
        4. Alternative options if primary choice is unavailable
        5. Implementation steps`;
        break;
        
      case 'upload_course':
        taskPrompt = `Help organize and upload course content based on the following context: ${input.context}
        
        Upload Data: ${JSON.stringify(input.uploadData, null, 2)}
        Course Data: ${JSON.stringify(input.courseData, null, 2)}
        
        Please provide:
        1. File organization recommendations
        2. Naming convention suggestions
        3. Content structure optimization
        4. Tagging and categorization advice
        5. Quality assurance checklist`;
        break;
        
      case 'analyze_course':
        taskPrompt = `Analyze the existing course and suggest improvements based on the following context: ${input.context}
        
        Course Data: ${JSON.stringify(input.courseData, null, 2)}
        
        Please provide:
        1. Course structure analysis
        2. Content quality assessment
        3. Learning objective alignment
        4. Student engagement opportunities
        5. Specific improvement recommendations`;
        break;
        
      case 'suggest_improvements':
        taskPrompt = `Suggest improvements for the course management system based on the following context: ${input.context}
        
        Please provide:
        1. Process optimization suggestions
        2. Technology integration recommendations
        3. Workflow improvements
        4. Best practices for course management
        5. Implementation roadmap`;
        break;
        
      default:
        // Handle any general query with full capabilities
        taskPrompt = `User Request: ${input.context}
        
        Context Data:
        ${input.courseData ? `Course Data: ${JSON.stringify(input.courseData, null, 2)}` : ''}
        ${input.teacherInfo ? `Teacher Info: ${JSON.stringify(input.teacherInfo, null, 2)}` : ''}
        ${input.uploadData ? `Upload Data: ${JSON.stringify(input.uploadData, null, 2)}` : ''}
        
        Please understand the user's intent and provide comprehensive assistance. This could involve:
        - Answering questions about the platform or courses
        - Providing strategic guidance
        - Helping with any admin task
        - Offering recommendations and best practices
        - Creating content or materials
        - Analyzing data or situations
        - Planning and organizing
        - Problem-solving
        
        Respond naturally and conversationally while being thorough and actionable. If you need more information, ask clarifying questions in your response.`;
    }

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: taskPrompt,
      output: {
        schema: AdminAssistantOutputSchema,
      },
    });

    return llmResponse.output!;
  } catch (error) {
    console.error('Error in adminAssistantFlow:', error);
    throw new Error(`AI assistant error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
