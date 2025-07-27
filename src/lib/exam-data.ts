const exams: { [key: string]: any } = {
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
};

// This ensures the `exams` object with correct answers is not exported to the client.
export { exams };


// Function to get exam questions without the answers
export function getExamQuestions(examId: string) {
  const exam = exams[examId as keyof typeof exams];
  if (!exam) return [];
  return exam.questions.map(({ correctAnswer, ...rest }: { correctAnswer: string }) => rest);
}

// Function to get exam details like title, duration, etc.
export function getExamDetails(examId: string) {
    const exam = exams[examId as keyof typeof exams];
    if (!exam) return null;
    const { questions, ...details } = exam;
    return details;
}
