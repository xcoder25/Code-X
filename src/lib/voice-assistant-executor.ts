'use server';

/**
 * Voice Assistant Action Executor
 * Enables Elara to actually perform actions on the website
 */

import { 
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  createAssignmentAction,
  updateAssignmentAction,
  deleteAssignmentAction,
  createExamAction,
  updateExamAction,
  deleteExamAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  createLiveClassAction,
  generateAccessCodesAction,
  sendMessageAction,
  gradeAssignmentAction,
  gradeProjectAction,
  seedInitialCoursesAction,
} from '@/app/actions';

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
  getDoc,
} from 'firebase/firestore';

import type { ExecutionResult, CourseInfo } from './voice-assistant-types';

/**
 * Fetch all course IDs and basic info
 */
export async function fetchCourseIds(): Promise<CourseInfo[]> {
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const courses: CourseInfo[] = coursesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Untitled',
        description: data.description,
        status: data.status,
        teacherId: data.teacherId,
        enrollments: data.enrollments || 0,
        tags: data.tags || [],
      };
    });
    return courses;
  } catch (error) {
    console.error('Error fetching course IDs:', error);
    return [];
  }
}

/**
 * Find course ID by name or partial match
 */
export async function findCourseByName(courseName: string): Promise<CourseInfo | null> {
  try {
    const courses = await fetchCourseIds();
    const lowerSearch = courseName.toLowerCase();
    
    // Try exact match first
    let found = courses.find(c => c.title.toLowerCase() === lowerSearch);
    
    // Try partial match
    if (!found) {
      found = courses.find(c => c.title.toLowerCase().includes(lowerSearch));
    }
    
    return found || null;
  } catch (error) {
    console.error('Error finding course by name:', error);
    return null;
  }
}

/**
 * Execute course creation
 */
