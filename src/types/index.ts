export interface ChatMessage {
  id: string;
  text: string;
  uid: string;
  photoURL: string | null;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}
