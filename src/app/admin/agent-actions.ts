'use server';

import { db } from '@/lib/firebase';
import {
  collection, collectionGroup, getDocs, limit, query, orderBy, where,
  addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp, writeBatch, Timestamp
} from 'firebase/firestore';
import {
  createExamAction, createAssignmentAction, updateAssignmentAction,
  deleteAssignmentAction, gradeAssignmentAction, sendMessageAction,
  createCourseAction, deleteCourseAction, generateAccessCodesAction,
  deleteExamAction, updateExamAction
} from '@/app/actions';
import { ChatWithAdminAgentInput, ChatWithAdminAgentOutput } from '@/app/schema';

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — Full platform knowledgebase + owner capabilities
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are NEXUS — the omniscient Code-X platform owner agent. You have complete knowledge of the Code-X learning platform and full administrative authority to make any change.

## YOUR IDENTITY
- Name: NEXUS
- Role: Autonomous Platform Owner & Administrator
- Personality: Highly capable, precise, confident. Speak naturally like an expert co-founder, not a chatbot. Use first-person. Be concise and decisive.

## PLATFORM KNOWLEDGE

### What Code-X Is
Code-X is a premium online coding education platform. Key areas:
- **Student Dashboard** — Streaks, XP, career goals, leaderboard, AI insights
- **Courses** — Structured courses with modules and lessons
- **Assignments** — Tasks given to students linked to courses. Students submit Google Colab links.
- **Exams** — MCQ-based timed exams linked to courses. Auto-graded on submission.
- **Lab/Sandbox** — Live-preview HTML/CSS/JS coding environment with AI analysis
- **AI Coach (Elara)** — Conversational learning assistant for students
- **Community Chat** — Real-time peer messaging
- **Inbox/Notifications** — Platform-wide and direct messages to students
- **Access Codes** — Enrollment keys with redemption limits
- **Subscriptions** — Free and paid plans
- **Leaderboard** — Recharts-based performance visualization

### Firestore Collections
- \`users\` — Student profiles (displayName, email, photoURL, plan, streak, goal, createdAt)
- \`courses\` — Courses (title, description, tags, modules, enrollments, status, teacherId)
- \`assignments\` — Tasks (title, courseId, courseTitle, dueDate, description)
- \`exams\` — MCQ assessments (title, courseId, duration_seconds, questions subcollection)
- \`exams/{id}/questions\` — Individual questions (id, text, options[], correctAnswer)
- \`accessCodes\` — Enrollment codes (code, courseId, maxRedemptions, redemptions, status)
- \`notifications\` — Messages (title, body, targetType: 'general'|'direct', userIds, readBy[])
- \`users/{id}/submissions\` — Assignment submissions (status: 'Pending'|'Graded', grade, colabLink)
- \`users/{id}/enrollments\` — Course enrollments (courseId, progress)
- \`users/{id}/friends\` — Social connections

### Admin Capabilities (what you can do)
1. **Course Management**: Create, update, delete courses. Add modules and lessons. Assign teachers.
2. **Assignment Management**: Create, update, delete assignments for any course.
3. **Exam Management**: Create full MCQ exams with any number of questions, update, delete exams.
4. **Grading**: Grade pending student submissions with feedback.
5. **Student Management**: View all students, their enrollment, progress, and submissions.
6. **Notifications**: Send platform-wide broadcasts or direct messages to specific students.
7. **Access Codes**: Generate enrollment access keys with custom prefixes and redemption limits.
8. **Platform Moderation**: Manage community, moderate content.
9. **Analytics**: Audit student performance, course engagement, and platform health.

## RESPONSE STYLE
- Be confident and decisive. Never say "I can't" — instead say what you're about to do or what info you need.
- Speak naturally as a powerful platform owner, not a customer service bot.
- When an action is needed, return a suggestedAction with type and data.
- Use the live platform data provided in [PLATFORM_CONTEXT] to personalize and ground your responses.
- When you don't have enough info (e.g., which course to create an exam for), ask the ONE critical missing piece, don't list multiple questions.

## ACTION TYPES
You can propose these actions:
- CREATE_EXAM: Full exam with questions
- CREATE_ASSIGNMENT: New assignment for a course
- GRADE_SUBMISSION: Grade a pending submission
- SEND_NOTIFICATION: Broadcast or direct message
- CREATE_COURSE: New course with modules
- DELETE_COURSE: Remove a course
- DELETE_EXAM: Remove an exam
- DELETE_ASSIGNMENT: Remove an assignment
- GENERATE_ACCESS_CODES: Enrollment codes
- NONE: Informational response, no action needed
`;

