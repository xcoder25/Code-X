import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  ClipboardList,
  Target,
  FileQuestion,
  Video,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const courses: any[] = [];
const assignments: any[] = [];
const exams: any[] = [];
const liveClasses: any[] = [];


const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'destructive';
    case 'Graded':
      return 'secondary';
    case 'Upcoming':
      return 'default';
    default:
      return 'outline';
  }
};

export default function DashboardPage() {
  const activeCourses = courses.filter((c) => c.status === 'in-progress');
  const pendingAssignments = assignments.filter((a) => a.status === 'Pending');
  const upcomingEvents = [
    ...assignments
      .filter((a) => a.status === 'Pending')
      .map((a) => ({ ...a, type: 'Assignment', date: a.dueDate })),
    ...exams.map((e) => ({ ...e, type: 'Exam' })),
    ...liveClasses.map((l) => ({ ...l, type: 'Live Session' })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const recentActivity = assignments
    .filter((a) => a.status === 'Graded')
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 3);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Student Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              assignments, exams, and classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Assignments
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              due by the end of the month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              currently enrolled bootcamps
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Not Set</div>
            <p className="text-xs text-muted-foreground">
              No track selected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>
              Your classes, assignments, and deadlines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <TableRow key={event.title}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.course}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.type === 'Assignment'
                              ? 'destructive'
                              : event.type === 'Live Session'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No upcoming events.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent submissions and grades.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map((activity) => (
                  <li key={activity.title} className="flex items-center space-x-4">
                    <div className="p-2 bg-accent rounded-full">
                      <Activity className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.course}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(activity.status)}>
                      {activity.grade}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            An overview of the bootcamps you are enrolled in.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {activeCourses.length > 0 ? (
            activeCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <Badge variant="default">In Progress</Badge>
                  </div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.progress}% complete
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}>
                      Continue Course <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-12 col-span-2">
              <p>You are not enrolled in any courses yet.</p>
              <Button asChild variant="link">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
