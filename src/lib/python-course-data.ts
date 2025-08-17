
export const pythonCourse = {
  id: 'intro-to-python',
  title: 'Introduction to Python',
  description: 'Learn the fundamentals of Python, one of the most popular programming languages in the world.',
  tags: ['Python', 'Beginner', 'Programming'],
  progress: 0, 
  status: 'not-started' as 'not-started',
};


export const pythonCourseData = {
    id: 'intro-to-python',
    title: 'Introduction to Python',
    description: 'Learn the fundamentals of Python, one of the most popular programming languages in the world.',
    tags: ['Python', 'Beginner', 'Programming'],
    modules: [
        {
            id: 'py-mod-1',
            title: 'Module 1: Getting Started',
            lessons: [
                { id: 'py-l-1-1', name: 'What is Python?', type: 'video/mp4', url: '#' },
                { id: 'py-l-1-2', name: 'Installing Python on Your Computer', type: 'application/pdf', url: '#' },
                { id: 'py-l-1-3', name: 'Running Your First Python Script', type: 'video/mp4', url: '#' },
            ],
        },
        {
            id: 'py-mod-2',
            title: 'Module 2: Variables and Data Types',
            lessons: [
                { id: 'py-l-2-1', name: 'Understanding Variables', type: 'video/mp4', url: '#' },
                { id: 'py-l-2-2', name: 'Working with Numbers (Integers and Floats)', type: 'application/pdf', url: '#' },
                { id: 'py-l-2-3', name: 'Manipulating Strings', type: 'video/mp4', url: '#' },
                { id: 'py-l-2-4', name: 'Introduction to Booleans', type: 'application/pdf', url: '#' },
            ],
        },
        {
            id: 'py-mod-3',
            title: 'Module 3: Core Data Structures',
            lessons: [
                { id: 'py-l-3-1', name: 'Working with Lists', type: 'video/mp4', url: '#' },
                { id: 'py-l-3-2', name: 'Understanding Tuples', type: 'video/mp4', url: '#' },
                { id: 'py-l-3-3', name: 'Introduction to Dictionaries', type: 'video/mp4', url: '#' },
            ],
        },
        {
            id: 'py-mod-4',
            title: 'Module 4: Control Flow',
            lessons: [
                { id: 'py-l-4-1', name: 'Conditional Statements (if, elif, else)', type: 'video/mp4', url: '#' },
                { id: 'py-l-4-2', name: 'For Loops', type: 'application/pdf', url: '#' },
                { id: 'py-l-4-3', name: 'While Loops', type: 'video/mp4', url: '#' },
            ],
        },
         {
            id: 'py-mod-5',
            title: 'Module 5: Next Steps',
            lessons: [
               { id: 'py-l-5-1', name: 'Final Project Brief', type: 'application/pdf', url: '#' },
               { id: 'py-l-5-2', name: 'What to learn next?', type: 'video/mp4', url: '#' },
            ],
        }
    ],
    resources: [
        { id: 'py-res-1', name: 'Python 3 Cheat Sheet', url: '#' },
        { id: 'py-res-2', name: 'Official Python Documentation', url: '#' },
    ],
};
