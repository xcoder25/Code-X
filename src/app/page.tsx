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

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Student Dashboard</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Classes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              classes scheduled for this week
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
            <div className="text-2xl font-bold">5</div>
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
            <div className="text-2xl font-bold">2</div>
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
            <div className="text-2xl font-bold">Full-Stack Dev</div>
            <p className="text-xs text-muted-foreground">
              your primary learning track
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>
              Your classes and deadlines for the next 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Oct 28</TableCell>
                  <TableCell>React Hooks Workshop</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Class</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Oct 29</TableCell>
                  <TableCell>State Management Assignment</TableCell>
                  <TableCell>
                    <Badge variant="outline">Due</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Oct 30</TableCell>
                  <TableCell>Mid-term Exam</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Exam</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Nov 2</TableCell>
                  <TableCell>Advanced TypeScript</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Class</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent submissions and grades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-3" />
              <div className="flex-1">
                <p>
                  Submitted{' '}
                  <span className="font-semibold">
                    Component Lifecycle Assignment
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  2 days ago
                </p>
              </div>
              <Badge variant="default">Graded: A-</Badge>
            </div>
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-3" />
              <div className="flex-1">
                <p>
                  Completed{' '}
                  <span className="font-semibold">
                    JavaScript Fundamentals Quiz
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  4 days ago
                </p>
              </div>
              <Badge variant="secondary">Score: 92%</Badge>
            </div>
             <div className="flex items-center">
              <Activity className="h-5 w-5 mr-3" />
              <div className="flex-1">
                <p>
                  Enrolled in{' '}
                  <span className="font-semibold">
                    Advanced Next.js Bootcamp
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  1 week ago
                </p>
              </div>
            </div>
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
           <Card>
            <CardHeader>
              <CardTitle>Web Development Bootcamp</CardTitle>
              <CardDescription>Master HTML, CSS, JavaScript, React, and Node.js to build full-stack web applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Progress: 75%</p>
              <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{width: '75%'}}></div>
              </div>
            </CardContent>
            <CardFooter>
               <Button asChild className="w-full">
                <Link href="/courses/web-development">
                  Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Advanced Next.js Bootcamp</CardTitle>
              <CardDescription>Dive deep into server components, data fetching, and advanced routing in Next.js.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Progress: 20%</p>
               <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{width: '20%'}}></div>
              </div>
            </CardContent>
             <CardFooter>
               <Button asChild className="w-full">
                <Link href="/courses/advanced-nextjs">
                  Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
