'use client';

import { useState, useEffect, useMemo } from 'react';
import { collectionGroup, onSnapshot, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { sendMessageAction } from '@/app/actions';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  ClipboardCheck, Search, ExternalLink, CheckCircle2, Clock,
  Filter, BarChart3, Loader2, Award, GraduationCap, BookOpen, ChevronDown, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Submission {
  id: string;
  userId: string;
  userName: string;
  assignmentTitle: string;
  courseTitle: string;
  colabLink: string;
  status: 'Pending' | 'Graded';
  grade: string | null;
  feedback?: string;
  submittedAt: Timestamp;
  gradedAt?: Timestamp;
}

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

const GRADE_COLOR: Record<string, string> = {
  'A+': 'text-emerald-400', 'A': 'text-emerald-400', 'A-': 'text-emerald-400',
  'B+': 'text-blue-400',    'B': 'text-blue-400',    'B-': 'text-blue-400',
  'C+': 'text-yellow-400',  'C': 'text-yellow-400',  'C-': 'text-yellow-400',
  'D':  'text-orange-400',  'F': 'text-red-400',
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Graded'>('all');
  const [grading, setGrading] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('B+');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Real-time collectionGroup listener
  useEffect(() => {
    const q = query(collectionGroup(db, 'submissions'));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          ...raw,
          id: d.id,
          userId: d.ref.parent.parent!.id,
        } as Submission;
      });
      data.sort((a, b) => (b.submittedAt?.seconds ?? 0) - (a.submittedAt?.seconds ?? 0));
      setSubmissions(data);
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'Pending').length,
    graded: submissions.filter(s => s.status === 'Graded').length,
  }), [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      const matchSearch = !search ||
        s.userName?.toLowerCase().includes(search.toLowerCase()) ||
        s.assignmentTitle?.toLowerCase().includes(search.toLowerCase()) ||
        s.courseTitle?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [submissions, search, statusFilter]);

  const openGradeDialog = (sub: Submission) => {
    setGrading(sub);
    setGrade(sub.grade || 'B+');
    setFeedback(sub.feedback || '');
  };

  const submitGrade = async () => {
    if (!grading || !grade) return;
    setSubmitting(true);
    try {
      const subRef = doc(db, 'users', grading.userId, 'submissions', grading.id);
      await updateDoc(subRef, {
        grade,
        feedback,
        status: 'Graded',
        gradedAt: serverTimestamp(),
      });
      // Push real-time notification to student
      await sendMessageAction({
        title: `Submission Graded: ${grading.assignmentTitle}`,
        body: `Hi ${grading.userName.split(' ')[0]}! Your submission received ${grade}.${feedback ? ` Feedback: ${feedback}` : ''}`,
        targetType: 'direct',
        userId: grading.userId,
      });
      toast({ title: '✅ Grade Submitted', description: `${grading.userName} received ${grade}. Notification sent.` });
      setGrading(null);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Submissions
          </h1>
          <p className="text-muted-foreground mt-1">Real-time grading queue for all student assignments.</p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-emerald-500 border-emerald-500/30 bg-emerald-500/5 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Updates
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: <BarChart3 className="h-5 w-5 text-blue-400" />, color: 'bg-blue-500/5 border-blue-500/20' },
          { label: 'Pending', value: stats.pending, icon: <Clock className="h-5 w-5 text-orange-400" />, color: stats.pending > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-muted/30 border-border' },
          { label: 'Graded', value: stats.graded, icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />, color: 'bg-emerald-500/5 border-emerald-500/20' },
        ].map(s => (
          <Card key={s.label} className={cn('border', s.color)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('p-2 rounded-lg border', s.color)}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold">{loading ? '—' : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student, assignment, or course…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', 'Pending', 'Graded'] as const).map(f => (
            <Button key={f} size="sm" variant={statusFilter === f ? 'default' : 'outline'}
              onClick={() => setStatusFilter(f)}
              className={cn(statusFilter === f ? '' : 'text-muted-foreground')}
            >
              {f === 'all' ? 'All' : f}
              {f === 'Pending' && stats.pending > 0 && (
                <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_2fr_1fr_1fr_auto] gap-4 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Student</span><span>Assignment</span><span>Course</span><span>Submitted</span><span>Status</span><span></span>
        </div>

        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-56" /></div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground">
            <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{statusFilter === 'Pending' ? '🎉 Queue Clear — All submissions are graded!' : 'No submissions found.'}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((sub, i) => {
              const isPending = sub.status === 'Pending';
              const date = sub.submittedAt?.seconds
                ? new Date(sub.submittedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';
              return (
                <motion.div key={`${sub.userId}-${sub.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                  className={cn(
                    'grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_1fr_1fr_auto] gap-4 items-center p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all',
                    isPending && 'border-l-4 border-l-orange-500'
                  )}
                >
                  {/* Student */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0 border border-border">
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {sub.userName?.charAt(0)?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{sub.userName}</p>
                      <p className="text-xs text-muted-foreground md:hidden truncate">{sub.assignmentTitle}</p>
                    </div>
                  </div>

                  {/* Assignment */}
                  <div className="hidden md:flex items-center gap-2 min-w-0">
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm truncate">{sub.assignmentTitle}</p>
                  </div>

                  {/* Course */}
                  <p className="hidden md:block text-sm text-muted-foreground truncate">{sub.courseTitle}</p>

                  {/* Date */}
                  <p className="hidden md:block text-xs text-muted-foreground">{date}</p>

                  {/* Status + Grade */}
                  <div className="hidden md:flex items-center gap-2">
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className={cn('font-extrabold', GRADE_COLOR[sub.grade || ''])}>{sub.grade}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    {sub.colabLink && (
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <a href={sub.colabLink} target="_blank" rel="noopener noreferrer" title="View Colab">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm"
                      variant={isPending ? 'default' : 'outline'}
                      className={cn('h-8 text-xs', isPending ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
                      onClick={() => openGradeDialog(sub)}
                    >
                      {isPending ? <><Award className="h-3.5 w-3.5 mr-1.5" />Grade</> : <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Re-grade</>}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {!loading && <p className="text-xs text-muted-foreground text-center">Showing {filtered.length} of {submissions.length} submissions</p>}

      {/* Grade Dialog */}
      <Dialog open={!!grading} onOpenChange={open => !open && setGrading(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Grade Submission
            </DialogTitle>
            <DialogDescription>
              Grading <strong>{grading?.userName}</strong>'s submission for <strong>"{grading?.assignmentTitle}"</strong>.
              A notification will be sent to the student automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Colab Link */}
            {grading?.colabLink && (
              <a href={grading.colabLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline p-3 rounded-lg border bg-primary/5 transition-colors hover:bg-primary/10"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate">Open Student's Colab Notebook</span>
              </a>
            )}

            {/* Grade Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Grade</label>
              <div className="grid grid-cols-4 gap-2">
                {GRADE_OPTIONS.map(g => (
                  <button key={g} onClick={() => setGrade(g)}
                    className={cn(
                      'py-2 rounded-lg border text-sm font-bold transition-all',
                      grade === g
                        ? cn('border-primary bg-primary text-primary-foreground shadow-lg scale-105', GRADE_COLOR[g] && 'text-primary-foreground')
                        : cn('bg-muted/30 hover:bg-muted', GRADE_COLOR[g])
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Feedback (optional)</label>
              <Textarea
                placeholder="Leave personalized feedback for the student..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGrading(null)}>Cancel</Button>
            <Button onClick={submitGrade} disabled={submitting || !grade} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Submit Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
