/**
 * Elara's Knowledge Base
 * Contains comprehensive information about Code-X platform
 */

export const ELARA_KNOWLEDGE = {
  platform: {
    name: "Code-X",
    tagline: "Your personal coding academy",
    description: "Code-X is a comprehensive AI-powered learning management system designed to help students master coding through personalized instruction, interactive projects, and intelligent tutoring.",
  },

  features: {
    forStudents: [
      "Access courses on various programming languages and technologies",
      "Get personalized AI tutoring with real-time help",
      "Submit assignments and projects for automated grading",
      "Take exams with instant feedback",
      "Track your learning progress on a personalized dashboard",
      "Connect with friends and study together",
      "Get interview preparation with AI coach",
      "Work in an interactive coding lab environment",
    ],
    forTeachers: [
      "Create and manage courses with AI assistance",
      "Design assignments and projects",
      "Create and grade exams efficiently",
      "Monitor student progress with analytics",
      "Communicate with students through chat",
      "Schedule classes and office hours",
      "Access teaching dashboard with insights",
    ],
    forAdmins: [
      "Manage all users, courses, and content",
      "Generate access codes for enrollment",
      "Use AI assistant (Elara) for automation",
      "Analyze platform-wide analytics",
      "Manage subscriptions and payments",
      "Control system settings and configuration",
      "Review submissions and grading",
    ],
  },

  aiCapabilities: {
    name: "Elara",
    role: "AI Admin Assistant",
    capabilities: [
      "Create comprehensive course structures with modules and lessons",
      "Intelligently assign courses to the most suitable teachers",
      "Organize uploaded files by module, lesson, type, or chronologically",
      "Analyze course content for quality, completeness, and effectiveness",
      "Suggest improvements for courses and teaching methods",
      "Respond to voice commands for hands-free operation",
      "Generate AI-powered educational content",
      "Provide personalized tutoring to students",
      "Help with interview preparation",
      "Coach students through difficult concepts",
    ],
  },

  sections: {
    student: {
      dashboard: "Overview of enrolled courses, progress, and upcoming deadlines",
      courses: "Browse and access all available courses",
      assignments: "View and submit homework assignments",
      exams: "Take timed exams and quizzes",
      projects: "Work on coding projects with auto-grading",
      lab: "Interactive coding environment with AI assistance",
      aiTutor: "Get personalized help from AI tutor",
      interviewPrep: "Practice technical interviews with AI",
      friends: "Connect with classmates and study partners",
      inbox: "Messages and notifications",
      schedule: "Class schedule and calendar",
      path: "Personalized learning path recommendations",
      settings: "Account settings and preferences",
      subscription: "Manage your subscription plan",
    },
    teacher: {
      dashboard: "Teaching overview and class statistics",
      courses: "Create and manage your courses",
      analytics: "Student performance and engagement metrics",
      chat: "Communicate with students",
      schedule: "Teaching schedule and availability",
      settings: "Teacher preferences and profile",
    },
    admin: {
      dashboard: "Platform-wide overview and metrics",
      users: "Manage all students, teachers, and admins",
      courses: "Oversee all courses on the platform",
      assignments: "Review and manage all assignments",
      exams: "Manage all exams and assessments",
      projects: "Oversee student projects",
      submissions: "Review all student submissions",
      messages: "Platform-wide communication",
      accessCodes: "Generate enrollment codes",
      subscriptions: "Manage user subscriptions",
      aiAssistant: "Access Elara for advanced automation",
      generator: "AI content generation tools",
      settings: "Platform configuration",
    },
  },

  voiceCommands: {
    navigation: [
      { command: "create course", action: "Open course creation form" },
      { command: "assign teacher", action: "Open teacher assignment tool" },
      { command: "upload files", action: "Open file organization tool" },
      { command: "analyze course", action: "Open course analysis tool" },
      { command: "suggest improvements", action: "Open improvement suggestions" },
    ],
    actions: [
      { command: "create course now", action: "Submit the course creation form" },
      { command: "assign course now", action: "Submit teacher assignment" },
    ],
    information: [
      { command: "hello elara", response: "Greet the user warmly" },
      { command: "help", response: "Explain available commands and capabilities" },
      { command: "what can you do", response: "List all capabilities" },
      { command: "tell me about code-x", response: "Explain the platform" },
    ],
  },

  responses: {
    greeting: "Hello! I'm Elara, your AI assistant at Code-X. I'm here to help you manage courses, assign teachers, organize content, and streamline your admin tasks. How can I assist you today?",
    
    help: "I can help you with several tasks: creating comprehensive courses with AI-generated content, assigning the best teachers to courses, organizing uploaded files intelligently, analyzing course quality, and suggesting improvements. Just tell me what you'd like to do, or say commands like 'create course', 'assign teacher', 'upload files', 'analyze course', or 'suggest improvements'. You can also ask me about Code-X features!",
    
    aboutCodeX: "Code-X is your personal coding academy - an AI-powered learning platform where students can learn programming through interactive courses, projects, and personalized AI tutoring. Teachers can create courses and track student progress, while admins like you can manage everything with my help. We offer courses in multiple programming languages, AI tutoring, interview prep, and much more!",
    
    capabilities: "I'm Elara, and I can do quite a lot! I can create entire course structures with modules and lessons, assign the most suitable teachers based on their expertise, organize your course files intelligently, analyze courses for quality and completeness, and suggest improvements. I understand voice commands, so you can work hands-free. I'm also connected to the entire Code-X platform, so I know about all our features for students, teachers, and admins!",
  },
};

