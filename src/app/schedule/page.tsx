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

const schedule = [
    {
        title: 'Live Q&A: React Hooks',
        course: 'Web Development Bootcamp',
        date: 'Oct 28, 2024',
        time: '4:00 PM - 5:00 PM',
        type: 'Live Session',
        meetingUrl: '#'
    },
    {
        title: 'State Management',
        course: 'Web Development Bootcamp',
        date: 'Oct 29, 2024',
        time: '11:59 PM',
        type: 'Assignment',
    },
    {
        title: 'Mid-term Exam',
        course: 'Web Development Bootcamp',
        date: 'Oct 30, 2024',
        time: '9:00 AM - 11:00 AM',
        type: 'Exam',
    },
    {
        title: 'Live Coding: Building a Server Component',
        course: 'Advanced Next.js',
        date: 'Nov 1, 2024',
        time: '2:00 PM - 3:30 PM',
        type: 'Live Session',
        meetingUrl: '#'
    },
    {
        title: 'Server Actions',
        course: 'Advanced Next.js',
        date: 'Nov 5, 2024',
        time: '11:59 PM',
        type: 'Assignment',
    },
];

export default function SchedulePage() {
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
              {schedule.map((event) => (
                <TableRow key={event.title}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.course}</TableCell>
                  <TableCell>{event.date}</TableCell>
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
                            <Link href={event.meetingUrl || '#'} target="_blank">Join Session</Link>
                        </Button>
                    )}
                     {event.type === 'Assignment' && (
                        <Button asChild variant="outline" size="sm">
                            <Link href="/assignments">View Assignment</Link>
                        </Button>
                    )}
                     {event.type === 'Exam' && (
                        <Button asChild variant="outline" size="sm">
                            <Link href="/exams">Begin Exam</Link>
                        </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
