

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
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface ScheduleEvent {
    id: string;
    title: string;
    courseTitle: string;
    date: Date;
    type: 'Assignment' | 'Exam' | 'Live Session';
    actionUrl?: string;
}

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const allEvents: ScheduleEvent[] = [];
        let assignmentLoaded = false, examsLoaded = false, liveClassesLoaded = false;
        
        const updateSchedule = () => {
            if (assignmentLoaded && examsLoaded && liveClassesLoaded) {
                allEvents.sort((a,b) => a.date.getTime() - b.date.getTime());
                setSchedule(allEvents);
                setLoading(false);
            }
        }

        const assignmentsQuery = query(collection(db, 'assignments'), orderBy('dueDate', 'asc'));
        const examsQuery = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
        const liveClassesQuery = query(collection(db, 'liveClasses'), orderBy('scheduledAt', 'asc'));

        const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
            const assignmentEvents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    courseTitle: data.courseTitle,
                    date: (data.dueDate as Timestamp).toDate(),
                    type: 'Assignment',
                    actionUrl: '/assignments'
                } as ScheduleEvent;
            });
            // Replace old assignment events
            const otherEvents = allEvents.filter(e => e.type !== 'Assignment');
            allEvents.splice(0, allEvents.length, ...otherEvents, ...assignmentEvents);
            assignmentLoaded = true;
            updateSchedule();
        });

        const unsubExams = onSnapshot(examsQuery, (snapshot) => {
            const examEvents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    courseTitle: data.courseTitle,
                    date: (data.createdAt as Timestamp).toDate(), // Using createdAt as stand-in for now
                    type: 'Exam',
                    actionUrl: `/exams/${doc.id}`
                } as ScheduleEvent;
            });
            const otherEvents = allEvents.filter(e => e.type !== 'Exam');
            allEvents.splice(0, allEvents.length, ...otherEvents, ...examEvents);
            examsLoaded = true;
            updateSchedule();
        });

        const unsubLiveClasses = onSnapshot(liveClassesQuery, (snapshot) => {
            const liveClassEvents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    courseTitle: data.courseTitle,
                    date: (data.scheduledAt as Timestamp).toDate(),
                    type: 'Live Session',
                    actionUrl: data.meetingUrl
                } as ScheduleEvent;
            });
            const otherEvents = allEvents.filter(e => e.type !== 'Live Session');
            allEvents.splice(0, allEvents.length, ...otherEvents, ...liveClassEvents);
            liveClassesLoaded = true;
            updateSchedule();
        });

        return () => {
            unsubAssignments();
            unsubExams();
            unsubLiveClasses();
        }
    }, []);

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
                    <TableCell>{event.date.toLocaleDateString()}</TableCell>
                    <TableCell>{event.type === 'Assignment' ? '11:59 PM' : event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
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
                        {event.actionUrl && (
                             <Button asChild variant="outline" size="sm">
                                <Link href={event.actionUrl} target={event.type === 'Live Session' ? '_blank' : '_self'}>
                                    {event.type === 'Live Session' ? 'Join Session' : 'View Details'}
                                </Link>
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
