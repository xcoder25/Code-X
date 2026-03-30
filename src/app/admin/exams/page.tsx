'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteExamAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileQuestion, PlusCircle, Search, MoreHorizontal, Edit,
  Trash2, Timer, BookOpen, ListChecks, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exam {
  id: string;
  title: string;
  courseTitle: string;
  duration: number; // seconds
  createdAt?: { seconds: number };
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setExams(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Exam));
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = useMemo(() =>
    exams.filter(e =>
      !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.courseTitle?.toLowerCase().includes(search.toLowerCase())
    ), [exams, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExamAction(deleteTarget.id);
      toast({ title: 'Exam Deleted', description: `"${deleteTarget.title}" and all its questions removed.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
  };

  // Color palette for cards
  const CARD_COLORS = [
    'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    'from-teal-500/10 to-teal-500/5 border-teal-500/20',
    'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    'from-rose-500/10 to-rose-500/5 border-rose-500/20',
  ];

  return (
    <>
      <div className="flex-1 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <FileQuestion className="h-8 w-8 text-primary" /> Exams
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage MCQ assessments for all courses.</p>
          </div>
          <Button asChild className="gap-2 shrink-0">
            <Link href="/admin/exams/new">
              <PlusCircle className="h-4 w-4" /> New Exam
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-blue-500/5 border-blue-500/20">
            <FileQuestion className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-lg font-extrabold leading-none">{loading ? '—' : exams.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Exams</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border bg-purple-500/5 border-purple-500/20">
            <Timer className="h-4 w-4 text-purple-400" />
            <div>
              <p className="text-lg font-extrabold leading-none">
                {loading ? '—' : exams.length > 0 ? formatDuration(Math.round(exams.reduce((a, e) => a + e.duration, 0) / exams.length)) : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search exams…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground">
              <FileQuestion className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No exams found</p>
              <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
                <Link href="/admin/exams/new"><PlusCircle className="h-4 w-4" />Create one</Link>
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((exam, i) => (
                <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn(
                    'group relative flex flex-col p-5 rounded-2xl border bg-gradient-to-br hover:shadow-md transition-all',
                    CARD_COLORS[i % CARD_COLORS.length]
                  )}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-xl bg-background/60 border border-border/60 flex items-center justify-center shrink-0 backdrop-blur-sm">
                      <FileQuestion className="h-5 w-5 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/exams/${exam.id}/edit`} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(exam)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Content */}
                  <div className="mt-3 flex-1">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2">{exam.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{exam.courseTitle}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Timer className="h-3.5 w-3.5" /> {formatDuration(exam.duration)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground ml-auto">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      {exam.createdAt ? new Date(exam.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'New'}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs bg-background/50">
                      <Link href={`/admin/exams/${exam.id}/edit`}><Edit className="h-3.5 w-3.5 mr-1.5" />Edit</Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <strong>"{deleteTarget?.title}"</strong> and all its questions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-500">
              {deleting ? 'Deleting…' : 'Delete Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
