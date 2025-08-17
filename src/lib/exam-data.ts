const exams: { [key: string]: any } = {
  'html-fundamentals': {
    id: 'html-fundamentals',
    title: 'HTML Fundamentals Quiz',
    course: 'Web Development Bootcamp',
    duration: 600, // 10 minutes
    questions: [
      {
        id: 'q1',
        text: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'Hyperlinks and Text Markup Language', 'Home Tool Markup Language'],
        correctAnswer: 'Hyper Text Markup Language',
      },
      {
        id: 'q2',
        text: 'Who is making the Web standards?',
        options: ['Google', 'Microsoft', 'The World Wide Web Consortium'],
        correctAnswer: 'The World Wide Web Consortium',
      },
      {
        id: 'q3',
        text: 'Choose the correct HTML element for the largest heading:',
        options: ['<heading>', '<h6>', '<h1>'],
        correctAnswer: '<h1>',
      },
    ],
  },
  'mid-term-exam': {
    id: 'mid-term-exam',
    title: 'Mid-term Exam',
    course: 'Web Development Bootcamp',
    duration: 3600, // 60 minutes in seconds
    questions: [
      {
        id: 'q1',
        text: 'What is the correct HTML for referring to an external style sheet?',
        options: [
          '<style src="mystyle.css">',
          '<stylesheet>mystyle.css</stylesheet>',
          '<link rel="stylesheet" type="text/css" href="mystyle.css">',
        ],
        correctAnswer: '<link rel="stylesheet" type="text/css" href="mystyle.css">',
      },
      {
        id: 'q2',
        text: 'Which property is used to change the background color?',
        options: ['color', 'bgcolor', 'background-color'],
        correctAnswer: 'background-color',
      },
       {
        id: 'q3',
        text: 'How do you write "Hello World" in an alert box?',
        options: ['msg("Hello World");', 'alert("Hello World");', 'alertBox("Hello World");'],
        correctAnswer: 'alert("Hello World");',
      },
    ],
  },
  'python-basics': {
    id: 'python-basics',
    title: 'Python Basics Quiz',
    course: 'Introduction to Python',
    duration: 900, // 15 minutes
    questions: [
      {
        id: 'p_q1',
        text: "What is the correct way to declare a variable named 'age' with a value of 25 in Python?",
        options: ['var age = 25;', 'let age = 25;', 'age = 25'],
        correctAnswer: 'age = 25',
      },
      {
        id: 'p_q2',
        text: "Which of the following is NOT a built-in data type in Python?",
        options: ['list', 'tuple', 'array', 'dict'],
        correctAnswer: 'array',
      },
      {
        id: 'p_q3',
        text: 'What does the `print()` function do in Python?',
        options: ['It sends data to the printer.', 'It displays output to the console.', 'It saves data to a file.'],
        correctAnswer: 'It displays output to the console.',
      },
    ],
  },
};

// This ensures the `exams` object with correct answers is not exported to the client.
export { exams };


// Function to get exam questions without the answers
export function getExamQuestions(examId: string) {
  const exam = exams[examId as keyof typeof exams];
  if (!exam) return [];
  return exam.questions.map(({ correctAnswer, ...rest }: { correctAnswer: string }) => rest);
}

// Function to get exam details like title, duration, etc. for a single exam
export function getExamDetails(examId: string) {
    const exam = exams[examId as keyof typeof exams];
    if (!exam) return null;
    const { questions, ...details } = exam;
    return details;
}

// Function to get details for ALL exams
export function getAllExamDetails() {
    return Object.keys(exams).map(examId => {
        const { questions, ...details } = exams[examId];
        return details;
    });
}
