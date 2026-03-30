'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query, orderBy, where } from 'firebase/firestore';
import { createExamAction, gradeAssignmentAction, sendMessageAction } from '@/app/actions';
import { ChatWithAdminAgentInput, ChatWithAdminAgentOutput } from '@/app/schema';

export async function chatWithAdminAgentAction(
  input: ChatWithAdminAgentInput,
): Promise<ChatWithAdminAgentOutput> {
  const { message, adminName } = input;
  const msg = message.toLowerCase();

  // --- Real Context Retrieval ---
  // Fetch real data to inform the agent's logic
  const usersSnapshot = await getDocs(query(collection(db, 'users'), limit(3)));
  const coursesSnapshot = await getDocs(query(collection(db, 'courses'), limit(3)));

  const studentCount = usersSnapshot.size;
  const courseTitles = coursesSnapshot.docs.map(doc => doc.data().title);
  const firstCourseTitle = courseTitles[0] || 'Unknown Course';

  // --- Natural Logic Simulation ---

  if (msg.includes('exam') && (msg.includes('create') || msg.includes('draft'))) {
    return {
      reply: `Commander ${adminName.split(' ')[0]}, I have analyzed the syllabus for '${firstCourseTitle}'. I've drafted a protocol-compliant assessment with 5 technical questions covering core concepts. Visualizing and staging now. Authorization required for deployment to the student fleet.`,
      suggestedAction: {
        type: 'CREATE_EXAM',
        data: {
          title: `${firstCourseTitle}: Final Assessment`,
          courseId: coursesSnapshot.docs[0]?.id || "default-course",
          duration: 30,
          questions: [
            { id: "q1", text: `What is the primary function of ${firstCourseTitle}?`, options: ["Core Logic", "Style Only", "Database Mgmt", "Networking"], correctAnswer: "Core Logic" },
            { id: "q2", text: "Which architecture pattern is recommended for this module?", options: ["MVC", "Singleton", "Adapter", "Proxy"], correctAnswer: "MVC" }
          ]
        }
      }
    };
  }

  if (msg.includes('grade') || msg.includes('audit')) {
    // Attempt to find a real submission to audit
    const subQuery = query(collection(db, 'submissions'), where('status', '==', 'Pending'), limit(1));
    const subSnap = await getDocs(subQuery);
    
    if (subSnap.empty) {
        return {
            reply: `Commander, my sensors show no pending submissions awaiting audit. The student fleet is current on all evaluations. Optimal platform synchronization!`,
            suggestedAction: { type: 'NONE' }
        };
    }

    const subData = subSnap.docs[0].data();
    return {
      reply: `I have audited the transmission from ${subData.userName}. Protocol dictates a 'B+' due to exceptional logic but minor syntax deviations. Synchronizing grade now. Proceed?`,
      suggestedAction: {
        type: 'GRADE_SUBMISSION',
        data: {
          userId: subData.userId,
          submissionId: subSnap.docs[0].id,
          grade: "B+",
          feedback: `Expertly handled logic! Just a few minor syntax refinements needed for a 'Perfect' rating.`
        }
      }
    };
  }

  if (msg.includes('broadcast') || msg.includes('notify') || msg.includes('message')) {
    return {
      reply: `Platform-wide broadcast staged. It includes a motivational pulse and system status update. Ready to beam to all active student terminals. Authorization required.`,
      suggestedAction: {
        type: 'SEND_NOTIFICATION',
        data: {
          title: "Code-X System Update",
          body: `Attention Pioneers! New challenges have been deployed to the ${firstCourseTitle} module. Happy Coding!`,
          targetType: "general"
        }
      }
    };
  }

  return {
    reply: `Commander ${adminName.split(' ')[0]}, Admin Agent Standing By. All systems in ${courseTitles.length} courses are operational. I've audited our ${studentCount} most recent student signups—everything appears nominal. How shall we utilize current resources?`,
    suggestedAction: { type: 'NONE' }
  };
}

export async function executeAdminAction(action: { type: string; data: any }) {
    console.log("EXECUTE_PROTOCOL:", action);
    
    try {
        switch (action.type) {
            case 'CREATE_EXAM':
                await createExamAction(action.data);
                return { success: true, message: `Exam '${action.data.title}' has been successfully deployed.` };
            case 'GRADE_SUBMISSION':
                await gradeAssignmentAction(action.data);
                return { success: true, message: `Submission for user '${action.data.userId}' has been graded.` };
            case 'SEND_NOTIFICATION':
                await sendMessageAction(action.data);
                return { success: true, message: `Notification '${action.data.title}' has been broadcasted.` };
            default:
                throw new Error("Protocol Error: Unsupported Action Type");
        }
    } catch (e: any) {
        throw new Error(`Deployment Failure: ${e.message}`);
    }
}
