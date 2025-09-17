

'use client';

import Link from 'next/link';
import {
  Card,
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
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';

interface Exam {
    id: string;
    title: string;
    courseTitle: string;
}

interface ExamSubmission {
    id: string;
    status: 'Submitted' | 'Graded';
    grade: string | null;
}

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, ExamSubmission>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    const unsubscribeExams = onSnapshot(examsQuery, (snapshot) => {
        const examsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Exam);
        setExams(examsData);
        if (!user) setLoading(false);
    }, (error) => {
        console.error("Error fetching exams:", error);
        if (!user) setLoading(false);
    });

    if (user) {
        const submissionsQuery = query(collection(db, 'users', user.uid, 'examSubmissions'));
        const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
            const subs = new Map<string, ExamSubmission>();
            snapshot.forEach(doc => {
                subs.set(doc.id, { id: doc.id, ...doc.data() } as ExamSubmission);
            });
            setSubmissions(subs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching submissions:", error);
            setLoading(false);
        });
        return () => {
            unsubscribeExams();
            unsubscribeSubmissions();
        }
    }

    return () => unsubscribeExams();
  }, [user]);

  const getStatus = (examId: string) => {
      if (submissions.has(examId)) {
          return submissions.get(examId)!.status;
      }
      return 'Upcoming';
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Upcoming': return 'default';
        case 'Submitted': return 'secondary';
        case 'Graded': return 'outline';
        default: return 'outline';
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Exams & Tests</h1>
      </div>
      <p className="text-muted-foreground">
        Prepare for upcoming exams and review your past results.
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-28 rounded-md" /></TableCell>
                    </TableRow>
                 ))
              ) : exams.length > 0 ? (
                exams.map((exam) => {
                    const status = getStatus(exam.id);
                    const submission = submissions.get(exam.id);
                    return (
                    <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>{exam.courseTitle}</TableCell>
                        <TableCell>
                        <Badge variant={getStatusVariant(status)}>{status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        {status === 'Upcoming' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/exams/${exam.id}`}>Begin Exam</Link>
                            </Button>
                        )}
                        {submission && status !== 'Upcoming' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/ai-tutor/${submission.id}`}>AI Tutor</Link>
                            </Button>
                        )}
                        </TableCell>
                    </TableRow>
                    )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No exams found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
