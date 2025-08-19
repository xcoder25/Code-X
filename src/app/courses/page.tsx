
'use client';

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
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { pythonCourse } from '@/lib/python-course-data';
import { skillsCourses } from '@/lib/skills-course-data';

interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  progress: number; 
  status: 'in-progress' | 'not-started';
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(coursesQuery, async (snapshot) => {
        const coursesDataPromises = snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            let isEnrolled = false;
            let progress = 0;

            if (user) {
                try {
                    const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', docSnapshot.id);
                    const enrollmentDoc = await getDoc(enrollmentDocRef);
                    if (enrollmentDoc.exists()) {
                        isEnrolled = true;
                        progress = enrollmentDoc.data().progress || 0;
                    }
                } catch (e) {
                    console.error("Error checking enrollment:", e);
                }
            }
            
            return {
                id: docSnapshot.id,
                title: data.title,
                description: data.description,
                tags: data.tags || [],
                progress: progress,
                status: isEnrolled ? 'in-progress' : 'not-started',
            } as Course;
        });

        const firestoreCourses = await Promise.all(coursesDataPromises);
        
        // Combine firestore courses with the hard-coded one
        const allCourses = [...firestoreCourses, pythonCourse, ...skillsCourses];
        
        // Prevent duplicates if a course is ever added to firestore with same id
        const uniqueCourses = allCourses.filter((course, index, self) =>
            index === self.findIndex((c) => (
                c.id === course.id
            ))
        );

        setCourses(uniqueCourses);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching courses:", error);
        // Still add the hardcoded courses even if firestore fails
        setCourses([pythonCourse, ...skillsCourses]);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Courses</h1>
      </div>
      <p className="text-muted-foreground">
        Browse available courses and continue your learning journey.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
             [...Array(6)].map((_, i) => (
                <Card key={i} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent className="flex-grow space-x-2">
                        <Skeleton className="h-5 w-16 inline-block" />
                        <Skeleton className="h-5 w-20 inline-block" />
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2">
                        <Skeleton className="h-2.5 w-full rounded-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
        ) : courses.map((course) => (
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
              {course.tags.map((tag: string) => (
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
                <Link href={`/courses/${course.id}`}>
                   {course.status === 'not-started' ? 'View Course' : 'Continue Course'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       {courses.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-12 col-span-full">
              <p>No courses available at the moment. Please check back later.</p>
            </div>
        )}
    </main>
  );
}
