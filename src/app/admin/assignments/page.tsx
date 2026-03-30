'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteAssignmentAction } from '@/app/actions';
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
  Clipboard, PlusCircle, Search, MoreHorizontal,
  Edit, Trash2, Calendar, BookOpen, AlertTriangle, Clock, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Assignment {
  id: string;
  title: string;
  courseTitle: string;
  description?: string;
  dueDate: Timestamp;
}

function getDueStatus(dueDate: Timestamp) {
  const due = dueDate.seconds * 1000;
  const now = Date.now();
  const diff = due - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: 'Overdue', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <AlertTriangle className="h-3 w-3" />, urgent: true };
  if (days <= 3) return { label: `Due in ${days}d`, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: <Clock className="h-3 w-3" />, urgent: true };
  return { label: `Due in ${days}d`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="h-3 w-3" />, urgent: false };
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'assignments'), orderBy('dueDate', 'asc'));
    return onSnapshot(q, snap => {
      setAssignments(snap.docs.map(d => ({ ...d.data(), id: d.id }) as Assignment));
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = useMemo(() =>
    assignments.filter(a =>
      !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.courseTitle?.toLowerCase().includes(search.toLowerCase())
    ), [assignments, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAssignmentAction(deleteTarget.id);
      toast({ title: 'Assignment Deleted', description: `"${deleteTarget.title}" removed.` });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="flex-1 p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Clipboard className="h-8 w-8 text-primary" /> Assignments
            </h1>
            <p className="text-muted-foreground mt-1">Manage tasks and deadlines for all courses.</p>
          </div>
          <Button asChild className="gap-2 shrink-0">
            <Link href="/admin/assignments/new">
              <PlusCircle className="h-4 w-4" /> New Assignment
            </Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: assignments.length, color: 'bg-blue-500/5 border-blue-500/20', icon: <Clipboard className="h-4 w-4 text-blue-400" /> },
            { label: 'Overdue', value: assignments.filter(a => a.dueDate.seconds * 1000 < Date.now()).length, color: 'bg-red-500/5 border-red-500/20', icon: <AlertTriangle className="h-4 w-4 text-red-400" /> },
            { label: 'Upcoming', value: assignments.filter(a => a.dueDate.seconds * 1000 >= Date.now()).length, color: 'bg-emerald-500/5 border-emerald-500/20', icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
          ].map(s => (
            <div key={s.label} className={cn('flex items-center gap-3 p-4 rounded-xl border', s.color)}>
              <div className={cn('p-2 rounded-lg border', s.color)}>{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold">{loading ? '—' : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assignments…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed rounded-2xl text-muted-foreground">
              <Clipboard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No assignments found</p>
              <Button asChild variant="outline" size="sm" className="mt-4 gap-2">
                <Link href="/admin/assignments/new"><PlusCircle className="h-4 w-4" />Create one</Link>
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((a, i) => {
                const due = getDueStatus(a.dueDate);
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={cn('group relative flex flex-col p-5 rounded-2xl border bg-card hover:shadow-md transition-all', due.urgent && 'border-l-4 border-l-orange-500')}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Clipboard className="h-5 w-5 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/assignments/${a.id}/edit`} className="flex items-center gap-2">
                              <Edit className="h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(a)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Content */}
                    <div className="mt-3 flex-1">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2">{a.title}</h3>
                      {a.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{a.courseTitle}</span>
                      </div>
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0', due.color)}>
                        {due.icon} {due.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {new Date(a.dueDate.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>"{deleteTarget?.title}"</strong>. Student submissions will remain but become orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-500">
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
