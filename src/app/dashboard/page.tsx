
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
  Flame,
  Trophy,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
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
        if (loading) setLoading(false);
    }, (error) => {
        console.error("Error fetching active courses:", error);
        if (loading) setLoading(false);
    });

    // Fetch assignments and submissions to calculate pending count
    const assignmentsQuery = query(collection(db, 'assignments'), orderBy('dueDate', 'desc'));
    const submissionsQuery = query(collection(db, 'users', user.uid, 'submissions'));

    const unsubscribeAssignments = onSnapshot(assignmentsQuery, (assignmentsSnapshot) => {
        const allAssignments = assignmentsSnapshot.docs.map(doc => doc.id);
        
        // Nest the submission listener to ensure we have assignments first
        const unsubscribeSubmissions = onSnapshot(submissionsQuery, (submissionsSnapshot) => {
            const submittedIds = new Set(submissionsSnapshot.docs.map(doc => doc.id));
            const pendingCount = allAssignments.filter(id => !submittedIds.has(id)).length;
            setPendingAssignmentsCount(pendingCount);
        });

        return () => unsubscribeSubmissions();
    });


    return () => {
        unsubscribeCourses();
        unsubscribeAssignments();
    };
  }, [user]);

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


  const leaderboardData = [
    { name: 'Alex Johnson', points: 2450, color: '#3b82f6' },
    { name: 'Sarah Chen', points: 2100, color: '#8b5cf6' },
    { name: 'Michael Ross', points: 1950, color: '#ec4899' },
    { name: 'Emma Wilson', points: 1800, color: '#10b981' },
    { name: 'David Kim', points: 1650, color: '#f59e0b' },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-background/50">
      <div className="flex items-center justify-between">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="font-bold text-3xl tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold text-sm">
                <Flame className="h-4 w-4 fill-orange-500" />
                <span>7 Day Streak</span>
            </div>
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold text-sm">
                <Zap className="h-4 w-4 fill-blue-500" />
                <span>1,250 XP</span>
            </div>
        </div>
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
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
             <Target className="h-12 w-12 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Career Path</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Fullstack Developer</div>
            <p className="text-xs text-muted-foreground mt-1">
               75% of prerequisites met
            </p>
            <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-xs" asChild>
                <Link href="/path" className="flex items-center">
                    Review Roadmap <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>Global leaderboard ranking for this week.</CardDescription>
                </div>
                <Trophy className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={leaderboardData} layout="vertical" margin={{ left: 20, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                tick={{ fontSize: 12, fill: 'currentColor' }} 
                                width={100}
                                axisLine={false}
                                tickLine={false}
                            />
                            <RechartsTooltip 
                                cursor={{ fill: 'transparent' }} 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={25}>
                                {leaderboardData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recent Insights</CardTitle>
                <CardDescription>AI-generated learning tips.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-1">
                        <TrendingUp className="h-3 w-3" />
                        PRO TIP
                    </p>
                    <p className="text-sm">You are 2x more likely to finish a module if you complete the lab exercises first.</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <p className="text-xs font-semibold text-purple-500 flex items-center gap-1.5 mb-1">
                         <Zap className="h-3 w-3" />
                        STREAK BONUS
                    </p>
                    <p className="text-sm">You're on a 7-day streak! Keep it up to secure a 20% XP boost for the next 24 hours.</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full text-xs" asChild>
                    <Link href="/path">Ask Elara for more <ArrowRight className="ml-1.5 h-3 w-3" /></Link>
                </Button>
            </CardFooter>
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