export async function executeCourseCreation(params: {
  title: string;
  description: string;
  tags?: string[];
  difficulty?: string;
  modules?: any[];
  price?: number;
}): Promise<ExecutionResult> {
  try {
    const { title, description, tags = [], modules = [], price = 0 } = params;

    // Create basic modules if not provided
    const courseModules = modules.length > 0 ? modules : [
      {
        id: 'module-1',
        title: 'Getting Started',
        lessons: [
          {
            id: 'lesson-1',
            title: 'Introduction',
            content: `Welcome to ${title}! In this course, you'll learn: ${description}`,
          }
        ],
      }
    ];

    const result = await createCourseAction({
      title,
      description,
      tags: tags.join(', '),
      modules: courseModules,
      price,
    });

    return {
      success: true,
      message: `Successfully created course "${title}" with ID ${result.id}`,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute course update
 */
export async function executeCourseUpdate(params: {
  courseId: string;
  updates: any;
}): Promise<ExecutionResult> {
  try {
    const { courseId, updates } = params;

    // Get current course data
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    
    if (!courseDoc.exists()) {
      return {
        success: false,
        message: `Course with ID ${courseId} not found`,
      };
    }

    const currentData = courseDoc.data();

    await updateCourseAction({
      courseId,
      title: updates.title || currentData.title,
      description: updates.description || currentData.description,
      tags: updates.tags || currentData.tags?.join(', ') || '',
      modules: updates.modules || currentData.modules || [],
      resources: updates.resources || currentData.resources || [],
      teacherId: updates.teacherId || currentData.teacherId,
      price: updates.price !== undefined ? updates.price : currentData.price,
    });

    return {
      success: true,
      message: `Successfully updated course "${currentData.title}"`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute teacher assignment
 */
export async function executeTeacherAssignment(params: {
  courseId: string;
  teacherId: string;
  teacherName?: string;
}): Promise<ExecutionResult> {
  try {
    const { courseId, teacherId } = params;

    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      teacherId,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Successfully assigned teacher to course`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to assign teacher: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute course publication
 */
export async function executePublishCourse(courseId: string): Promise<ExecutionResult> {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      status: 'Published',
      publishedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Successfully published course`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to publish course: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute course deletion
 */
export async function executeDeleteCourse(courseId: string): Promise<ExecutionResult> {
  try {
    await deleteCourseAction(courseId);

    return {
      success: true,
      message: `Successfully deleted course`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete course: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute assignment creation
 */
export async function executeCreateAssignment(params: {
  title: string;
  courseId: string;
  dueDate: Date;
  description?: string;
}): Promise<ExecutionResult> {
  try {
    await createAssignmentAction(params);

    return {
      success: true,
      message: `Successfully created assignment "${params.title}"`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create assignment: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute student enrollment
 */
export async function executeEnrollStudent(params: {
  userId: string;
  courseId: string;
}): Promise<ExecutionResult> {
  try {
    const { userId, courseId } = params;

    const enrollmentRef = doc(db, 'users', userId, 'enrollments', courseId);
    await setDoc(enrollmentRef, {
      courseId,
      enrolledAt: serverTimestamp(),
      progress: 0,
    });

    // Increment course enrollment count
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    if (courseDoc.exists()) {
      await updateDoc(courseRef, {
        enrollments: (courseDoc.data().enrollments || 0) + 1,
      });
    }

    return {
      success: true,
      message: `Successfully enrolled student in course`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to enroll student: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute notification/message sending
 */
export async function executeSendNotification(params: {
  title: string;
  body: string;
  targetType: 'direct' | 'general';
  userId?: string;
}): Promise<ExecutionResult> {
  try {
    await sendMessageAction(params);

    return {
      success: true,
      message: `Successfully sent notification`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute grading
 */
export async function executeGradeSubmission(params: {
  userId: string;
  submissionId: string;
  grade: string;
  type?: 'assignment' | 'project';
}): Promise<ExecutionResult> {
  try {
    const { type = 'assignment' } = params;

    if (type === 'project') {
      await gradeProjectAction({
        userId: params.userId,
        submissionId: params.submissionId,
        grade: parseFloat(params.grade),
      });
    } else {
      await gradeAssignmentAction(params);
    }

    return {
      success: true,
      message: `Successfully graded ${type}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to grade: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute bulk operations
 */
export async function executeBulkPublish(courseIds: string[]): Promise<ExecutionResult> {
  try {
    const batch = writeBatch(db);

    for (const courseId of courseIds) {
      const courseRef = doc(db, 'courses', courseId);
      batch.update(courseRef, {
        status: 'Published',
        publishedAt: serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      success: true,
      message: `Successfully published ${courseIds.length} courses`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to publish courses: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute access code generation
 */
export async function executeGenerateAccessCodes(params: {
  courseId: string;
  quantity: number;
  prefix?: string;
  maxRedemptions?: number;
}): Promise<ExecutionResult> {
  try {
    await generateAccessCodesAction({
      courseId: params.courseId,
      quantity: params.quantity,
      prefix: params.prefix,
      maxRedemptions: params.maxRedemptions || 1,
    });

    return {
      success: true,
      message: `Successfully generated ${params.quantity} access codes`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to generate access codes: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Execute user role update
 */
export async function executeUpdateUserRole(params: {
  userId: string;
  role: string;
}): Promise<ExecutionResult> {
  try {
    const userRef = doc(db, 'users', params.userId);
    await updateDoc(userRef, {
      role: params.role,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Successfully updated user role to ${params.role}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Master action executor - routes to appropriate function
 */
export async function executeAction(
  actionType: string,
  params: any
): Promise<ExecutionResult> {
  try {
    switch (actionType.toLowerCase()) {
      case 'create_course':
        return await executeCourseCreation(params);
      
      case 'update_course':
        return await executeCourseUpdate(params);
      
      case 'delete_course':
        return await executeDeleteCourse(params.courseId);
      
      case 'assign_teacher':
        return await executeTeacherAssignment(params);
      
      case 'publish_course':
        return await executePublishCourse(params.courseId);
      
      case 'enroll_student':
        return await executeEnrollStudent(params);
      
      case 'create_assignment':
        return await executeCreateAssignment(params);
      
      case 'send_notification':
        return await executeSendNotification(params);
      
      case 'grade_submission':
        return await executeGradeSubmission(params);
      
      case 'generate_access_codes':
        return await executeGenerateAccessCodes(params);
      
      case 'update_user_role':
        return await executeUpdateUserRole(params);
      
      case 'bulk_publish':
        return await executeBulkPublish(params.courseIds);
      
      default:
        return {
          success: false,
          message: `Unknown action type: ${actionType}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `Action execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

