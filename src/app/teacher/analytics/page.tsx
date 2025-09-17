'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  CheckCircle,
  TrendingUp,
  ClipboardList,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useTeacherAuth } from '@/app/teacher-auth-provider';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
  id: string;
  title: string;
}

interface Enrollment {
  progress: number;
}

interface Submission {
  id: string;
  userName: string;
  assignmentTitle: string;
  submittedAt: { seconds: number };
}

const chartConfig = {
  progress: {
    label: "Students",
  },
} satisfies import("@/components/ui/chart").ChartConfig


export default function TeacherAnalyticsPage() {
    const { user } = useTeacherAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Fetch courses taught by the teacher
        const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
        const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
            const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(coursesData);

            if (coursesData.length > 0) {
                const courseIds = coursesData.map(c => c.id);

                // Fetch enrollments for those courses
                const enrollmentsQuery = query(collectionGroup(db, 'enrollments'), where('courseId', 'in', courseIds));
                onSnapshot(enrollmentsQuery, (enrollmentsSnapshot) => {
                    const enrollmentsData = enrollmentsSnapshot.docs.map(doc => doc.data() as Enrollment);
                    setEnrollments(enrollmentsData);
                });
                
                // Fetch submissions for those courses
                const submissionsQuery = query(collectionGroup(db, 'submissions'), where('courseId', 'in', courseIds));
                 onSnapshot(submissionsQuery, (submissionsSnapshot) => {
                    const submissionsData = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
                    setSubmissions(submissionsData);
                });
            }
             setLoading(false);
        });

        return () => unsubscribeCourses();
    }, [user]);

    const averageCompletion = enrollments.length > 0
        ? enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length
        : 0;

    const progressDistribution = [
        { range: '0-20%', students: enrollments.filter(e => e.progress <= 20).length },
        { range: '21-40%', students: enrollments.filter(e => e.progress > 20 && e.progress <= 40).length },
        { range: '41-60%', students: enrollments.filter(e => e.progress > 40 && e.progress <= 60).length },
        { range: '61-80%', students: enrollments.filter(e => e.progress > 80 && e.progress <= 80).length },
        { range: '81-100%', students: enrollments.filter(e => e.progress > 80).length },
    ];


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Student Analytics</h2>
        <p className="text-muted-foreground">
            Insights into your students' performance and engagement.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{enrollments.length}</div>}
                    <p className="text-xs text-muted-foreground">Across all assigned courses</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-20" /> : (
                        <>
                        <div className="text-2xl font-bold">{averageCompletion.toFixed(1)}%</div>
                        <Progress value={averageCompletion} className="h-2 mt-1" />
                        </>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{submissions.filter(s => s.status === 'Pending').length}</div>}
                    <p className="text-xs text-muted-foreground">Assignments to be graded</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Grade</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">88%</div>
                    <p className="text-xs text-muted-foreground">Across all graded assignments</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Student Progress Distribution</CardTitle>
                    <CardDescription>Number of students in each completion bracket.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? <Skeleton className="h-[250px] w-full" /> : (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart data={progressDistribution} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                dataKey="range"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="students" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ChartContainer>
                     )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <CardDescription>The latest assignments waiting for your review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                </TableRow>
                                ))
                            ) : submissions.filter(s => s.status === 'Pending').slice(0, 4).map(sub => (
                                <TableRow key={sub.id}>
                                    <TableCell>{sub.userName}</TableCell>
                                    <TableCell className="font-medium">{sub.assignmentTitle}</TableCell>
                                    <TableCell><Badge variant="default">Pending</Badge></TableCell>
                                </TableRow>
                            ))}
                             {submissions.filter(s => s.status === 'Pending').length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No pending submissions.</TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
