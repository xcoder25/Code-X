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
import { assignments } from '@/lib/assignment-data';
import { getAllExamDetails } from '@/lib/exam-data';

export default function SchedulePage() {

  const exams = getAllExamDetails().map((e: any) => ({...e, type: "Exam", date: "TBD", time: "N/A"}));
  const assignmentEvents = assignments.map(a => ({...a, type: "Assignment", date: a.dueDate, time: "11:59 PM"}));
  
  // In a real app, live classes would come from a database
  const liveClasses: any[] = [];
  
  const schedule = [...assignmentEvents, ...exams, ...liveClasses].sort((a,b) => {
    // This sorting is basic, a real implementation would need more robust date handling
    if(a.date === "TBD") return 1;
    if(b.date === "TBD") return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });


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
              {schedule.length > 0 ? (
                schedule.map((event) => (
                    <TableRow key={`${event.type}-${event.id}`}>
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
