import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpenCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const courses = [
  {
    id: 'web-development',
    title: 'Web Development Bootcamp',
    description:
      'Master HTML, CSS, JavaScript, React, and Node.js to build full-stack web applications from scratch.',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    status: 'in-progress',
    progress: 75,
  },
  {
    id: 'advanced-nextjs',
    title: 'Advanced Next.js',
    description:
      'Dive deep into server components, advanced data fetching patterns, and scalable architecture in Next.js.',
    tags: ['Next.js', 'Server Components', 'Vercel'],
    status: 'in-progress',
    progress: 20,
  },
  {
    id: 'data-structures',
    title: 'Data Structures & Algorithms',
    description:
      'Strengthen your problem-solving skills with a deep dive into essential data structures and algorithms.',
    tags: ['Algorithms', 'Data Structures', 'Problem Solving'],
    status: 'not-started',
    progress: 0,
  },
   {
    id: 'ui-ux-design',
    title: 'UI/UX Design Fundamentals',
    description:
      'Learn the principles of user-centered design, wireframing, and prototyping to create beautiful interfaces.',
    tags: ['UI', 'UX', 'Figma', 'Design Thinking'],
    status: 'not-started',
    progress: 0,
  },
];

export default function CoursesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Courses</h1>
      </div>
      <p className="text-muted-foreground">
        Browse available courses and continue your learning journey.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                 <BookOpenCheck className="h-8 w-8 text-primary" />
                 {course.status === 'in-progress' && <Badge variant="default">In Progress</Badge>}
                 {course.status === 'not-started' && <Badge variant="secondary">Not Started</Badge>}
              </div>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-x-2">
              {course.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
               <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                  <div className="bg-primary h-2.5 rounded-full" style={{width: `${course.progress}%`}}></div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/dashboard`}>
                   {course.status === 'not-started' ? 'Start Course' : 'Continue Course'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
