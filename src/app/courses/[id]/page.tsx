import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, FileText, CheckSquare, Bot } from 'lucide-react';
import Link from 'next/link';
import ChallengeInterface from '@/components/challenge-interface';
import LearningPathGenerator from '@/components/learning-path-generator';

const courses: { [key: string]: any } = {
  'web-development': {
    id: 'web-development',
    title: 'Web Development Bootcamp',
    description: 'Master HTML, CSS, JavaScript, React, and Node.js to build full-stack web applications from scratch.',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    modules: [
      {
        title: 'Module 1: HTML & CSS Fundamentals',
        lessons: [
          { title: 'Introduction to HTML', type: 'video', completed: true },
          { title: 'Styling with CSS', type: 'video', completed: true },
          { title: 'Building a Simple Layout', type: 'challenge', completed: false },
        ]
      },
      {
        title: 'Module 2: JavaScript Basics',
        lessons: [
          { title: 'Variables and Data Types', type: 'video', completed: true },
          { title: 'DOM Manipulation', type: 'reading', completed: false },
           { title: 'Interactive Button Challenge', type: 'challenge', completed: false },
        ]
      },
       {
        title: 'Module 3: React & State Management',
        lessons: [
          { title: 'Introduction to React', type: 'video', completed: false },
          { title: 'State and Props', type: 'video', completed: false },
           { title: 'Building a Counter App', type: 'challenge', completed: false },
        ]
      }
    ],
  },
  'advanced-nextjs': {
    id: 'advanced-nextjs',
    title: 'Advanced Next.js',
    description: 'Dive deep into server components, advanced data fetching patterns, and scalable architecture in Next.js.',
    tags: ['Next.js', 'Server Components', 'Vercel'],
    modules: [
        {
        title: 'Module 1: Server Components',
        lessons: [
          { title: 'Understanding Server vs Client', type: 'video', completed: true },
          { title: 'Data Fetching Strategies', type: 'reading', completed: false },
        ]
      },
        {
        title: 'Module 2: Advanced Routing',
        lessons: [
          { title: 'Dynamic Routes', type: 'video', completed: false },
          { title: 'Route Groups and Layouts', type: 'challenge', completed: false },
        ]
      }
    ]
  },
};

const challenges = {
    'building-a-simple-layout': {
        id: 'building-a-simple-layout',
        title: 'Challenge: Building a Simple Layout',
        description: 'Create a simple two-column layout using HTML and CSS Flexbox. The left column should contain a title and the right should have a paragraph of text.',
        difficulty: 'Easy',
        defaultCode: `<html>
  <head>
    <style>
      .container {
        /* Your CSS here */
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Your HTML here -->
    </div>
  </body>
</html>`
    },
    'interactive-button-challenge': {
        id: 'interactive-button-challenge',
        title: 'Challenge: Interactive Button',
        description: 'Using JavaScript, make the button below change its text to "Clicked!" when the user clicks on it.',
        difficulty: 'Easy',
        defaultCode: `<button id="myButton">Click Me</button>

<script>
  // Your JavaScript here
</script>`
    }
}

function getLessonIcon(type: string) {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-5 w-5" />;
    case 'reading':
      return <FileText className="h-5 w-5" />;
    case 'challenge':
      return <CheckSquare className="h-5 w-5" />;
    default:
      return null;
  }
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = courses[params.id];
  const challengeId = 'building-a-simple-layout';
  const challenge = challenges[challengeId as keyof typeof challenges];

  if (!course) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="font-semibold text-3xl">Course Not Found</h1>
        </div>
        <p>
          The course you are looking for does not exist.
        </p>
         <Button asChild>
            <Link href="/courses">Back to Courses</Link>
         </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
           <h1 className="font-semibold text-3xl">{course.title}</h1>
           <p className="text-muted-foreground mt-2">{course.description}</p>
            <div className="flex items-center gap-2 mt-4">
            {course.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                {tag}
                </Badge>
            ))}
            </div>
        </div>
        <Button asChild size="lg">
            <Link href="/dashboard">
                Return to Dashboard
            </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Course Modules</CardTitle>
                    <CardDescription>Follow the curriculum to complete the course.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible defaultValue="item-0">
                        {course.modules.map((module: any, index: number) => (
                        <AccordionItem value={`item-${index}`} key={module.title}>
                            <AccordionTrigger className="text-lg font-semibold">{module.title}</AccordionTrigger>
                            <AccordionContent>
                            <ul className="space-y-3">
                                {module.lessons.map((lesson: any) => (
                                <li key={lesson.title} className={`flex items-center justify-between p-3 rounded-md transition-colors ${lesson.completed ? 'bg-accent/50 text-muted-foreground' : 'bg-muted/50'}`}>
                                    <div className="flex items-center gap-3">
                                        {getLessonIcon(lesson.type)}
                                        <span className={`${lesson.completed ? 'line-through' : ''}`}>{lesson.title}</span>
                                    </div>
                                    <Badge variant={lesson.completed ? "secondary" : "default"}>{lesson.completed ? "Completed" : "Pending"}</Badge>
                                </li>
                                ))}
                            </ul>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                 <CardHeader>
                    <CardTitle>Coding Challenge</CardTitle>
                    <CardDescription>Test your skills with a hands-on exercise.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm mb-4">
                        Complete the challenge below to practice the concepts you've learned.
                    </p>
                    <Button className="w-full" variant="outline" disabled>
                        Start Challenge
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>

       <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Personalized Learning Path</CardTitle>
                    <CardDescription>
                       Use our AI assistant to generate a custom learning path tailored to your goals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LearningPathGenerator />
                </CardContent>
            </Card>
        </div>

      <div className="mt-8">
         {challenge && <ChallengeInterface challenge={challenge} />}
      </div>
    </main>
  );
}
