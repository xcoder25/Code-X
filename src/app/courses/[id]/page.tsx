
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
import { PlayCircle, FileText, CheckSquare, Bot, Video, File } from 'lucide-react';
import Link from 'next/link';
import ChallengeInterface from '@/components/challenge-interface';
import LearningPathGenerator from '@/components/learning-path-generator';
import EnrollmentCard from '@/components/enrollment-card';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';

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
    if (type.startsWith('video/')) {
        return <PlayCircle className="h-5 w-5" />;
    }
    if (type.startsWith('application/pdf')) {
        return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
        if (!params.id) return;
        setLoading(true);
        try {
            const courseDocRef = doc(db, 'courses', params.id);
            const courseDoc = await getDoc(courseDocRef);

            if (courseDoc.exists()) {
                const data = courseDoc.data();
                setCourse({
                    id: courseDoc.id,
                    title: data.title,
                    description: data.description,
                    tags: data.tags || [],
                    modules: (data.modules || []).map((mod: any, index: number) => ({
                        ...mod,
                        title: `Module ${index + 1}: ${mod.name.split('.').slice(0, -1).join('.')}`,
                        completed: false
                    }))
                });
            } else {
                console.log("No such course!");
                setCourse(null);
            }
        } catch (error) {
            console.error("Error fetching course:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchCourse();
  }, [params.id]);
  
  useEffect(() => {
    if (!user || !params.id) return;
    
    const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', params.id);
    const unsubscribe = onSnapshot(enrollmentDocRef, (doc) => {
        setIsEnrolled(doc.exists());
    });
    
    return () => unsubscribe();
  }, [user, params.id]);

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
             <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div>
                     <Skeleton className="h-48 w-full" />
                </div>
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
        {!isEnrolled && user ? (
          <EnrollmentCard courseId={course.id} userId={user.uid} onEnrollmentSuccess={handleEnrollmentSuccess} />
        ) : isEnrolled ? (
          <Button asChild size="lg">
              <Link href="/dashboard">
                  Return to Dashboard
              </Link>
          </Button>
        ) : null}
      </div>
      
      {isEnrolled && course.modules.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Materials</CardTitle>
                        <CardDescription>Follow the curriculum to complete the course.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible defaultValue="item-0">
                            {course.modules.map((module: any, index: number) => (
                            <AccordionItem value={`item-${index}`} key={module.url}>
                                <AccordionTrigger className="text-lg font-semibold">{`Module ${index + 1}`}</AccordionTrigger>
                                <AccordionContent>
                                <ul className="space-y-3">
                                    <li className={`flex items-center justify-between p-3 rounded-md transition-colors ${module.completed ? 'bg-accent/50 text-muted-foreground' : 'bg-muted/50'}`}>
                                        <div className="flex items-center gap-3">
                                            {getLessonIcon(module.type)}
                                            <a href={module.url} target="_blank" rel="noopener noreferrer" className={`hover:underline ${module.completed ? 'line-through' : ''}`}>{module.name}</a>
                                        </div>
                                        <Badge variant={module.completed ? "secondary" : "default"}>{module.completed ? "Completed" : "Pending"}</Badge>
                                    </li>
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
    </main>
  );
}
