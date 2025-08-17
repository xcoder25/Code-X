
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { PlayCircle, FileText, BookOpen, Library, Download } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LearningPathGenerator from '@/components/learning-path-generator';
import EnrollmentCard from '@/components/enrollment-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { db } from '@/lib/firebase';
import { pythonCourseData } from '@/lib/python-course-data';


interface Lesson {
    id: string;
    title: string;
    content: string;
    completed?: boolean;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Resource {
    id: string;
    name: string;
    url: string;
}

interface Course {
    id: string;
    title: string;
    description: string;
    tags: string[];
    modules: Module[];
    resources: Resource[];
}

export default function CourseDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Effect to fetch course data
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    // If it's the hard-coded python course, load it directly
    if (courseId === 'intro-to-python') {
        setCourse(pythonCourseData);
        setLoading(false);
        // We can't check enrollment for a hard-coded course this way,
        // so we'll just show the preview. 
        // A full implementation would check enrollment status.
        setIsEnrolled(false);
        return;
    }

    const courseDocRef = doc(db, 'courses', courseId);
    
    const unsubscribeCourse = onSnapshot(courseDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setCourse({
          id: docSnapshot.id,
          title: data.title,
          description: data.description,
          tags: data.tags || [],
          modules: data.modules || [],
          resources: data.resources || [],
        });
      } else {
        setCourse(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching course:", error);
      setLoading(false);
    });

    return () => unsubscribeCourse();
  }, [courseId]);

  // Effect to check user enrollment for firestore courses
  useEffect(() => {
    if (!user || !courseId || courseId === 'intro-to-python') {
        setIsEnrolled(false);
        return;
    };
    
    const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', courseId);
    const unsubscribeEnrollment = onSnapshot(enrollmentDocRef, (doc) => {
      setIsEnrolled(doc.exists());
    });
    
    return () => unsubscribeEnrollment();
  }, [user, courseId]);

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
  };

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
    );
  }

  if (!course) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 items-center justify-center text-center">
        <h1 className="font-semibold text-3xl">Course Not Found</h1>
        <p className="text-muted-foreground mt-2">The course you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
           <h1 className="font-semibold text-3xl">{course.title}</h1>
           <p className="text-muted-foreground mt-2 max-w-3xl">{course.description}</p>
            <div className="flex items-center gap-2 mt-4">
              {course.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
        </div>
        {!isEnrolled && user && course.id !== 'intro-to-python' ? (
          <EnrollmentCard courseId={course.id} userId={user.uid} onEnrollmentSuccess={handleEnrollmentSuccess} />
        ) : isEnrolled ? (
          <Card className="bg-green-500/10 border-green-500/30 text-green-800 dark:text-green-300 w-full max-w-md shrink-0">
             <CardContent className="p-4">
                <p className="font-semibold text-center">You are enrolled in this course!</p>
             </CardContent>
          </Card>
        ) : null}
      </div>
      
      {isEnrolled ? (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2">
             <Tabs defaultValue="curriculum">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="resources">Resource Library</TabsTrigger>
                </TabsList>
                <TabsContent value="curriculum">
                    <Card>
                    <CardHeader>
                        <CardTitle>Course Curriculum</CardTitle>
                        <CardDescription>Follow the curriculum to complete the course.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {course.modules.length > 0 ? (
                        <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                            {course.modules.map((module, index) => (
                            <AccordionItem value={`item-${index}`} key={module.id}>
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    {module.title}
                                </AccordionTrigger>
                                <AccordionContent>
                                <ul className="space-y-1">
                                    {module.lessons.map(lesson => (
                                    <li key={lesson.id}>
                                        <div className="flex items-center p-3 rounded-md transition-colors hover:bg-muted/50 cursor-pointer">
                                            <BookOpen className="h-5 w-5 mr-3 text-muted-foreground" />
                                            <span className="flex-1">{lesson.title}</span>
                                            <Badge variant={"secondary"}>Pending</Badge>
                                        </div>
                                    </li>
                                    ))}
                                    {module.lessons.length === 0 && (
                                        <li className="p-3 text-sm text-muted-foreground">No lessons in this module yet.</li>
                                    )}
                                </ul>
                                </AccordionContent>
                            </AccordionItem>
                            ))}
                        </Accordion>
                        ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Course content is not yet available. Check back soon!</p>
                        </div>
                        )}
                    </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="resources">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resource Library</CardTitle>
                            <CardDescription>Downloadable materials for this course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {course.resources.length > 0 ? (
                                <ul className="space-y-2">
                                    {course.resources.map(resource => (
                                        <li key={resource.id}>
                                            <a 
                                                href={resource.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center justify-between p-3 rounded-md transition-colors hover:bg-muted/50 border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Library className="h-5 w-5 text-muted-foreground" />
                                                    <span className="flex-1">{resource.name}</span>
                                                </div>
                                                <Download className="h-5 w-5 text-muted-foreground" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>No resources available for this course yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
          </div>
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Personalized Learning Path</CardTitle>
                <CardDescription>Use our AI Coach to generate a custom learning path tailored to your goals.</CardDescription>
              </CardHeader>
              <CardContent>
                <LearningPathGenerator />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Course Preview</CardTitle>
            <CardDescription>The following modules are included in this course.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-muted-foreground">
            <ul className="space-y-2 list-disc list-inside">
                {course.modules.length > 0 ? course.modules.map(module => (
                    <li key={module.id}>{module.title}</li>
                )) : (
                    <li>Content is being prepared.</li>
                )}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

    