/**
 * Process natural language queries about Code-X
 */
export function getElaraResponse(query: string): string | null {
  const q = query.toLowerCase().trim();

  // Platform information
  if (q.includes('what is code-x') || q.includes('tell me about code-x') || q.includes('about code x')) {
    return ELARA_KNOWLEDGE.responses.aboutCodeX;
  }

  // Features inquiry
  if (q.includes('what features') || q.includes('what can code-x do') || q.includes('platform features')) {
    return "Code-X offers comprehensive features for everyone! Students get AI tutoring, interactive courses, coding labs, and interview prep. Teachers can create courses, track progress, and communicate with students. Admins have full control with my AI assistance for course creation, teacher assignment, content organization, and analytics. Would you like to know more about any specific feature?";
  }

  // Student features
  if (q.includes('student features') || q.includes('what can students do')) {
    return "Students on Code-X can access programming courses, get personalized AI tutoring, work in interactive coding labs, take exams with instant feedback, submit projects for auto-grading, practice interview questions, connect with friends, and track their learning progress. Everything is designed to make learning to code engaging and effective!";
  }

  // Teacher features
  if (q.includes('teacher features') || q.includes('what can teachers do')) {
    return "Teachers can create and manage courses with my AI assistance, design assignments and projects, create exams, monitor student progress with detailed analytics, communicate with students through chat, schedule classes, and access teaching insights. I can help generate course content too!";
  }

  // AI capabilities
  if (q.includes('your capabilities') || q.includes('what can you do elara') || q.includes('what are you capable of')) {
    return ELARA_KNOWLEDGE.responses.capabilities;
  }

  // Course creation
  if (q.includes('how to create course') || q.includes('course creation')) {
    return "I can help you create amazing courses! Just go to the Create tab, tell me the course title, description, difficulty level, and learning objectives. I'll generate a complete course structure with modules, lessons, and content. You can enable AI content generation for even more comprehensive courses. Would you like to start creating a course now?";
  }

  // Teacher assignment
  if (q.includes('how to assign teacher') || q.includes('teacher assignment')) {
    return "I can intelligently assign teachers to courses! Just provide the course ID, and I'll analyze available teachers' expertise, specializations, availability, and workload to find the perfect match. You can let me auto-assign, or specify particular requirements. Would you like to assign a teacher now?";
  }

  // File organization
  if (q.includes('organize files') || q.includes('upload files') || q.includes('file organization')) {
    return "I can organize your course files intelligently! Upload your materials, choose how you'd like them organized - by module, lesson, file type, or chronologically - and I'll structure everything clearly. This makes courses more accessible and easier for students to navigate. Want to organize some files?";
  }

  return null;
}

