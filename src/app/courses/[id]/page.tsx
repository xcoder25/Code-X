
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, FileText, CheckSquare, Bot, Video } from 'lucide-react';
import Link from 'next/link';
import ChallengeInterface from '@/components/challenge-interface';
import LearningPathGenerator from '@/components/learning-path-generator';
import EnrollmentCard from '@/components/enrollment-card';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

// Mock challenges data
const challenges: { [key: string]: any } = {
  'css-selectors-challenge': {
    id: 'css-selectors-challenge',
    title: 'CSS Selectors Challenge',
    description: 'Master CSS selectors by targeting the correct elements on the page. Use the editor to write your CSS rules.',
    difficulty: 'Easy',
    defaultCode: `/* Your CSS selectors here */`
  }
};

interface Course {
    id: string;
    title: string;
    description: string;
    tags: string[];
    modules: any[];
}


function getLessonIcon(type: string) {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-5 w-5" />;
    case 'reading':
      return <FileText className="h-5 w-5" />;
    case 'challenge':
      return <CheckSquare className="h-5 w-5" />;
    case 'live':
        return <Video className="h-5 w-5" />;
    default:
      return null;
  }
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
        if (!params.id) return;
        try {
            const courseDoc = await getDoc(doc(db, 'courses', params.id));
            if (courseDoc.exists()) {
                // In a real app, module content would be structured better.
                // For now, we mock the lesson structure.
                const data = courseDoc.data();
                setCourse({
                    id: data.id,
                    title: data.title,
                    description: data.description,
                    tags: data.tags || [],
                    // Mocking modules and lessons based on uploaded file names
                    modules: (data.modules || []).map((mod: any, index: number) => ({
                        title: `Module ${index + 1}: ${mod.name.split('.').slice(0, -1).join('.')}`,
                        lessons: [
                            { title: `Introduction to ${mod.name}`, type: 'reading', completed: false },
                            { title: 'Core Concepts', type: 'video', completed: false },
                        ]
                    }))
                });
            } else {
                console.log("No such course!");
            }
        } catch (error) {
            console.error("Error fetching course:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchCourse();
  }, [params.id]);
  
  const challengeId = course?.modules?.flatMap((m: any) => m.lessons).find((l: any) => l.type === 'challenge')?.id;
  const challenge = challengeId ? challenges[challengeId] : null;

  if (loading) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                   <Skeleton className="h-10 w-96 mb-2" />
                   <Skeleton className="h-4 w-[500px] mb-4" />
                    <div className="flex items-center gap-2 mt-4">
                       <Skeleton className="h-6 w-20" />
                       <Skeleton className="h-6 w-24" />
                    </div>
                </div>
                 <Skeleton className="h-48 w-full max-w-md" />
            </div>
        </main>
    )
  }

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

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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
        {!isEnrolled ? (
          <EnrollmentCard courseId={course.id} onEnrollmentSuccess={handleEnrollmentSuccess} />
        ) : (
          <Button asChild size="lg">
              <Link href="/dashboard">
                  Return to Dashboard
              </Link>
          </Button>
        )}
      </div>
      
      {isEnrolled && course.modules.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
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
                                        {lesson.type === 'live' ? (
                                            <Button asChild size="sm">
                                                <Link href={lesson.meetingUrl} target="_blank">Join Session</Link>
                                            </Button>
                                        ) : (
                                            <Badge variant={lesson.completed ? "secondary" : "default"}>{lesson.completed ? "Completed" : "Pending"}</Badge>
                                        )}
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
                <Card className="mt-8 md:mt-0">
                    <CardHeader>
                        <CardTitle>Personalized Learning Path</CardTitle>
                        <CardDescription>
                        Use our AI Coach to generate a custom learning path tailored to your goals.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LearningPathGenerator />
                    </CardContent>
                </Card>
            </div>
        </div>
      )}

       {isEnrolled && course.modules.length === 0 && (
            <Card className="mt-6">
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Course content is not yet available. Check back soon!</p>
                </CardContent>
            </Card>
        )}

      <div className="mt-8">
         {isEnrolled && challenge && <ChallengeInterface challenge={challenge} />}
      </div>
    </main>
  );
}
