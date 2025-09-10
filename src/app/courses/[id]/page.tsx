
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { PlayCircle, FileText, BookOpen, Library, Download, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

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
import EnrollmentCard from '@/components/enrollment-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { db } from '@/lib/firebase';
import { pythonCourseData, pythonCourse } from '@/lib/python-course-data';
import { getSkillCourseById, skillsCourses } from '@/lib/skills-course-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

export async function generateStaticParams() {
  // Fetch dynamic courses from Firestore
  const coursesSnapshot = await getDocs(collection(db, 'courses'));
  const firestoreCourses = coursesSnapshot.docs.map(doc => ({
    id: doc.id,
  }));

  // Get hardcoded course IDs
  const hardcodedCourseIds = [
    pythonCourse.id,
    ...skillsCourses.map(c => c.id)
  ].map(id => ({ id }));

  // Combine and return unique IDs
  const allIds = [...firestoreCourses, ...hardcodedCourseIds];
  const uniqueIds = allIds.filter((item, index, self) => 
    index === self.findIndex((t) => t.id === item.id)
  );

  return uniqueIds;
}

export default function CourseDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
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
        setIsEnrolled(false); // Can't enroll in preview courses
        setLoading(false);
        return;
    }

    if (hardcodedSkillCourse) {
        setCourse(hardcodedSkillCourse);
        if (hardcodedSkillCourse.modules[0]?.lessons[0]) {
            setSelectedLesson(hardcodedSkillCourse.modules[0].lessons[0]);
        }
        setIsEnrolled(false); // Can't enroll in preview courses
        setLoading(false);
        return;
    }


    const courseDocRef = doc(db, 'courses', courseId);
    
    const unsubscribeCourse = onSnapshot(courseDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const newCourse: Course = {
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
        } else {
            setSelectedLesson(null);
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

  const handleLessonToggle = async (lessonId: string, completed: boolean) => {
      if (!user || !isEnrolled) return;
      const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', courseId);
      
      const totalLessons = course?.modules.reduce((acc, module) => acc + module.lessons.length, 0) || 0;
      
      try {
          // This will trigger the onSnapshot listener for enrollmentData to update the state
          await updateDoc(enrollmentDocRef, {
              completedLessons: completed ? arrayUnion(lessonId) : arrayRemove(lessonId)
          });

          // After updating, recalculate progress
          const docSnap = await getDoc(enrollmentDocRef);
          if (docSnap.exists()) {
              const updatedData = docSnap.data();
              const completedCount = updatedData.completedLessons?.length || 0;
              const newProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
              await updateDoc(enrollmentDocRef, { progress: newProgress });
          }

      } catch (error) {
          console.error("Error updating lesson progress: ", error);
      }
  }

  const isLessonCompleted = (lessonId: string) => {
      return enrollmentData.completedLessons?.includes(lessonId) || false;
  }
  
  const allLessons: Lesson[] = course?.modules.flatMap(m => m.lessons) || [];
  const currentLessonIndex = allLessons.findIndex(l => l.id === selectedLesson?.id);

  const navigateToLesson = (direction: 'next' | 'prev') => {
      if (currentLessonIndex === -1) return;

      const newIndex = direction === 'next' ? currentLessonIndex + 1 : currentLessonIndex - 1;

      if (newIndex >= 0 && newIndex < allLessons.length) {
          setSelectedLesson(allLessons[newIndex]);
      }
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
    <main className="flex flex-1 flex-col">
       {/* Page Header */}
       <div className="border-b">
         <div className="container mx-auto px-4 md:px-6 py-6">
             <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push('/courses')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
            </Button>
            <h1 className="font-semibold text-3xl">{course.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">{course.description}</p>
            <div className="flex items-center gap-2 mt-4">
                {course.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
            </div>
         </div>
       </div>

      {isEnrolled ? (
        <div className="container mx-auto px-4 md:px-6 flex-1 grid md:grid-cols-[300px_1fr] gap-8 py-8">
            {/* Left Sidebar - Course Content */}
            <aside className="hidden md:block h-full border rounded-lg overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-semibold">Course Content</h2>
                </div>
                <Separator />
                <div className="p-2">
                    {course.modules.length > 0 ? (
                        <div className="space-y-4">
                            {course.modules.map((module) => (
                            <div key={module.id}>
                                <h3 className="font-semibold px-2 mb-2">{module.title}</h3>
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
                            </div>
                            ))}
                        </div>
                        ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Course content is not yet available.</p>
                        </div>
                        )}
                </div>
            </aside>
            {/* Main Content - Lesson View */}
            <div className="flex flex-col">
                 {selectedLesson ? (
                    <article className="flex-1">
                        <h2 className="text-2xl font-bold mb-4">{selectedLesson.title}</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedLesson.content}</p>
                        </div>
                        <Separator className="my-8" />
                        <div className="flex items-center space-x-3">
                            <Checkbox 
                                id={`complete-${selectedLesson.id}`} 
                                checked={isLessonCompleted(selectedLesson.id)}
                                onCheckedChange={(checked) => handleLessonToggle(selectedLesson.id, !!checked)}
                            />
                            <Label htmlFor={`complete-${selectedLesson.id}`} className="text-sm font-medium">Mark as complete</Label>
                        </div>

                        <div className="flex justify-between mt-12">
                            <Button variant="outline" onClick={() => navigateToLesson('prev')} disabled={currentLessonIndex === 0}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                            <Button onClick={() => navigateToLesson('next')} disabled={currentLessonIndex === allLessons.length - 1}>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </article>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/50 rounded-lg">
                        <p>Select a lesson to begin.</p>
                    </div>
                )}
            </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 py-8">
            {canEnroll ? (
                <EnrollmentCard courseId={course.id} userId={user.uid} onEnrollmentSuccess={handleEnrollmentSuccess} />
            ) : (
                <Card>
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
        </div>
      )}
    </main>
  );
}

    