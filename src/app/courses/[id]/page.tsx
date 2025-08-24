
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Link from 'next/link';
import { PlayCircle, FileText, BookOpen, Library, Download, CheckCircle } from 'lucide-react';

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
import { getSkillCourseById } from '@/lib/skills-course-data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Lesson {
    id: string;
    title: string;
    content: string;
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

interface EnrollmentData {
    completedLessons?: string[];
    progress?: number;
}

export default function CourseDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({});
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Effect to fetch course data
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setSelectedLesson(null);

    const hardcodedPythonCourse = courseId === 'intro-to-python' ? pythonCourseData : null;
    const hardcodedSkillCourse = getSkillCourseById(courseId);

    if (hardcodedPythonCourse) {
        setCourse(hardcodedPythonCourse);
        if (hardcodedPythonCourse.modules[0]?.lessons[0]) {
            setSelectedLesson(hardcodedPythonCourse.modules[0].lessons[0]);
        }
        setIsEnrolled(false);
        setLoading(false);
        return;
    }

    if (hardcodedSkillCourse) {
        setCourse(hardcodedSkillCourse);
        if (hardcodedSkillCourse.modules[0]?.lessons[0]) {
            setSelectedLesson(hardcodedSkillCourse.modules[0].lessons[0]);
        }
        setIsEnrolled(false);
        setLoading(false);
        return;
    }


    const courseDocRef = doc(db, 'courses', courseId);
    
    const unsubscribeCourse = onSnapshot(courseDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const newCourse = {
          id: docSnapshot.id,
          title: data.title,
          description: data.description,
          tags: data.tags || [],
          modules: data.modules || [],
          resources: data.resources || [],
        };
        setCourse(newCourse);
         if (newCourse.modules[0]?.lessons[0]) {
            setSelectedLesson(newCourse.modules[0].lessons[0]);
        }
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

  // Effect to check user enrollment and progress
  useEffect(() => {
    if (!user || !courseId || getSkillCourseById(courseId) || courseId === 'intro-to-python') {
        setIsEnrolled(false);
        setEnrollmentData({});
        return;
    };
    
    const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', courseId);
    const unsubscribeEnrollment = onSnapshot(enrollmentDocRef, (doc) => {
      if (doc.exists()) {
          setIsEnrolled(true);
          setEnrollmentData(doc.data() as EnrollmentData);
      } else {
          setIsEnrolled(false);
          setEnrollmentData({});
      }
    });
    
    return () => unsubscribeEnrollment();
  }, [user, courseId]);

  const handleEnrollmentSuccess = () => {
    setIsEnrolled(true);
  };

  const handleLesssonToggle = async (lessonId: string, completed: boolean) => {
      if (!user) return;
      const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', courseId);
      
      const totalLessons = course?.modules.reduce((acc, module) => acc + module.lessons.length, 0) || 0;
      
      try {
          await updateDoc(enrollmentDocRef, {
              completedLessons: completed ? arrayUnion(lessonId) : arrayRemove(lessonId)
          });

          // After updating, recalculate progress
          const docSnap = await getDoc(enrollmentDocRef);
          if (docSnap.exists()) {
              const updatedData = docSnap.data();
              const completedCount = updatedData.completedLessons?.length || 0;
              const newProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
              await updateDoc(enrollmentDocRef, { progress: newProgress });
          }

      } catch (error) {
          console.error("Error updating lesson progress: ", error);
      }
  }

  const isLessonCompleted = (lessonId: string) => {
      return enrollmentData.completedLessons?.includes(lessonId) || false;
  }

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

  const canEnroll = user && !isEnrolled && course.id !== 'intro-to-python' && !getSkillCourseById(course.id);


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
        {canEnroll ? (
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
        <div className="mt-6">
             <Tabs defaultValue="curriculum">
                <TabsList className="grid w-full grid-cols-2 max-w-lg">
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="resources">Resource Library</TabsTrigger>
                </TabsList>
                <TabsContent value="curriculum">
                     <Card>
                        <div className="grid md:grid-cols-[300px_1fr] min-h-[600px]">
                            <div className="border-r overflow-y-auto">
                                <CardHeader>
                                    <CardTitle>Course Content</CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                     {course.modules.length > 0 ? (
                                        <Accordion type="multiple" defaultValue={course.modules.map(m => m.id)} className="w-full">
                                            {course.modules.map((module, index) => (
                                            <AccordionItem value={module.id} key={module.id}>
                                                <AccordionTrigger className="text-base font-semibold hover:no-underline px-2">
                                                    {module.title}
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-0">
                                                <ul className="space-y-1">
                                                    {module.lessons.map(lesson => (
                                                        <li key={lesson.id}>
                                                             <button 
                                                                onClick={() => setSelectedLesson(lesson)}
                                                                className={cn("w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors text-sm",
                                                                    selectedLesson?.id === lesson.id ? "bg-muted font-semibold" : "hover:bg-muted/50"
                                                                )}
                                                             >
                                                                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                <span className="flex-1">{lesson.title}</span>
                                                                {isLessonCompleted(lesson.id) && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                             </button>
                                                        </li>
                                                    ))}
                                                    {module.lessons.length === 0 && (
                                                        <li className="p-2 text-xs text-muted-foreground">No lessons in this module yet.</li>
                                                    )}
                                                </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                            ))}
                                        </Accordion>
                                        ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>Course content is not yet available.</p>
                                        </div>
                                        )}
                                </CardContent>
                            </div>
                            <div className="overflow-y-auto">
                                 {selectedLesson ? (
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold mb-4">{selectedLesson.title}</h2>
                                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedLesson.content}</p>
                                        <div className="flex items-center space-x-2 mt-8 border-t pt-4">
                                            <Checkbox 
                                                id={`complete-${selectedLesson.id}`} 
                                                checked={isLessonCompleted(selectedLesson.id)}
                                                onCheckedChange={(checked) => handleLesssonToggle(selectedLesson.id, !!checked)}
                                            />
                                            <Label htmlFor={`complete-${selectedLesson.id}`}>Mark as complete</Label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <p>Select a lesson to begin.</p>
                                    </div>
                                )}
                            </div>
                        </div>
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
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Course Preview</CardTitle>
            <CardDescription>The following modules are included in this course. You can enroll in this course once the content is ready.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-muted-foreground">
            <ul className="space-y-2 list-disc list-inside">
                {course.modules.length > 0 ? course.modules.map(module => (
                    <li key={module.id}>{module.title}</li>
                )) : (
                    <li>Course content is being prepared and will be available soon.</li>
                )}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
