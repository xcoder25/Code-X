
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, BookOpenCheck, Lock } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';


const featuredCourses = [
    {
        id: 'web-dev-bootcamp',
        title: 'Web Development Bootcamp',
        description: 'A comprehensive bootcamp covering HTML, CSS, JavaScript, and everything you need to become a web developer.',
        premium: false,
    },
    {
        id: 'intro-to-python',
        title: 'Introduction to Python',
        description: 'Learn the fundamentals of Python, one of the most popular programming languages in the world.',
        premium: false,
    },
    {
        id: 'advanced-react',
        title: 'Advanced React & State Management',
        description: 'Take your React skills to the next level by mastering advanced concepts and state management.',
        premium: true,
    }
];


export default async function SkillsSection() {

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3">
             <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Featured Courses</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Start Your Learning Journey
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our curriculum is designed to equip you with the most sought-after skills in the tech industry. Explore some of our popular courses.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl py-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                    <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                        {course.premium ? <Lock className="h-8 w-8 text-primary" /> : <BookOpenCheck className="h-8 w-8 text-primary" />}
                        {course.premium && <Badge variant="premium">Premium</Badge>}
                    </div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-grow flex items-end">
                    <Button asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>
                            Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
         <div className="text-center">
            <Link href="/courses" className="inline-flex items-center text-primary hover:underline">
                Explore all courses <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            </div>
      </div>
    </section>
  );
}
