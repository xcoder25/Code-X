
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import GradeSubmissionDialog from '@/components/admin/grade-submission-dialog';
import type { Submission } from '@/types';
import { useTeacherAuth } from '@/app/teacher-auth-provider';


export default function TeacherSubmissionsPage() {
    const { user } = useTeacherAuth();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function fetchSubmissions() {
            setLoading(true);
            try {
                // 1. Get courses taught by the teacher
                const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
                const coursesSnap = await getDocs(coursesQuery);
                const courseIds = coursesSnap.docs.map(doc => doc.id);

                if (courseIds.length === 0) {
                    setSubmissions([]);
                    setLoading(false);
                    return;
                }

                // 2. Query all submissions
                const submissionsQuery = query(collectionGroup(db, 'submissions'));
                const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
                    const allSubmissionsData = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            ...data,
                            id: doc.id,
                            userId: data.userId,
                        } as Submission & { course: string };
                    });

                    // 3. Filter submissions client-side for courses taught by this teacher
                    const teacherSubmissions = allSubmissionsData.filter(sub => courseIds.includes(sub.courseId));

                    setSubmissions(teacherSubmissions as Submission[]);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching submissions:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error setting up submissions listener:", error);
                setLoading(false);
            }
        }
        
        fetchSubmissions();

    }, [user]);

    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'Pending':
          return 'default';
        case 'Graded':
          return 'secondary';
        default:
          return 'outline';
      }
    };


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Assignment Submissions</h2>
        </div>
         <p className="text-muted-foreground">
            Review and grade student submissions for your courses.
        </p>
        <Card>
            <CardHeader>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>
                    A list of all assignment submissions from students in your courses.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {loading ? (
                             [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-20 rounded-md" /></TableCell>
                                </TableRow>
                            ))
                        ) : submissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No submissions found for your courses.
                                </TableCell>
                            </TableRow>
                        ) : submissions.map(item => (
                            <TableRow key={`${item.userId}-${item.id}`}>
                                <TableCell className="font-medium">{item.userName}</TableCell>
                                <TableCell>{item.assignmentTitle}</TableCell>
                                <TableCell>{item.course}</TableCell>
                                <TableCell>{new Date(item.submittedAt.seconds * 1000).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>{item.grade || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Button asChild variant="outline" size="sm">
                                            <a href={item.colabLink} target="_blank" rel="noopener noreferrer">View Link</a>
                                        </Button>
                                        {item.status === 'Pending' && (
                                            <GradeSubmissionDialog submission={item}>
                                                <Button size="sm">Grade</Button>
                                            </GradeSubmissionDialog>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
