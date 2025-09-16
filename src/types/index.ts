

import type { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  text: string;
  uid: string;
  photoURL: string | null;
  createdAt: Timestamp;
  displayName?: string | null;
}

export interface Submission {
    id: string; // assignment ID
    assignmentId: string;
    assignmentTitle: string;
    courseId: string;
    courseTitle: string;
    userId: string;
    userName: string;
    colabLink: string;
    status: 'Pending' | 'Graded';
    grade: string | null;
    submittedAt: Timestamp;
}

export interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: Timestamp;
  description?: string;
  courseId: string;
}

export interface Project {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: Timestamp;
  description?: string;
  courseId: string;
}

export interface ProjectSubmission {
    id: string; // project ID
    projectId: string;
    projectTitle: string;
    courseId: string;
    courseTitle: string;
    userId: string;
    userName: string;
    colabLink: string;
    status: 'Pending' | 'Graded';
    grade: number | null;
    submittedAt: Timestamp;
}

export interface User {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
    status?: 'sent' | 'received' | 'accepted' | null; // For friend status
    course?: string; // For discovery context
    plan?: string;
    paystackCustomerCode?: string;
}

export interface Friend {
    id: string;
    displayName: string;
    photoURL: string | null;
    status: 'sent' | 'received' | 'accepted';
    since: Timestamp;
}


export interface Teacher {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
}
