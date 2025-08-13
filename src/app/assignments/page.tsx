
'use client';

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
import { useAuth } from '@/app/auth-provider';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { assignments, Assignment } from '@/lib/assignment-data';
import { Submission } from '@/types';
import SubmissionDialog from '@/components/submission-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface AssignmentWithSubmission extends Assignment {
  submission?: Submission;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [userSubmissions, setUserSubmissions] = useState<Map<string, Submission>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const submissionsQuery = query(collection(db, 'users', user.uid, 'submissions'));
    const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
      const submissionsMap = new Map<string, Submission>();
      snapshot.forEach(doc => {
        submissionsMap.set(doc.id, { id: doc.id, ...doc.data() } as Submission);
      });
      setUserSubmissions(submissionsMap);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching submissions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const assignmentsWithSubmissions: AssignmentWithSubmission[] = assignments.map(assignment => ({
    ...assignment,
    submission: userSubmissions.get(assignment.id),
  }));

  const getStatus = (assignment: AssignmentWithSubmission) => {
    if (assignment.submission) {
      return assignment.submission.status;
    }
    return 'Not Submitted';
  };

  const getGrade = (assignment: AssignmentWithSubmission) => {
    return assignment.submission?.grade || 'N/A';
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'default';
      case 'Graded':
        return 'secondary';
      default:
        return 'destructive';
    }
  };
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Assignments</h1>
      </div>
      <p className="text-muted-foreground">
        Track your assignments, due dates, and grades.
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : assignmentsWithSubmissions.length > 0 ? (
                assignmentsWithSubmissions.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.title}
                    </TableCell>
                    <TableCell>{assignment.course}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(getStatus(assignment))}>
                        {getStatus(assignment)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getGrade(assignment)}</TableCell>
                    <TableCell className="text-right">
                       {getStatus(assignment) === 'Not Submitted' && user && (
                          <SubmissionDialog 
                            assignmentId={assignment.id} 
                            userId={user.uid}
                            userName={user.displayName || 'Anonymous'}
                          >
                             <Button variant="outline" size="sm">
                                Submit
                            </Button>
                          </SubmissionDialog>
                       )}
                       {getStatus(assignment) === 'Pending' && (
                          <Button variant="outline" size="sm" disabled>
                            Pending Review
                          </Button>
                       )}
                       {getStatus(assignment) === 'Graded' && (
                          <Button variant="outline" size="sm" disabled>
                            View Submission
                          </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No assignments found.
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
