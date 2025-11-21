'use server';

/**
 * Voice Assistant Context Provider
 * Fetches and provides complete website context to the AI assistant
 */

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  collectionGroup,
  where,
  doc,
  getDoc,
  limit,
} from 'firebase/firestore';

export interface WebsiteContext {
  courses: any[];
  users: any[];
  teachers: any[];
  enrollments: any[];
  assignments: any[];
  exams: any[];
  projects: any[];
  submissions: any[];
  liveClasses: any[];
  accessCodes: any[];
  notifications: any[];
  stats: {
    totalCourses: number;
    totalUsers: number;
    totalTeachers: number;
    totalEnrollments: number;
    activeSubscriptions: number;
  };
}

/**
 * Fetches complete website context for the AI assistant
 * This gives the assistant complete knowledge of everything in the system
 */
export async function getWebsiteContext(): Promise<WebsiteContext> {
  try {
    // Fetch all courses
    const coursesSnapshot = await getDocs(
      query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
    );
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all users
    const usersSnapshot = await getDocs(
      query(collection(db, 'users'), limit(100))
    );
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all teachers
    const teachersSnapshot = await getDocs(collection(db, 'teachers'));
    const teachers = teachersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all enrollments across users
    const enrollmentsSnapshot = await getDocs(
      collectionGroup(db, 'enrollments')
    );
    const enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all assignments
    const assignmentsSnapshot = await getDocs(
      query(collection(db, 'assignments'), orderBy('dueDate', 'desc'))
    );
    const assignments = assignmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all exams
    const examsSnapshot = await getDocs(
      query(collection(db, 'exams'), orderBy('createdAt', 'desc'))
    );
    const exams = examsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all projects
    const projectsSnapshot = await getDocs(
      query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    );
    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all submissions
    const submissionsSnapshot = await getDocs(
      collectionGroup(db, 'submissions')
    );
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch all live classes
    const liveClassesSnapshot = await getDocs(
      query(collection(db, 'liveClasses'), orderBy('scheduledAt', 'desc'))
    );
    const liveClasses = liveClassesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch access codes
    const accessCodesSnapshot = await getDocs(
      query(collection(db, 'accessCodes'), limit(50))
    );
    const accessCodes = accessCodesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch recent notifications
    const notificationsSnapshot = await getDocs(
      query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20))
    );
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate stats
    const activeSubscriptions = users.filter(
      u => u.subscription?.status === 'active'
    ).length;

    const context: WebsiteContext = {
      courses,
      users,
      teachers,
      enrollments,
      assignments,
      exams,
      projects,
      submissions,
      liveClasses,
      accessCodes,
      notifications,
      stats: {
        totalCourses: courses.length,
        totalUsers: users.length,
        totalTeachers: teachers.length,
        totalEnrollments: enrollments.length,
        activeSubscriptions,
      },
    };

    return context;
  } catch (error) {
    console.error('Error fetching website context:', error);
    // Return empty context on error
    return {
      courses: [],
      users: [],
      teachers: [],
      enrollments: [],
      assignments: [],
      exams: [],
      projects: [],
      submissions: [],
      liveClasses: [],
      accessCodes: [],
      notifications: [],
      stats: {
        totalCourses: 0,
        totalUsers: 0,
        totalTeachers: 0,
        totalEnrollments: 0,
        activeSubscriptions: 0,
      },
    };
  }
}

/**
 * Gets specific course details including enrollments and teacher info
 */
export async function getCourseDetails(courseId: string) {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (!courseDoc.exists()) {
      return null;
    }

    const courseData = { id: courseDoc.id, ...courseDoc.data() };

    // Get teacher info if available
    if (courseData.teacherId) {
      const teacherDoc = await getDoc(doc(db, 'teachers', courseData.teacherId));
      if (teacherDoc.exists()) {
        courseData.teacher = teacherDoc.data();
      }
    }

    // Get enrollments for this course
    const enrollmentsSnapshot = await getDocs(
      query(collectionGroup(db, 'enrollments'), where('courseId', '==', courseId))
    );
    courseData.enrollmentDetails = enrollmentsSnapshot.docs.map(doc => doc.data());

    return courseData;
  } catch (error) {
    console.error('Error fetching course details:', error);
    return null;
  }
}

/**
 * Gets user details including enrollments, submissions, and progress
 */
export async function getUserDetails(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }

    const userData = { id: userDoc.id, ...userDoc.data() };

    // Get user's enrollments
    const enrollmentsSnapshot = await getDocs(
      collection(db, 'users', userId, 'enrollments')
    );
    userData.enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get user's submissions
    const submissionsSnapshot = await getDocs(
      collection(db, 'users', userId, 'submissions')
    );
    userData.submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return userData;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

/**
 * Searches for content across the platform
 */
export async function searchContent(searchTerm: string) {
  try {
    const lowerSearch = searchTerm.toLowerCase();
    const results = {
      courses: [] as any[],
      users: [] as any[],
      assignments: [] as any[],
    };

    // Search courses
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    results.courses = coursesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(
        course =>
          course.title?.toLowerCase().includes(lowerSearch) ||
          course.description?.toLowerCase().includes(lowerSearch) ||
          course.tags?.some((tag: string) => tag.toLowerCase().includes(lowerSearch))
      );

    // Search users
    const usersSnapshot = await getDocs(query(collection(db, 'users'), limit(50)));
    results.users = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(
        user =>
          user.displayName?.toLowerCase().includes(lowerSearch) ||
          user.email?.toLowerCase().includes(lowerSearch)
      );

    // Search assignments
    const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
    results.assignments = assignmentsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(
        assignment =>
          assignment.title?.toLowerCase().includes(lowerSearch) ||
          assignment.description?.toLowerCase().includes(lowerSearch)
      );

    return results;
  } catch (error) {
    console.error('Error searching content:', error);
    return { courses: [], users: [], assignments: [] };
  }
}

/**
 * Gets analytics and insights about the platform
 */
export async function getAnalytics() {
  try {
    const context = await getWebsiteContext();

    const analytics = {
      overview: {
        totalCourses: context.stats.totalCourses,
        totalUsers: context.stats.totalUsers,
        totalTeachers: context.stats.totalTeachers,
        totalEnrollments: context.stats.totalEnrollments,
        activeSubscriptions: context.stats.activeSubscriptions,
      },
      courses: {
        published: context.courses.filter(c => c.status === 'Published').length,
        draft: context.courses.filter(c => c.status === 'Draft').length,
        premium: context.courses.filter(c => c.premium).length,
        free: context.courses.filter(c => !c.premium).length,
      },
      engagement: {
        totalSubmissions: context.submissions.length,
        totalAssignments: context.assignments.length,
        totalProjects: context.projects.length,
        totalExams: context.exams.length,
      },
      popular: {
        topCourses: context.courses
          .sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0))
          .slice(0, 5)
          .map(c => ({ id: c.id, title: c.title, enrollments: c.enrollments || 0 })),
      },
    };

    return analytics;
  } catch (error) {
    console.error('Error getting analytics:', error);
    return null;
  }
}

