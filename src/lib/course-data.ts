
export const courses = [
  {
    id: 'web-dev-bootcamp',
    title: 'Web Development Bootcamp',
    description: 'A comprehensive bootcamp covering HTML, CSS, JavaScript, and everything you need to become a web developer.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Fullstack'],
    modules: [
      {
        title: 'Module 1: Introduction to Web Development',
        lessons: [
          { title: 'Welcome to the Bootcamp', type: 'video', completed: true },
          { title: 'How the Web Works', type: 'reading', completed: true },
          { title: 'Setting Up Your Development Environment', type: 'video', completed: false },
        ],
      },
      {
        title: 'Module 2: HTML Fundamentals',
        lessons: [
          { title: 'Introduction to HTML', type: 'video', completed: false },
          { title: 'HTML Document Structure', type: 'reading', completed: false },
          { title: 'Common HTML Tags', type: 'reading', completed: false },
          { title: 'Creating Forms', type: 'video', completed: false },
        ],
      },
      {
        title: 'Module 3: CSS Styling',
        lessons: [
          { title: 'Introduction to CSS', type: 'video', completed: false },
          { title: 'Selectors and Specificity', type: 'reading', completed: false },
          { title: 'The Box Model', type: 'video', completed: false },
          { title: 'Flexbox and Grid', type: 'live', meetingUrl: 'https://meet.google.com', completed: false },
          { title: 'CSS Selectors Challenge', type: 'challenge', id: 'css-selectors-challenge', completed: false },
        ],
      },
    ],
  },
];

export function getCourseById(id: string) {
  return courses.find((course) => course.id === id);
}
