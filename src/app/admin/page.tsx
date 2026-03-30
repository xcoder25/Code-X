'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  collection, collectionGroup, onSnapshot, query,
  orderBy, limit, where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import {
  Users, BookOpen, FileQuestion, ClipboardCheck,
  TrendingUp, Crown, Clock, Sparkles, ArrowUpRight,
  CheckCircle2, Flame, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingLink from '@/components/ui/loading-link';

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  plan?: string;
  createdAt: { seconds: number };
  streak?: number;
}

interface Submission {
  id: string;
  userId: string;
  userName: string;
  assignmentTitle: string;
  courseTitle: string;
  status: 'Pending' | 'Graded';
  submittedAt: { seconds: number };
}

function LiveBadge() {
  return (
    <Badge variant="outline" className="gap-1.5 text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Live
    </Badge>
  );
}

function StatCard({
  label, value, sub, icon, color, href, loading
}: {
  label: string; value: number | string; sub: string;
  icon: React.ReactNode; color: string; href?: string; loading?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn('border hover:shadow-md transition-shadow', color)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className={cn('p-2.5 rounded-xl border', color)}>{icon}</div>
            {href && (
              <LoadingLink href={href} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                View all <ArrowUpRight className="h-3 w-3" />
              </LoadingLink>
            )}
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-9 w-20 mb-1" />
            ) : (
              <p className="text-3xl font-extrabold tracking-tight">{value}</p>
            )}
            <p className="text-sm font-semibold mt-0.5">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50)), snap => {
      setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id }) as User));
      setLoading(false);
    }));
    unsubs.push(onSnapshot(query(collection(db, 'courses'), limit(20)), snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));
    unsubs.push(onSnapshot(query(collection(db, 'exams'), limit(20)), snap => {
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));
    unsubs.push(onSnapshot(query(collectionGroup(db, 'submissions'), limit(50)), snap => {
      setSubmissions(snap.docs.map(d => ({
        ...d.data(), id: d.id, userId: d.ref.parent.parent!.id
      }) as Submission));
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  const stats = useMemo(() => {
    const pending = submissions.filter(s => s.status === 'Pending').length;
    const graded = submissions.filter(s => s.status === 'Graded').length;
    const paid = users.filter(u => u.plan === 'Pro' || u.plan === 'Premium').length;
    const thisWeek = users.filter(u => {
      if (!u.createdAt?.seconds) return false;
      return Date.now() - u.createdAt.seconds * 1000 < 7 * 24 * 60 * 60 * 1000;
    }).length;
    return { pending, graded, paid, thisWeek };
  }, [users, submissions]);

  // Signups by day (last 7 days)
  const signupChart = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }
    users.forEach(u => {
      if (!u.createdAt?.seconds) return;
      const ts = u.createdAt.seconds * 1000;
      if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return;
      const label = new Date(ts).toLocaleDateString('en-US', { weekday: 'short' });
      if (days[label] !== undefined) days[label]++;
    });
    return Object.entries(days).map(([day, count]) => ({ day, count }));
  }, [users]);

  const pendingSubs = submissions.filter(s => s.status === 'Pending').slice(0, 5);
  const recentUsers = users.slice(0, 5);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Complete platform overview — live data from all systems.</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge />
          <Button asChild size="sm" className="gap-2">
            <LoadingLink href="/admin/agent">
              <Sparkles className="h-4 w-4 text-purple-300" /> Open NEXUS Agent
            </LoadingLink>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={loading ? '—' : users.length} sub={`+${stats.thisWeek} this week`}
          icon={<Users className="h-5 w-5 text-blue-400" />} color="bg-blue-500/5 border-blue-500/20"
          href="/admin/users" loading={loading} />
        <StatCard label="Courses" value={loading ? '—' : courses.length} sub="Active on platform"
          icon={<BookOpen className="h-5 w-5 text-purple-400" />} color="bg-purple-500/5 border-purple-500/20"
          href="/admin/courses" loading={loading} />
        <StatCard label="Pending Reviews" value={loading ? '—' : stats.pending} sub="Need grading now"
          icon={<Clock className="h-5 w-5 text-orange-400" />}
          color={stats.pending > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-muted/30 border-border'}
          href="/admin/submissions" loading={loading} />
        <StatCard label="Paid Users" value={loading ? '—' : stats.paid} sub="Pro & Premium plans"
          icon={<Crown className="h-5 w-5 text-amber-400" />} color="bg-amber-500/5 border-amber-500/20"
          href="/admin/users" loading={loading} />
      </div>

      {/* Charts + Pending Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Signups Chart */}
        <Card className="lg:col-span-3 border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">New Signups</CardTitle>
                <CardDescription>Student registrations over the last 7 days</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={signupChart} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {signupChart.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === signupChart.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Grading Queue */}
        <Card className="lg:col-span-2 border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Grading Queue
                  {stats.pending > 0 && (
                    <span className="h-5 w-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {stats.pending}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Submissions awaiting review</CardDescription>
              </div>
              <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
            ) : pendingSubs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-0.5">No pending submissions.</p>
              </div>
            ) : (
              pendingSubs.map(sub => (
                <div key={`${sub.userId}-${sub.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:border-orange-500/20 transition-colors">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {sub.userName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{sub.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{sub.assignmentTitle}</p>
                  </div>
                  <LoadingLink href="/admin/submissions">
                    <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">Grade</Button>
                  </LoadingLink>
                </div>
              ))
            )}
            {stats.pending > 5 && (
              <LoadingLink href="/admin/submissions">
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs">
                  View all {stats.pending} pending →
                </Button>
              </LoadingLink>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Students + Course Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Signups</CardTitle>
                <CardDescription>Latest students who joined</CardDescription>
              </div>
              <LoadingLink href="/admin/users" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                View all <ArrowUpRight className="h-3 w-3" />
              </LoadingLink>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-44" /></div>
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              ))
            ) : recentUsers.map(user => {
              const plan = user.plan || 'Free';
              return (
                <div key={user.uid} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                      <AvatarFallback className="text-sm font-bold">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {user.streak ? (
                      <span className="flex items-center gap-1 text-xs text-orange-400"><Flame className="h-3 w-3" />{user.streak}</span>
                    ) : null}
                    <Badge variant={plan === 'Free' ? 'secondary' : 'default'} className="text-[10px]">{plan}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Course Snapshot */}
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Course Overview</CardTitle>
                <CardDescription>All active courses on the platform</CardDescription>
              </div>
              <LoadingLink href="/admin/courses" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                Manage <ArrowUpRight className="h-3 w-3" />
              </LoadingLink>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No courses yet. <LoadingLink href="/admin/courses/new" className="text-primary underline">Create one</LoadingLink></p>
              </div>
            ) : courses.slice(0, 5).map((course, i) => (
              <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-extrabold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.enrollments || 0} enrolled · {course.modules?.length || 0} modules
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{course.status || 'Draft'}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