// ─────────────────────────────────────────────────────────────────────────────
// Context Loader — fetches real platform data for each request
// ─────────────────────────────────────────────────────────────────────────────
async function loadPlatformContext() {
  const [usersSnap, coursesSnap, assignmentsSnap, examsSnap, pendingSnap] = await Promise.allSettled([
    getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(20))),
    getDocs(query(collection(db, 'courses'), limit(20))),
    getDocs(query(collection(db, 'assignments'), limit(10))),
    getDocs(query(collection(db, 'exams'), limit(10))),
    // Use collectionGroup to scan ALL submissions subcollections at once
    getDocs(query(collectionGroup(db, 'submissions'), where('status', '==', 'Pending'), orderBy('submittedAt', 'asc'), limit(20))),
  ]);

  const users = usersSnap.status === 'fulfilled' ? usersSnap.value.docs.map(d => ({ id: d.id, ...d.data() })) : [];
  const courses = coursesSnap.status === 'fulfilled' ? coursesSnap.value.docs.map(d => ({ id: d.id, ...d.data() })) : [];
  const assignments = assignmentsSnap.status === 'fulfilled' ? assignmentsSnap.value.docs.map(d => ({ id: d.id, ...d.data() })) : [];
  const exams = examsSnap.status === 'fulfilled' ? examsSnap.value.docs.map(d => ({ id: d.id, ...d.data() })) : [];
  // Each pending submission's userId is the parent doc ID: users/{userId}/submissions/{submissionId}
  const pendingSubmissions = pendingSnap.status === 'fulfilled'
    ? pendingSnap.value.docs.map(d => ({
        submissionId: d.id,
        userId: d.ref.parent.parent!.id,
        ...d.data()
      }))
    : [];

  return { users, courses, assignments, exams, pendingSubmissions };
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight LLM-style parser — maps intent to action data
// ─────────────────────────────────────────────────────────────────────────────
function extractIntent(msg: string) {
  const lower = msg.toLowerCase();
  return {
    createExam: (lower.includes('exam') || lower.includes('quiz') || lower.includes('test')) && 
                (lower.includes('create') || lower.includes('make') || lower.includes('draft') || lower.includes('generate') || lower.includes('build') || lower.includes('add') || lower.includes('set')),
    deleteExam: lower.includes('exam') && (lower.includes('delete') || lower.includes('remove')),
    createAssignment: lower.includes('assignment') && (lower.includes('create') || lower.includes('make') || lower.includes('add') || lower.includes('new') || lower.includes('set')),
    deleteAssignment: lower.includes('assignment') && (lower.includes('delete') || lower.includes('remove')),
    gradeStudent: lower.includes('grade') || lower.includes('mark') || lower.includes('score'),
    sendNotification: lower.includes('broadcast') || lower.includes('notify') || lower.includes('announce') || lower.includes('message') || lower.includes('send'),
    createCourse: (lower.includes('course') || lower.includes('curriculum')) && (lower.includes('create') || lower.includes('make') || lower.includes('add') || lower.includes('new') || lower.includes('build')),
    deleteCourse: lower.includes('course') && (lower.includes('delete') || lower.includes('remove')),
    generateCodes: lower.includes('access code') || lower.includes('enrollment code') || lower.includes('generate code') || lower.includes('access key'),
    auditStudents: lower.includes('audit') || lower.includes('failing') || lower.includes('struggling') || lower.includes('at risk') || lower.includes('performance'),
    platformStatus: lower.includes('how many') || lower.includes('status') || lower.includes('overview') || lower.includes('summary') || lower.includes('report') || lower.includes('stats'),
    pendingSubmissions: lower.includes('pending') || lower.includes('ungraded') || lower.includes('waiting'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Agent Function
// ─────────────────────────────────────────────────────────────────────────────
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────────────────────
export async function chatWithAdminAgentAction(
  input: ChatWithAdminAgentInput,
): Promise<ChatWithAdminAgentOutput> {
  const { message, adminName, history } = input;
  const ctx = await loadPlatformContext();

  const firstName = adminName.split(' ')[0];
  const courseList = ctx.courses.map((c: any) => `"${c.title}" (ID: ${c.id})`).join(', ') || 'None yet';
  const studentCount = ctx.users.length;
  const courseCount = ctx.courses.length;
  const examCount = ctx.exams.length;
  const assignmentCount = ctx.assignments.length;

  // 1. Attempt Real AI Generation if API key is present
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast and capable

      const aiPrompt = `${SYSTEM_PROMPT}

[PLATFORM_CONTEXT]
Stats: ${studentCount} Students, ${courseCount} Courses, ${examCount} Exams, ${ctx.pendingSubmissions.length} Pending Submissions to grade.
Courses (Target these IDs for exams/assignments): ${JSON.stringify(ctx.courses.map((c: any) => ({ title: c.title, id: c.id })))}
Pending Submissions (Target these for grading): ${JSON.stringify(ctx.pendingSubmissions.map((s: any) => ({ userName: s.userName, assignmentTitle: s.assignmentTitle, submissionId: s.submissionId, userId: s.userId })))}

You MUST respond strictly with a valid JSON object matching this schema. Write NO markdown code blocks around the JSON (do not use \`\`\`json). Just the raw object:
{
  "reply": "Your conversational response as NEXUS",
  "suggestedAction": {
    "type": "ACTION_TYPE_HERE",
    "data": { /* necessary payload fields for the action */ }
  }
}
If no action is needed, return {"type": "NONE"} for suggestedAction.

Admin Name: ${firstName}
Admin Request: "${message}"`;

      const result = await model.generateContent(aiPrompt);
      let text = result.response.text().trim();
      
      // Strip markdown code blocks if the model still adds them
      if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json/, '');
      if (text.startsWith('\`\`\`')) text = text.replace(/^\`\`\`/, '');
      if (text.endsWith('\`\`\`')) text = text.slice(0, -3);
      
      const parsed = JSON.parse(text);
      if (parsed.reply && parsed.suggestedAction) {
        return parsed;
      }
    } catch (err) {
      console.error("Gemini AI Engine failed or isn't formatted correctly, falling back to heuristic...", err);
    }
  }

  // 2. Fallback Heuristic Logic
  const intent = extractIntent(message);

  // ── Platform Status / Overview ───────────────────────────────────────────
  if (intent.platformStatus) {
    return {
      reply: `Here's your live platform status, ${firstName}:\n\n📊 **Platform Overview**\n- **Students**: ${studentCount} registered\n- **Courses**: ${courseCount} active\n- **Exams**: ${examCount} published\n- **Assignments**: ${assignmentCount} active\n\n**Latest Students**: ${ctx.users.slice(0,3).map((u: any) => u.displayName || u.email).join(', ')}\n**Active Courses**: ${ctx.courses.slice(0,3).map((c: any) => c.title).join(', ') || 'None yet'}\n\nEverything is running nominally. What should we optimize?`,
      suggestedAction: { type: 'NONE' }
    };
  }

  // ── Create Exam ──────────────────────────────────────────────────────────
  if (intent.createExam) {
    const firstCourse = ctx.courses[0] as any;
    if (!firstCourse) {
      return {
        reply: `I need at least one course to attach this exam to. Create a course first, then I'll deploy the exam immediately.`,
        suggestedAction: { type: 'NONE' }
      };
    }

    // Try to detect which course from message
    const mentionedCourse = ctx.courses.find((c: any) => message.toLowerCase().includes(c.title?.toLowerCase())) as any;
    const targetCourse = mentionedCourse || firstCourse;

    const isJS = targetCourse.title?.toLowerCase().includes('javascript') || message.toLowerCase().includes('javascript') || message.toLowerCase().includes('js');
    const isReact = targetCourse.title?.toLowerCase().includes('react');

    let questions = [];
    if (isJS) {
      questions = [
        { id: 'q1', text: 'Which keyword is used to declare a block-scoped variable in JavaScript?', options: ['var', 'let', 'def', 'const'], correctAnswer: 'let' },
        { id: 'q2', text: 'What does the "this" keyword refer to in a standard function call context?', options: ['The global object', 'The function itself', 'The previous function', 'Nothing'], correctAnswer: 'The global object' },
        { id: 'q3', text: 'What is a JavaScript closure?', options: ['A function bundled with its lexical environment', 'A secure way to close a database', 'A method to stop execution', 'A syntax for closing HTML tags'], correctAnswer: 'A function bundled with its lexical environment' },
        { id: 'q4', text: 'Which array method creates a new array with the results of calling a provided function on every element?', options: ['forEach()', 'map()', 'filter()', 'reduce()'], correctAnswer: 'map()' },
        { id: 'q5', text: 'What does "async/await" synthesize on top of?', options: ['Callbacks', 'Promises', 'Generators', 'Threads'], correctAnswer: 'Promises' }
      ];
    } else if (isReact) {
      questions = [
        { id: 'q1', text: 'What hook is used to manage state in a React functional component?', options: ['useContext', 'useState', 'useEffect', 'useReducer'], correctAnswer: 'useState' },
        { id: 'q2', text: 'Which method must be implemented in a React class component?', options: ['render()', 'componentDidMount()', 'constructor()', 'update()'], correctAnswer: 'render()' },
        { id: 'q3', text: 'How do you pass data from a parent component to a child component?', options: ['Using State', 'Using Hooks', 'Using Context', 'Using Props'], correctAnswer: 'Using Props' },
        { id: 'q4', text: 'What is the Virtual DOM?', options: ['A direct copy of the browser DOM', 'A lightweight JavaScript representation of the DOM', 'A new browser specification', 'A React Native abstraction'], correctAnswer: 'A lightweight JavaScript representation of the DOM' },
        { id: 'q5', text: 'Which hook is used for performing side effects in functional components?', options: ['useSideEffect', 'useState', 'useEffect', 'useMemo'], correctAnswer: 'useEffect' }
      ];
    } else {
      questions = [
        { id: 'q1', text: `What is the primary purpose of ${targetCourse.title}?`, options: ['Build scalable apps', 'Style websites only', 'Manage databases', 'Handle networking'], correctAnswer: 'Build scalable apps' },
        { id: 'q2', text: 'Which concept is considered foundational in modern web development?', options: ['Component-Based Architecture', 'Waterfall Models', 'Monolithic Servers', 'DOM Rewriting'], correctAnswer: 'Component-Based Architecture' },
        { id: 'q3', text: 'What does async/await help achieve in JavaScript?', options: ['Readable async code', 'Faster CSS rendering', 'Database indexing', 'Static typing'], correctAnswer: 'Readable async code' },
        { id: 'q4', text: 'Which data structure is commonly used for real-time updates in Firebase?', options: ['Firestore Listeners', 'SQL Tables', 'Local Storage', 'Session Cookies'], correctAnswer: 'Firestore Listeners' },
        { id: 'q5', text: 'What does "DRY" stand for in programming best practices?', options: ["Don't Repeat Yourself", 'Data Relay Yield', 'Dynamic Runtime Yield', 'Define React Yet'], correctAnswer: "Don't Repeat Yourself" }
      ];
    }

    return {
      reply: `Exam drafted for **${targetCourse.title}**. I've structured 5 technical questions covering core concepts with a 30-minute timer. Review the action card and deploy when ready.`,
      suggestedAction: {
        type: 'CREATE_EXAM',
        data: {
          title: `${targetCourse.title}: Module Assessment`,
          courseId: targetCourse.id,
          duration: 30,
          questions
        }
      }
    };
  }

  // ── Delete Exam ──────────────────────────────────────────────────────────
  if (intent.deleteExam && ctx.exams.length > 0) {
    const mentionedExam = ctx.exams.find((e: any) => message.toLowerCase().includes(e.title?.toLowerCase())) as any || ctx.exams[0] as any;
    return {
      reply: `I'll permanently remove the exam **"${mentionedExam.title}"** and all its questions. This cannot be undone. Confirm deployment to execute.`,
      suggestedAction: {
        type: 'DELETE_EXAM',
        data: { examId: mentionedExam.id, title: mentionedExam.title }
      }
    };
  }

  // ── Create Assignment ────────────────────────────────────────────────────
  if (intent.createAssignment) {
    const firstCourse = ctx.courses[0] as any;
    if (!firstCourse) {
      return { reply: `I need a course to link this assignment. Create a course first.`, suggestedAction: { type: 'NONE' } };
    }
    const mentionedCourse = ctx.courses.find((c: any) => message.toLowerCase().includes(c.title?.toLowerCase())) as any || firstCourse;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    return {
      reply: `Assignment staged for **${mentionedCourse.title}**. Students will have 7 days to submit a Google Colab link with their work. Deploy to push it live.`,
      suggestedAction: {
        type: 'CREATE_ASSIGNMENT',
        data: {
          title: `${mentionedCourse.title}: Practical Exercise`,
          courseId: mentionedCourse.id,
          dueDate: dueDate.toISOString(),
          description: `Complete the practical exercise for ${mentionedCourse.title} and submit your Google Colab notebook link.`
        }
      }
    };
  }

  // ── Delete Assignment ────────────────────────────────────────────────────
  if (intent.deleteAssignment && ctx.assignments.length > 0) {
    const target = ctx.assignments.find((a: any) => message.toLowerCase().includes(a.title?.toLowerCase())) as any || ctx.assignments[0] as any;
    return {
      reply: `Ready to delete assignment **"${target.title}"**. This will remove it from the student dashboard. Deploy to confirm.`,
      suggestedAction: {
        type: 'DELETE_ASSIGNMENT',
        data: { assignmentId: target.id, title: target.title }
      }
    };
  }

  // ── Grade Submission ─────────────────────────────────────────────────────
  if (intent.gradeStudent) {
    const pending = ctx.pendingSubmissions;

    if (pending.length === 0) {
      return {
        reply: `All submissions are graded — the queue is empty. Your students are up to date.`,
        suggestedAction: { type: 'NONE' }
      };
    }

    // Extract desired grade from the message if admin specified one
    const gradeMatch = message.match(/\b([A-F][+-]?|\d{1,3}%?)\b/);
    const requestedGrade = gradeMatch?.[0] || null;

    // Build a summary of ALL pending submissions for context
    const summaryLines = pending.slice(0, 5).map((s: any, i: number) =>
      `${i + 1}. **${s.userName}** — "${s.assignmentTitle}" (${s.courseTitle || 'Unknown Course'})${s.colabLink ? ` · [View Colab](${s.colabLink})` : ''} — submitted ${s.submittedAt?.toDate ? new Date(s.submittedAt.toDate()).toLocaleDateString() : 'recently'}`
    ).join('\n');

    // Grade the oldest pending submission (or the first in queue)
    const sub = pending[0] as any;
    const grade = requestedGrade || 'B+';

    return {
      reply: `I found **${pending.length} pending submission(s)** in the real-time queue:\n\n${summaryLines}\n\nGrading the oldest submission — **${sub.userName}**'s work on **"${sub.assignmentTitle}"** with **${grade}**. Deploy to write this grade to their dashboard instantly.`,
      suggestedAction: {
        type: 'GRADE_SUBMISSION',
        data: {
          userId: sub.userId,
          submissionId: sub.submissionId,
          userName: sub.userName,
          assignmentTitle: sub.assignmentTitle,
          colabLink: sub.colabLink || null,
          grade,
          feedback: `Your submission for "${sub.assignmentTitle}" has been reviewed. Grade: ${grade}. Keep up the great work and review any feedback on your Colab notebook.`
        }
      }
    };
  }

  // ── Send Notification ────────────────────────────────────────────────────
  if (intent.sendNotification) {
    const isDirect = message.toLowerCase().includes('direct') || message.toLowerCase().includes('specific student');
    const body = message.length > 80
      ? message.replace(/send|broadcast|notify|announce|message|all students/gi, '').trim()
      : `🚀 Code-X Update: New content has been deployed. Log in to explore your latest challenges and keep your streak alive!`;
    return {
      reply: `Notification staged${isDirect ? ' as a direct message' : ' for all students'}. Content looks engaging. Deploy to broadcast now.`,
      suggestedAction: {
        type: 'SEND_NOTIFICATION',
        data: {
          title: 'Code-X Platform Update',
          body,
          targetType: isDirect ? 'direct' : 'general'
        }
      }
    };
  }

  // ── Create Course ────────────────────────────────────────────────────────
  if (intent.createCourse) {
    const titleMatch = message.match(/(?:called|titled|named|about|for|on)\s+"?([^"]+)"?/i);
    const courseTitle = titleMatch?.[1]?.trim() || 'New Course';
    return {
      reply: `Course **"${courseTitle}"** is ready to go. I've pre-built a foundational module structure with intro and core concept lessons. You can expand it in the Courses editor after deploying.`,
      suggestedAction: {
        type: 'CREATE_COURSE',
        data: {
          title: courseTitle,
          description: `A comprehensive course covering ${courseTitle}. Designed for Code-X learners looking to master real-world skills.`,
          tags: courseTitle.split(' ').join(', '),
          modules: [
            {
              id: 'mod-1',
              title: 'Introduction & Foundations',
              lessons: [
                { id: 'l-1-1', title: 'Welcome & Course Overview', content: `Welcome to ${courseTitle}. In this course, you will master the essential concepts and practical skills needed.` },
                { id: 'l-1-2', title: 'Core Concepts', content: 'This lesson introduces the foundational principles you will build upon throughout the course.' }
              ]
            },
            {
              id: 'mod-2',
              title: 'Core Skills',
              lessons: [
                { id: 'l-2-1', title: 'Hands-On Practice', content: 'Apply what you have learned with practical exercises designed for real-world scenarios.' }
              ]
            }
          ]
        }
      }
    };
  }

  // ── Delete Course ────────────────────────────────────────────────────────
  if (intent.deleteCourse && ctx.courses.length > 0) {
    const target = ctx.courses.find((c: any) => message.toLowerCase().includes(c.title?.toLowerCase())) as any || ctx.courses[0] as any;
    return {
      reply: `⚠️ Deleting **"${target.title}"** is irreversible and will remove the course from all student dashboards. If you're sure, deploy to execute.`,
      suggestedAction: {
        type: 'DELETE_COURSE',
        data: { courseId: target.id, title: target.title }
      }
    };
  }

  // ── Generate Access Codes ─────────────────────────────────────────────────
  if (intent.generateCodes) {
    const firstCourse = ctx.courses[0] as any;
    if (!firstCourse) {
      return { reply: `I need a course to generate codes for. Create a course first.`, suggestedAction: { type: 'NONE' } };
    }
    const quantityMatch = message.match(/(\d+)\s*(?:code|key)/i);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 10;
    return {
      reply: `Ready to generate **${quantity} access codes** for **"${firstCourse.title}"**. Each code allows 1 redemption. Deploy to mint them.`,
      suggestedAction: {
        type: 'GENERATE_ACCESS_CODES',
        data: {
          courseId: firstCourse.id,
          quantity,
          maxRedemptions: 1,
          prefix: 'CX'
        }
      }
    };
  }

  // ── Pending Submissions / Audit ───────────────────────────────────────────
  if (intent.pendingSubmissions || intent.auditStudents) {
    const pending = ctx.pendingSubmissions;
    const pendingCount = pending.length;

    const detailLines = pending.slice(0, 8).map((s: any, i: number) =>
      `${i + 1}. **${s.userName}** — "${s.assignmentTitle}" (${s.courseTitle || 'Unknown Course'})${s.colabLink ? ` · [Colab Link](${s.colabLink})` : ''}`
    ).join('\n');

    return {
      reply: pendingCount === 0
        ? `Audit complete — no pending submissions. All students are graded and up to date.`
        : `Real-time audit complete, ${firstName}. Found **${pendingCount} ungraded submission(s)**:\n\n${detailLines}\n\nSay "grade the submissions" and I'll process the queue, or specify a grade like "give everyone B+" to batch grade.`,
      suggestedAction: { type: 'NONE' }
    };
  }

  // ── Fallback — Smart Contextual Response ─────────────────────────────────
  const recentStudent = ctx.users[0] as any;
  const recentCourse = ctx.courses[0] as any;
  return {
    reply: `Standing by, ${firstName}. The platform is live with **${studentCount} students** across **${courseCount} courses**.\n\nYou can ask me to:\n- **Draft & deploy exams or assignments** for any course\n- **Grade pending student submissions**\n- **Send announcements** to all students or specific users\n- **Create or delete courses** with full module structure\n- **Generate access codes** for enrollment\n- **Pull platform analytics** and student performance reports\n\nJust tell me what needs to be done.`,
    suggestedAction: { type: 'NONE' }
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// Execution Engine — runs the agent's proposed actions
// ─────────────────────────────────────────────────────────────────────────────
export async function executeAdminAction(action: { type: string; data: any }): Promise<{ success: boolean; message: string }> {
  switch (action.type) {
    case 'CREATE_EXAM': {
      const result = await createExamAction(action.data);
      return { success: true, message: `Exam "${action.data.title}" deployed successfully (ID: ${result.id}).` };
    }
    case 'DELETE_EXAM': {
      await deleteExamAction(action.data.examId);
      return { success: true, message: `Exam "${action.data.title}" permanently deleted.` };
    }
    case 'CREATE_ASSIGNMENT': {
      await createAssignmentAction({ ...action.data, dueDate: new Date(action.data.dueDate) });
      return { success: true, message: `Assignment "${action.data.title}" created and visible to students.` };
    }
    case 'DELETE_ASSIGNMENT': {
      await deleteAssignmentAction(action.data.assignmentId);
      return { success: true, message: `Assignment "${action.data.title}" removed.` };
    }
    case 'GRADE_SUBMISSION': {
      // Write grade directly to the real Firestore submission document
      const submissionRef = doc(db, 'users', action.data.userId, 'submissions', action.data.submissionId);
      await updateDoc(submissionRef, {
        grade: action.data.grade,
        feedback: action.data.feedback,
        status: 'Graded',
        gradedAt: serverTimestamp(),
      });
      // Push a real-time notification directly to the student's inbox
      await sendMessageAction({
        title: `Submission Graded: ${action.data.assignmentTitle || 'Your Assignment'}`,
        body: `You received ${action.data.grade}. ${action.data.feedback}`,
        targetType: 'direct',
        userId: action.data.userId,
      });
      return {
        success: true,
        message: `Grade "${action.data.grade}" written to ${action.data.userName || 'student'}'s submission in Firestore. Notification delivered to their inbox.`
      };
    }
    case 'SEND_NOTIFICATION': {
      await sendMessageAction(action.data);
      return { success: true, message: `Notification "${action.data.title}" sent to ${action.data.targetType === 'general' ? 'all students' : 'chosen student'}.` };
    }
    case 'CREATE_COURSE': {
      const result = await createCourseAction(action.data);
      return { success: true, message: `Course "${action.data.title}" created successfully (ID: ${result.id}).` };
    }
    case 'DELETE_COURSE': {
      await deleteCourseAction(action.data.courseId);
      return { success: true, message: `Course "${action.data.title}" deleted from the platform.` };
    }
    case 'GENERATE_ACCESS_CODES': {
      const result = await generateAccessCodesAction(action.data);
      return { success: true, message: `${result.count} access codes generated for enrollment.` };
    }
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
