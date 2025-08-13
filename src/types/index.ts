
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
