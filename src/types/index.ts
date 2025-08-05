import type { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  text: string;
  uid: string;
  photoURL: string | null;
  createdAt: Timestamp;
  displayName?: string | null;
}
