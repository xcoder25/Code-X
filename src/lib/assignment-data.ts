
export interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  description?: string;
  courseId: string;
}

export const assignments: Assignment[] = [];
