
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
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import GradeSubmissionDialog from '@/components/admin/grade-submission-dialog';

interface Submission {
  id: string; // This will be the assignment ID
  userId: string;
  userName: string;
  assignmentTitle: string;
  course: string;
  colabLink: string;
  status: 'Pending' | 'Graded';
  grade: string | null;
  submittedAt: Timestamp;
}


export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const submissionsQuery = query(collectionGroup(db, 'submissions'), orderBy('submittedAt', 'desc'));
        const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
            const submissionsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id, // The doc.id here is the assignmentId
                    userId: data.userId,
                } as Submission;
            });
            setSubmissions(submissionsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching submissions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
            Review and grade student submissions.
        </p>
        <Card>
            <CardHeader>
                <CardTitle>All Submissions</CardTitle>
                <CardDescription>
                    A list of all assignment submissions from students.
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
                                    No submissions found.
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
