
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Activity,
  Copy,
  Share2,
  Gift,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherAuth } from '@/app/teacher-auth-provider';
import { useToast } from '@/hooks/use-toast';

interface Course {
    id: string;
    title: string;
    enrollments: number;
}

export default function TeacherDashboardPage() {
    const { user } = useTeacherAuth();
    const { toast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [referralLink, setReferralLink] = useState('');

    const totalEnrollments = courses.reduce((acc, course) => acc + course.enrollments, 0);

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
            description: 'Share it so people can register for the bootcamp through you.',
        });
    }, [referralLink, toast]);

    useEffect(() => {
        if (!user) return;

        const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
        const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
            const coursesData = snapshot.docs.map(doc => doc.data() as Course);
            setCourses(coursesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching teacher courses:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalEnrollments}</div>}
                    <p className="text-xs text-muted-foreground">Across all your courses</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{courses.length}</div>}
                    <p className="text-xs text-muted-foreground">Courses you are teaching</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Assignments to be graded</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Student Activity</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+50</div>
                    <p className="text-xs text-muted-foreground">New submissions this week</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
                <CardDescription>
                    Here's a quick overview of your teaching responsibilities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>You can manage your courses, grade assignments, and communicate with admins from the sidebar.</p>
            </CardContent>
        </Card>

        {/* Referral Card */}
        {referralLink && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-orange-500/5 blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                            <Gift className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Refer & Earn</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Know someone who should join the Bootcamp?</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Share your unique referral link. Anyone who registers through it will be credited to you.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                        <div className="flex items-center gap-2 bg-muted border border-border rounded-xl p-2 min-w-0 md:min-w-[300px]">
                            <span className="text-[10px] font-mono text-muted-foreground truncate flex-1 pl-2 select-all">
                                {referralLink}
                            </span>
                            <Button
                                size="sm"
                                onClick={copyReferralLink}
                                className="shrink-0 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3"
                            >
                                <Copy className="h-3 w-3 mr-1" /> Copy
                            </Button>
                        </div>
                        <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Check out the CODE-X AI Holiday Bootcamp for kids – register using my link: ${referralLink}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl px-4 py-2 transition-colors"
                        >
                            <Share2 className="h-3.5 w-3.5" /> Share on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
