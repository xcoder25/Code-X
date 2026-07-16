
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
    Copy,
    Share2,
    Gift,
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
import {
    CheckCircle2,
    Clock,
    Search,
    ChevronRight,
    TrendingUp as TrendingUpIcon,
    Crown,
    Layout,
    MousePointer2,
    LineChart as LineChartIcon
} from 'lucide-react';
import { useAuth } from '@/app/auth-provider';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, query, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Assignment, Submission } from '@/types';
import React from 'react';
import { Sparkles as SparklesIcon, MoreHorizontal } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description: string;
    progress: number;
}


export default function DashboardPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeCourses, setActiveCourses] = useState<Course[]>([]);
    const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [referralLink, setReferralLink] = useState('');

    useEffect(() => {
        if (user?.uid && typeof window !== 'undefined') {
            setReferralLink(`${window.location.origin}/bootcamp?ref=${user.uid}`);
        }
    }, [user]);

    const copyReferralLink = useCallback(() => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        toast({
            title: 'Referral Link Copied!',
            description: 'Share it with friends so they can register for the bootcamp.',
        });
    }, [referralLink, toast]);

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
        <main className="flex flex-1 flex-col gap-8 p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 w-fit">
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Portal Online</span>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h1 className="font-black text-4xl tracking-tighter bg-gradient-to-br from-orange-600 via-orange-500 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent italic uppercase text-shadow-glow">DASHBOARD</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 tracking-tight">Active session for user <span className="text-orange-500 dark:text-orange-400 font-mono">#{user?.uid?.substring(0, 6).toUpperCase()}</span></p>
                </motion.div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 transition-all hover:bg-orange-500/20">
                            <Flame className="h-4 w-4 fill-orange-500" />
                            <span className="font-black text-sm uppercase tracking-tighter">7 Day Streak</span>
                        </div>
                        <div className="mt-2 h-1 w-32 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 transition-all hover:bg-orange-500/20">
                            <Zap className="h-4 w-4 fill-orange-500" />
                            <span className="font-black text-sm uppercase tracking-tighter">1,250 XP Points</span>
                        </div>
                        <div className="mt-2 h-1 w-32 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Upcoming Tasks', value: upcomingEvents.length, desc: 'Exams & Sessions', icon: <Calendar />, color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/10' },
                    { label: 'Pending Work', value: pendingAssignmentsCount, desc: 'Assignments due soon', icon: <ClipboardList />, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
                    { label: 'My Courses', value: activeCourses.length, desc: 'Classes you joined', icon: <BookOpen />, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                    { label: 'Career Goal', value: '75%', desc: 'Fullstack Dev Path', icon: <Target />, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/10' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn("p-5 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/20",
                            stat.bg,
                            "border-white/50 dark:border-white/5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl shadow-sm")}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2 rounded-xl border", "bg-slate-50 dark:bg-slate-950 border-orange-100/50 dark:border-white/5", stat.color)}>{React.cloneElement(stat.icon as React.ReactElement, { className: "h-4 w-4" })}</div>
                            <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-700" />
                        </div>
                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">{stat.value}</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-orange-500">{stat.label}</div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-2 font-mono italic">{stat.desc}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-2 bg-white/60 dark:bg-slate-900/40 border-white/50 dark:border-slate-800 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-xl dark:shadow-2xl">
                    <CardHeader className="flex flex-row items-start justify-between border-b border-orange-50 dark:border-white/5 bg-orange-50/20 dark:bg-slate-950/20 px-8 py-6">
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight uppercase flex items-center gap-2 text-slate-200">
                                <Trophy className="h-5 w-5 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                                Top Students
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Weekly points ranking</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Live Audit</span>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-8">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leaderboardData} layout="vertical" margin={{ left: 30, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.05} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 800 }}
                                        width={120}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#020617', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', color: '#fff' }}
                                    />
                                    <Bar dataKey="points" radius={[0, 10, 10, 0]} barSize={28}>
                                        {leaderboardData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl rounded-3xl shadow-xl border-t-orange-500/20">
                    <CardHeader className="px-8 pt-8">
                        <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-slate-200">
                            <SparklesIcon className="h-5 w-5 text-orange-400" />
                            Learning Tips
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium italic">Handy advice from Elara</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 px-8 py-6">
                        {[
                            { label: 'Study Tip', text: 'You learn faster when you try the coding practice before the notes.', icon: <TrendingUpIcon />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
                            { label: 'Weekly Goal', text: 'You are on track for a great 14-day streak. Keep it up!', icon: <Zap />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
                            { label: 'Skill Suggestions', text: 'Try learning some TypeScript next to level up your skills.', icon: <Layout />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
                        ].map((insight, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-950/50 border border-orange-50 dark:border-white/5 transition-all hover:bg-slate-50 dark:hover:bg-slate-900">
                                <div className={cn("shrink-0 p-2 h-fit rounded-xl", insight.bg, insight.color)}>{React.cloneElement(insight.icon as React.ReactElement, { className: "h-3.5 w-3.5" })}</div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{insight.label}</p>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic opacity-80">{insight.text}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="px-8 pb-8">
                        <Button className="w-full h-11 bg-slate-950 hover:bg-orange-600 text-slate-300 hover:text-white border border-slate-800 hover:border-orange-500 rounded-2xl font-bold transition-all shadow-xl" asChild>
                            <Link href="/path" className="flex items-center justify-center gap-2">
                                Initialize Elara <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2 bg-slate-900 font-medium rounded-3xl border-slate-800 backdrop-blur-xl overflow-hidden group">
                    <CardHeader className="px-8 py-6 border-b border-white/5 bg-slate-950/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-slate-200">
                                    <Calendar className="h-5 w-5 text-orange-500" />
                                    Weekly Schedule
                                </CardTitle>
                                <CardDescription className="text-slate-500">Upcoming classes and deadlines</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {upcomingEvents.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-slate-950/40">
                                    <TableRow className="hover:bg-transparent border-slate-800">
                                        <TableHead className="pl-8 text-[11px] font-bold uppercase text-slate-500 tracking-widest">Protocol</TableHead>
                                        <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Base Module</TableHead>
                                        <TableHead className="text-[11px] font-bold uppercase text-slate-500 tracking-widest">Directive</TableHead>
                                        <TableHead className="pr-8 text-right text-[11px] font-bold uppercase text-slate-500 tracking-widest">Deadline</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingEvents.slice(0, 5).map((event) => (
                                        <TableRow key={event.title} className="border-slate-800 hover:bg-slate-800/30 transition-colors group/row">
                                            <TableCell className="pl-8 font-black text-sm text-slate-200">{event.title}</TableCell>
                                            <TableCell className="text-slate-400 font-bold italic">{event.course}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase border-none",
                                                        event.type === 'Assignment' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                                                    )}
                                                >
                                                    {event.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-8 text-right font-mono text-xs text-slate-500 italic font-bold">{event.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-600 opacity-40">
                                <Clock className="h-12 w-12" />
                                <p className="font-black uppercase tracking-widest text-sm italic">Clear Horizon: No Pending Deployments</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardHeader className="px-8 py-6 border-b border-white/5 bg-slate-950/20">
                        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-slate-200">
                            <MousePointer2 className="h-5 w-5 text-emerald-500" />
                            Recent Progress
                        </CardTitle>
                        <CardDescription className="text-slate-500">Your latest activities and grades</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.title} className="flex items-center gap-4 group/item">
                                        <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-slate-800 text-slate-100 rounded-xl group-hover/item:bg-emerald-500 transition-all shadow-xl group-hover/item:text-white">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-slate-200 truncate">{activity.title}</p>
                                            <p className="text-[10px] font-bold text-slate-500 italic truncate tracking-tight uppercase opacity-70">{activity.course}</p>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] h-6 px-2 font-black">{activity.grade}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 py-12 text-slate-600 opacity-40">
                                <LineChartIcon className="h-12 w-12" />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-600">Trace Silent: No Recents Recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-slate-200">My Courses</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Bootcamps you are currently learning</p>
                    </div>
                    <Button variant="outline" className="rounded-2xl bg-white dark:bg-slate-900 border-orange-100 dark:border-slate-800 hover:bg-orange-50 dark:hover:bg-slate-800 text-slate-400 px-6 font-bold" asChild>
                        <Link href="/courses">Catalog <ChevronRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <Card key={i} className="bg-slate-900/40 border-slate-800 rounded-3xl p-6">
                                <Skeleton className="h-12 w-12 rounded-2xl mb-4 bg-slate-800" />
                                <Skeleton className="h-6 w-3/4 mb-2 bg-slate-800" />
                                <Skeleton className="h-4 w-full mb-6 bg-slate-800" />
                                <Skeleton className="h-2 w-full rounded-full mb-8 bg-slate-800" />
                                <Skeleton className="h-11 w-full rounded-2xl bg-slate-800" />
                            </Card>
                        ))
                    ) : activeCourses.length > 0 ? (
                        activeCourses.map((course) => (
                            <Card key={course.id} className="bg-slate-900/60 border-slate-800 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl transition-all hover:-translate-y-2 group overflow-hidden flex flex-col border-t-white/5">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                                    <BookOpen className="h-32 w-32" />
                                </div>
                                <CardHeader className="px-8 pt-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                            <BookOpen className="h-6 w-6 text-white" />
                                        </div>
                                        <Badge className="bg-slate-950 text-emerald-400 border border-emerald-500/30 text-[10px] px-3 h-7 rounded-full font-black tracking-widest shadow-lg">ACTIVE</Badge>
                                    </div>
                                    <CardTitle className="text-xl font-black text-white italic truncate">{course.title}</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium leading-relaxed italic line-clamp-2 mt-2 opacity-80">{course.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <span>Course Progress</span>
                                            <span className="text-orange-500 dark:text-orange-400">{course.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 shadow-inner border border-orange-50 dark:border-white/5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="px-8 pb-8 pt-4">
                                    <Button asChild className="w-full h-12 bg-slate-900 dark:bg-white hover:bg-orange-600 text-white dark:text-slate-950 hover:text-white rounded-[1.25rem] font-black italic uppercase tracking-tighter transition-all group-hover:shadow-2xl group-hover:shadow-orange-500/20 active:scale-95">
                                        <Link href={`/courses/${course.id}`} className="flex items-center justify-center">
                                            Continue Learning <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center gap-6 bg-slate-950/40 rounded-[3rem] border border-dashed border-slate-800">
                            <div className="p-6 bg-slate-900 rounded-full border border-slate-800 shadow-2xl">
                                <Search className="h-10 w-10 text-slate-600" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-black italic uppercase tracking-tighter text-slate-500 text-lg">No Active Syncs Detected</p>
                                <p className="text-slate-600 font-medium max-w-xs mx-auto">Neural pathways are clear. Initialize a catalog search to begin synchronization.</p>
                            </div>
                            <Button asChild className="bg-orange-600 hover:bg-orange-500 text-white px-8 h-12 rounded-2xl font-black italic uppercase tracking-tighter shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                                <Link href="/courses">Probe Courses</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Referral Card */}
            {referralLink && (
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-600/10 via-slate-900/60 to-slate-950 border border-orange-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-orange-400 mb-2">
                                <Gift className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Refer & Earn</span>
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
                                Know someone who'd love the Bootcamp?
                            </h3>
                            <p className="text-sm text-slate-400 font-medium max-w-md">
                                Share your unique referral link. Every parent who registers through your link counts as your referral!
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                            <div className="flex items-center gap-2 bg-slate-950 border border-zinc-800 rounded-2xl p-2 min-w-0 md:min-w-[320px]">
                                <span className="text-[10px] font-mono text-zinc-500 truncate flex-1 pl-2 select-all">
                                    {referralLink}
                                </span>
                                <Button
                                    size="sm"
                                    onClick={copyReferralLink}
                                    className="shrink-0 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shadow-lg shadow-orange-500/20 px-4"
                                >
                                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                                </Button>
                            </div>
                            <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Check out the CODE-X AI Holiday Bootcamp for kids – my referral link: ${referralLink}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl px-4 py-2.5 transition-colors"
                            >
                                <Share2 className="h-3.5 w-3.5" /> Share on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
