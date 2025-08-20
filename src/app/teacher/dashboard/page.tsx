
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Activity,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherAuth } from '@/app/teacher-auth-provider';

interface Course {
    id: string;
    title: string;
    enrollments: number;
}

export default function TeacherDashboardPage() {
    const { user } = useTeacherAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const totalEnrollments = courses.reduce((acc, course) => acc + course.enrollments, 0);

    useEffect(() => {
        if (!user) return;

        const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
        const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
            const coursesData = snapshot.docs.map(doc => doc.data() as Course);
            setCourses(coursesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching teacher courses:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalEnrollments}</div>}
                    <p className="text-xs text-muted-foreground">Across all your courses</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{courses.length}</div>}
                    <p className="text-xs text-muted-foreground">Courses you are teaching</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Assignments to be graded</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Student Activity</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+50</div>
                    <p className="text-xs text-muted-foreground">New submissions this week</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>
                    Here's a quick overview of your teaching responsibilities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>You can manage your courses, grade assignments, and communicate with admins from the sidebar.</p>
            </CardContent>
        </Card>
    </div>
  );
}
