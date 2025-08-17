
export const pythonCourse = {
  id: 'intro-to-python',
  title: 'Introduction to Python',
  description: 'Learn the fundamentals of Python, one of the most popular programming languages in the world.',
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
                { id: 'py-l-1-1', name: 'What is Python? (Video)', type: 'video/mp4', url: '#', content: 'An overview of Python, its history, and why it\'s a great language for beginners. Covers real-world applications of Python.' },
                { id: 'py-l-1-2', name: 'Installing Python & VS Code (PDF Guide)', type: 'application/pdf', url: '#', content: 'A step-by-step guide to installing Python and setting up Visual Studio Code as your editor on Windows, macOS, and Linux.' },
                { id: 'py-l-1-3', name: 'Running Your First Script (Video)', type: 'video/mp4', url: '#', content: 'A hands-on tutorial where you write and run your first "Hello, World!" program in Python.' },
            ],
        },
        {
            id: 'py-mod-2',
            title: 'Module 2: Variables and Basic Data Types',
            lessons: [
                { id: 'py-l-2-1', name: 'Understanding Variables (Video)', type: 'video/mp4', url: '#', content: 'Learn how to store data in variables. Covers naming conventions and assigning values.' },
                { id: 'py-l-2-2', name: 'Working with Numbers (PDF Guide)', type: 'application/pdf', url: '#', content: 'Explore integers and floating-point numbers. Covers basic arithmetic operations like addition, subtraction, multiplication, and division.' },
                { id: 'py-l-2-3', name: 'Manipulating Strings (Video)', type: 'video/mp4', url: '#', content: 'An introduction to text data. Covers string concatenation, slicing, and common string methods.' },
                { id: 'py-l-2-4', name: 'Introduction to Booleans (PDF Guide)', type: 'application/pdf', url: '#', content: 'Understand the concept of True and False values, which are fundamental for control flow.' },
            ],
        },
        {
            id: 'py-mod-3',
            title: 'Module 3: Core Data Structures',
            lessons: [
                { id: 'py-l-3-1', name: 'Working with Lists (Video)', type: 'video/mp4', url: '#', content: 'Deep dive into lists, Python\'s most versatile data structure. Covers indexing, slicing, adding, and removing items.' },
                { id: 'py-l-3-2', name: 'Understanding Tuples (Video)', type: 'video/mp4', url: '#', content: 'Learn about immutable sequences and when to use tuples instead of lists.' },
                { id: 'py-l-3-3', name: 'Introduction to Dictionaries (Video)', type: 'video/mp4', url: '#', content: 'Explore key-value pairs with dictionaries. Covers accessing data, adding new entries, and looping through dictionaries.' },
            ],
        },
        {
            id: 'py-mod-4',
            title: 'Module 4: Control Flow',
            lessons: [
                { id: 'py-l-4-1', name: 'Conditional Statements (Video)', type: 'video/mp4', url: '#', content: 'Make decisions in your code using if, elif, and else statements.' },
                { id: 'py-l-4-2', name: 'For Loops (PDF Guide)', type: 'application/pdf', url: '#', content: 'Learn how to iterate over sequences like lists, strings, and ranges to perform repetitive tasks.' },
                { id: 'py-l-4-3', name: 'While Loops (Video)', type: 'video/mp4', url: '#', content: 'Create loops that continue to run as long as a certain condition is true. Covers break and continue statements.' },
            ],
        },
         {
            id: 'py-mod-5',
            title: 'Module 5: Next Steps',
            lessons: [
               { id: 'py-l-5-1', name: 'Final Project Brief (PDF Guide)', type: 'application/pdf', url: '#', content: 'Instructions for the final project, which combines all the concepts learned in the course to build a simple application.' },
               { id: 'py-l-5-2', name: 'What to learn next? (Video)', type: 'video/mp4', url: '#', content: 'A guide to further learning, including topics like functions, object-oriented programming, and popular Python libraries.' },
            ],
        }
    ],
    resources: [
        { id: 'py-res-1', name: 'Python 3 Cheat Sheet', url: '#' },
        { id: 'py-res-2', name: 'Official Python Documentation', url: '#' },
        { id: 'py-res-3', name: 'Awesome Python - A curated list of resources', url: '#' },
    ],
};
