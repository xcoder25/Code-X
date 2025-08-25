
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
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface ScheduleEvent {
    id: string;
    title: string;
    courseTitle: string;
    date: string | Date;
    time: string;
    type: 'Assignment' | 'Exam' | 'Live Session';
}

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const assignmentsQuery = query(collection(db, 'assignments'), orderBy('dueDate', 'asc'));
        const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));

        const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
            const assignmentEvents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    courseTitle: data.courseTitle,
                    date: data.dueDate.toDate().toLocaleDateString(),
                    time: "11:59 PM",
                    type: 'Assignment'
                } as ScheduleEvent;
            });
            // This is a bit inefficient, but ensures we merge data from all sources
            setSchedule(currentSchedule => {
                const otherEvents = currentSchedule.filter(e => e.type !== 'Assignment');
                const newSchedule = [...otherEvents, ...assignmentEvents].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return newSchedule;
            });
             if (loading) setLoading(false);
        });

        const unsubExams = onSnapshot(examsQuery, (snapshot) => {
            const examEvents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    courseTitle: data.courseTitle,
                    date: 'TBD',
                    time: 'N/A',
                    type: 'Exam'
                } as ScheduleEvent;
            });
            setSchedule(currentSchedule => {
                const otherEvents = currentSchedule.filter(e => e.type !== 'Exam');
                const newSchedule = [...otherEvents, ...examEvents].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                return newSchedule;
            });
             if (loading) setLoading(false);
        });
        
        // Initial load complete after first data comes in
        const initialLoad = onSnapshot(assignmentsQuery, () => {
          if (loading) setLoading(false);
          initialLoad(); // Unsubscribe after first run
        })

        return () => {
            unsubAssignments();
            unsubExams();
        }
    }, [loading]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Your Schedule</h1>
      </div>
      <p className="text-muted-foreground">
        Stay on top of your classes, assignments, and exams.
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                    </TableRow>
                ))
              ) : schedule.length > 0 ? (
                schedule.map((event) => (
                    <TableRow key={`${event.type}-${event.id}`}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.courseTitle}</TableCell>
                    <TableCell>{event.date.toString()}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>
                        <Badge
                        variant={
                            event.type === 'Assignment'
                            ? 'destructive'
                            : event.type === 'Live Session'
                            ? 'default'
                            : 'secondary'
                        }
                        >
                        {event.type}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {event.type === 'Live Session' && (
                            <Button asChild size="sm">
                                <Link href={'#'} target="_blank">Join Session</Link>
                            </Button>
                        )}
                        {event.type === 'Assignment' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href="/assignments">View Assignment</Link>
                            </Button>
                        )}
                        {event.type === 'Exam' && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/exams/${event.id}`}>Begin Exam</Link>
                            </Button>
                        )}
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Your schedule is clear.
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
