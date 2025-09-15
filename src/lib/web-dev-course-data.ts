
export const webDevCourse = {
  id: 'web-dev-bootcamp',
  title: 'Web Development Bootcamp',
  description: 'A comprehensive bootcamp covering HTML, CSS, JavaScript, and everything you need to become a web developer.',
  tags: ['HTML', 'CSS', 'JavaScript', 'Fullstack'],
  progress: 0,
  status: 'not-started' as 'not-started',
};


export const webDevCourseData = {
    id: 'web-dev-bootcamp',
    title: 'Web Development Bootcamp',
    description: 'A comprehensive bootcamp covering HTML, CSS, JavaScript, and everything you need to become a web developer.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Fullstack'],
    modules: [
        {
            id: 'wd-mod-1',
            title: 'Module 1: HTML Fundamentals',
            lessons: [
                { id: 'wd-l-1-1', title: 'Introduction to HTML', content: 'Learn the basic structure of a web page and the most common HTML tags.' },
                { id: 'wd-l-1-2', title: 'Creating Forms', content: 'Understand how to collect user input with HTML forms, including various input types.' },
                { id: 'wd-l-1-3', title: 'Semantic HTML', content: 'Discover the importance of using semantic tags for better accessibility and SEO.' },
            ],
        },
        {
            id: 'wd-mod-2',
            title: 'Module 2: CSS Styling',
            lessons: [
                { id: 'wd-l-2-1', title: 'Introduction to CSS', content: 'Learn how to apply styles to your HTML documents to make them visually appealing.' },
                { id: 'wd-l-2-2', title: 'The Box Model', content: 'A deep dive into the CSS box model, including margins, padding, borders, and content.' },
                { id: 'wd-l-2-3', title: 'Flexbox and Grid', content: 'Master modern CSS layout techniques with Flexbox and CSS Grid for creating responsive designs.' },
            ],
        },
        {
            id: 'wd-mod-3',
            title: 'Module 3: JavaScript for Interactivity',
            lessons: [
                { id: 'wd-l-3-1', title: 'JavaScript Basics', content: 'Get started with JavaScript syntax, variables, data types, and operators.' },
                { id: 'wd-l-3-2', title: 'DOM Manipulation', content: 'Learn how to interact with and dynamically change the content and structure of a web page using the Document Object Model (DOM).' },
                { id: 'wd-l-3-3', title: 'Handling Events', content: 'Make your pages interactive by responding to user actions like clicks, mouse movements, and keyboard input.' },
            ],
        }
    ],
    resources: [
        { id: 'wd-res-1', name: 'HTML5 Tag Reference', url: '#' },
        { id: 'wd-res-2', name: 'CSS Tricks - A Guide to Flexbox', url: '#' },
    ],
};
