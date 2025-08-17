
export interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
}

export const assignments: Assignment[] = [
  {
    id: 'html-basics',
    title: 'HTML Basics Challenge',
    course: 'Web Development Bootcamp',
    dueDate: '2024-08-15',
  },
  {
    id: 'css-flexbox',
    title: 'CSS Flexbox Layout',
    course: 'Web Development Bootcamp',
    dueDate: '2024-08-22',
  },
  {
    id: 'js-dom-manipulation',
    title: 'JavaScript DOM Manipulation',
    course: 'Web Development Bootcamp',
    dueDate: '2024-08-30',
  },
  {
    id: 'python-setup',
    title: 'Setting Up Your Python Environment',
    course: 'Introduction to Python',
    dueDate: '2024-09-05',
  },
  {
    id: 'python-variables-types',
    title: 'Python Variables and Data Types',
    course: 'Introduction to Python',
    dueDate: '2024-09-12',
  },
  {
    id: 'python-control-flow',
    title: 'Understanding Control Flow in Python',
    course: 'Introduction to Python',
    dueDate: '2024-09-19',
  },
];
