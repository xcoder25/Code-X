
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
    id: string;
    assignmentId: string;
    userId: string;
    colabLink: string;
    status: 'Pending' | 'Graded';
    grade: string | null;
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
}

export interface Friend {
    id: string;
    displayName: string;
    photoURL: string | null;
    status: 'sent' | 'received' | 'accepted';
    since: Timestamp;
}
