
'use client';

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
  Trophy,
  ClipboardCheck,
  Lightbulb,
  Video,
  Check,
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
import { useAuth } from '@/app/auth-provider';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Assignment, Submission } from '@/types';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ConnectClassroomDialog } from '@/components/connect-classroom-dialog';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
}


export default function DashboardPage() {
  const { user } = useAuth();
  const [activeCourses, setActiveCourses] = useState<Course[]>([]);
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, assignments: 0, projects: 0 });
  const [isClassroomConnected, setIsClassroomConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    // Fetch enrolled courses
    const enrollmentsQuery = query(collection(db, 'users', user.uid, 'enrollments'));
    const unsubscribeCourses = onSnapshot(enrollmentsQuery, async (snapshot) => {
        const enrolledCoursesPromises = snapshot.docs.map(async (enrollmentDoc) => {
            const courseId = enrollmentDoc.id;
            const enrollmentData = enrollmentDoc.data();
            const courseDocRef = doc(db, 'courses', courseId);
            const courseDoc = await getDoc(courseDocRef);

            if (courseDoc.exists()) {
                const courseData = courseDoc.data();
                return {
                    id: courseId,
                    title: courseData.title,
                    description: courseData.description,
                    progress: enrollmentData.progress || 0
                } as Course;
            }
            return null;
        });

        const enrolledCourses = (await Promise.all(enrolledCoursesPromises)).filter(Boolean) as Course[];
        setActiveCourses(enrolledCourses);
        setStats(prev => ({...prev, courses: enrolledCourses.filter(c => c.progress === 100).length}));
        if (loading) setLoading(false);
    }, (error) => {
        console.error("Error fetching active courses:", error);
        if (loading) setLoading(false);
    });

    // Fetch assignments and submissions to calculate counts
    const assignmentsQuery = query(collection(db, 'assignments'), orderBy('dueDate', 'desc'));
    const submissionsQuery = query(collection(db, 'users', user.uid, 'submissions'));
    const projectSubmissionsQuery = query(collection(db, 'users', user.uid, 'projectSubmissions'));

    const unsubscribeAssignments = onSnapshot(assignmentsQuery, (assignmentsSnapshot) => {
        const allAssignments = assignmentsSnapshot.docs.map(doc => doc.id);
        
        const unsubscribeSubmissions = onSnapshot(submissionsQuery, (submissionsSnapshot) => {
            const submittedIds = new Set(submissionsSnapshot.docs.map(doc => doc.id));
            const pendingCount = allAssignments.filter(id => !submittedIds.has(id)).length;
            setPendingAssignmentsCount(pendingCount);
            setStats(prev => ({...prev, assignments: submittedIds.size}));
        });

        return () => unsubscribeSubmissions();
    });

    const unsubscribeProjectSubmissions = onSnapshot(projectSubmissionsQuery, (snapshot) => {
        setStats(prev => ({...prev, projects: snapshot.size}));
    });

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            setIsClassroomConnected(userData.integrations?.googleClassroom?.connected || false);
        }
    });

    return () => {
        unsubscribeCourses();
        unsubscribeAssignments();
        unsubscribeProjectSubmissions();
        unsubscribeUser();
    };
  }, [user, loading]);
  
  // Mock data for now, will be replaced with Firestore data
  const exams: any[] = [];
  const liveClasses: any[] = [];

  const upcomingEvents = [
    ...exams.map((e) => ({ ...e, type: 'Exam' })),
    ...liveClasses.map((l) => ({ ...l, type: 'Live Session' })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const recentActivity: any[] = [];
  
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


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Student Dashboard</h1>
         <ConnectClassroomDialog onConnected={() => setIsClassroomConnected(true)} isConnected={isClassroomConnected} />
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
              exams and classes
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
            {loading ? <Skeleton className="h-8 w-8" /> : <div className="text-2xl font-bold">{pendingAssignmentsCount}</div>}
            <p className="text-xs text-muted-foreground">
              assignments to be completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-8" /> : <div className="text-2xl font-bold">{activeCourses.length}</div>}
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

       <Card>
        <CardHeader>
          <CardTitle>Milestone Tracker</CardTitle>
          <CardDescription>An overview of your accomplishments and progress.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-8" /> : stats.courses}</div>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-8" /> : stats.assignments}</div>
              <p className="text-sm text-muted-foreground">Assignments Submitted</p>
            </div>
          </div>
           <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-8" /> : stats.projects}</div>
              <p className="text-sm text-muted-foreground">Projects Finished</p>
            </div>
          </div>
        </CardContent>
      </Card>


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
                No upcoming events. Check the schedule page for details.
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
            <CardTitle>Class Recordings</CardTitle>
            <CardDescription>
              Catch up on any live sessions you may have missed.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
             <Card className="relative group">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center rounded-lg">
                    <Video className="h-12 w-12 text-white" />
                </div>
                <img src="https://picsum.photos/seed/rec1/600/400" alt="Class recording thumbnail" className="rounded-lg object-cover aspect-video" data-ai-hint="class recording" />
                <div className="p-3">
                    <h3 className="font-semibold">CSS Flexbox Masterclass</h3>
                    <p className="text-sm text-muted-foreground">Web Development Bootcamp - Oct 10, 2024</p>
                </div>
            </Card>
             <Card className="relative group">
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center rounded-lg">
                    <Video className="h-12 w-12 text-white" />
                </div>
                <img src="https://picsum.photos/seed/rec2/600/400" alt="Class recording thumbnail" className="rounded-lg object-cover aspect-video" data-ai-hint="class recording" />
                 <div className="p-3">
                    <h3 className="font-semibold">Introduction to Python Functions</h3>
                    <p className="text-sm text-muted-foreground">Intro to Python - Oct 8, 2024</p>
                </div>
            </Card>
             <Card className="relative group">
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center rounded-lg">
                    <Video className="h-12 w-12 text-white" />
                </div>
                <img src="https://picsum.photos/seed/rec3/600/400" alt="Class recording thumbnail" className="rounded-lg object-cover aspect-video" data-ai-hint="class recording" />
                 <div className="p-3">
                    <h3 className="font-semibold">State Management in React</h3>
                    <p className="text-sm text-muted-foreground">Advanced React - Oct 5, 2024</p>
                </div>
            </Card>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            An overview of the bootcamps you are enrolled in.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {loading ? (
             [...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </CardHeader>
                     <CardContent>
                       <Skeleton className="h-2.5 w-full rounded-full mb-2" />
                       <Skeleton className="h-4 w-24" />
                    </CardContent>
                    <CardFooter>
                       <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
          ) : activeCourses.length > 0 ? (
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
                  <Progress value={course.progress} className="h-2 mb-2" />
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
