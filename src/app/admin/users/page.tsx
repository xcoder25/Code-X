'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, getDocs, collectionGroup, where, limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Users, Search, MoreHorizontal, UserCheck, UserX, Trash2,
  Bell, BookOpen, ClipboardCheck, TrendingUp, Shield, Crown,
  Mail, Calendar, Flame, Target, ChevronRight, RefreshCw,
  Filter, Download, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sendMessageAction } from '@/app/actions';
import { cn } from '@/lib/utils';

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: { seconds: number };
  plan?: string;
  streak?: number;
  goal?: string;
  status?: 'Active' | 'Suspended';
  enrollments?: number;
  submissions?: number;
}

interface UserDetail extends User {
  enrollments: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
}

const PLAN_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Free:    { label: 'Free',    color: 'bg-slate-500/20 text-slate-300 border-slate-500/20',  icon: <Shield className="h-3 w-3" /> },
  Pro:     { label: 'Pro',     color: 'bg-blue-500/20 text-blue-300 border-blue-500/20',     icon: <TrendingUp className="h-3 w-3" /> },
  Premium: { label: 'Premium', color: 'bg-amber-500/20 text-amber-300 border-amber-500/20',  icon: <Crown className="h-3 w-3" /> },
};

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <Card className={cn('border', color)}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn('p-2.5 rounded-xl border', color)}>{icon}</div>
        <div>
          <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id }) as User));
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Derived stats
  const stats = useMemo(() => ({
    total: users.length,
    pro: users.filter(u => u.plan === 'Pro' || u.plan === 'Premium').length,
    active: users.filter(u => u.status !== 'Suspended').length,
    newThisWeek: users.filter(u => {
      if (!u.createdAt?.seconds) return false;
      const diff = Date.now() - u.createdAt.seconds * 1000;
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length,
  }), [users]);

  // Filtered list
  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !search ||
        u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchPlan = planFilter === 'all' || (u.plan || 'Free') === planFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'Suspended' ? u.status === 'Suspended' : u.status !== 'Suspended');
      return matchSearch && matchPlan && matchStatus;
    });
  }, [users, search, planFilter, statusFilter]);

  // Load per-user detail
  const openUserDetail = async (user: User) => {
    setSheetOpen(true);
    setDetailLoading(true);
    try {
      const enrollSnap = await getDocs(collection(db, 'users', user.uid, 'enrollments'));
      const subSnap = await getDocs(collection(db, 'users', user.uid, 'submissions'));
      const pendingCount = subSnap.docs.filter(d => d.data().status === 'Pending').length;
      const gradedCount = subSnap.docs.filter(d => d.data().status === 'Graded').length;
      setSelectedUser({
        ...user,
        enrollments: enrollSnap.size,
        pendingSubmissions: pendingCount,
        gradedSubmissions: gradedCount,
      });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load user details.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async (userId: string, currentStatus?: string) => {
    setActionLoading(userId + '_suspend');
    try {
      const newStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      toast({ title: `User ${newStatus === 'Suspended' ? 'Suspended' : 'Reinstated'}`, description: `Status updated to ${newStatus}.` });
      if (selectedUser?.uid === userId) setSelectedUser(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch { toast({ variant: 'destructive', title: 'Error', description: 'Action failed.' }); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    setActionLoading(userId + '_delete');
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: 'User Deleted', description: `${name} has been removed.` });
      if (selectedUser?.uid === userId) setSheetOpen(false);
    } catch { toast({ variant: 'destructive', title: 'Error', description: 'Could not delete user.' }); }
    finally { setActionLoading(null); }
  };

  const handleNotify = async (userId: string, name: string) => {
    setActionLoading(userId + '_notify');
    try {
      await sendMessageAction({
        title: 'Message from Code-X Admin',
        body: `Hi ${name.split(' ')[0]}! Just checking in. Keep up your learning streak — new content is waiting for you on the platform!`,
        targetType: 'direct',
        userId,
      });
      toast({ title: 'Message Sent', description: `Notification delivered to ${name}.` });
    } catch { toast({ variant: 'destructive', title: 'Error', description: 'Could not send notification.' }); }
    finally { setActionLoading(null); }
  };

  const handleUpgradePlan = async (userId: string, newPlan: string) => {
    setActionLoading(userId + '_plan');
    try {
      await updateDoc(doc(db, 'users', userId), { plan: newPlan });
      toast({ title: 'Plan Updated', description: `User plan changed to ${newPlan}.` });
      if (selectedUser?.uid === userId) setSelectedUser(prev => prev ? { ...prev, plan: newPlan } : prev);
    } catch { toast({ variant: 'destructive', title: 'Error', description: 'Failed to update plan.' }); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Real-time view of all registered students and their progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={loading ? '—' : stats.total} icon={<Users className="h-5 w-5 text-blue-400" />} color="bg-blue-500/5 border-blue-500/20" />
        <StatCard label="Paid Users" value={loading ? '—' : stats.pro} icon={<Crown className="h-5 w-5 text-amber-400" />} color="bg-amber-500/5 border-amber-500/20" />
        <StatCard label="Active Users" value={loading ? '—' : stats.active} icon={<UserCheck className="h-5 w-5 text-emerald-400" />} color="bg-emerald-500/5 border-emerald-500/20" />
        <StatCard label="New This Week" value={loading ? '—' : stats.newThisWeek} icon={<TrendingUp className="h-5 w-5 text-purple-400" />} color="bg-purple-500/5 border-purple-500/20" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Pro">Pro</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Grid */}
      <div className="grid gap-3">
        {/* Column Headers */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Student</span>
          <span>Email</span>
          <span>Joined</span>
          <span>Plan</span>
          <span>Status</span>
          <span></span>
        </div>

        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((user, index) => {
              const plan = user.plan || 'Free';
              const planMeta = PLAN_META[plan] || PLAN_META.Free;
              const isSuspended = user.status === 'Suspended';
              const joinDate = user.createdAt?.seconds
                ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Unknown';

              return (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'group grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 items-center p-4 rounded-xl border bg-card hover:bg-muted/40 transition-all cursor-pointer',
                    isSuspended && 'opacity-60'
                  )}
                  onClick={() => openUserDetail(user)}
                >
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback className="text-sm font-bold">
                          {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {!isSuspended && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{user.displayName || 'Unnamed User'}</p>
                      {user.streak ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" /> {user.streak} day streak
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground md:hidden truncate">{user.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <p className="hidden md:block text-sm text-muted-foreground truncate">{user.email}</p>

                  {/* Joined */}
                  <p className="hidden md:block text-sm text-muted-foreground">{joinDate}</p>

                  {/* Plan */}
                  <div className="hidden md:flex">
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', planMeta.color)}>
                      {planMeta.icon} {plan}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="hidden md:flex">
                    {isSuspended ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        <UserX className="h-3 w-3" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <UserCheck className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openUserDetail(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Actions for {user.displayName?.split(' ')[0]}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openUserDetail(user)}>
                          <Eye className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleNotify(user.uid, user.displayName)}>
                          <Bell className="mr-2 h-4 w-4" /> Send Notification
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpgradePlan(user.uid, 'Pro')}>
                          <TrendingUp className="mr-2 h-4 w-4 text-blue-400" /> Upgrade to Pro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpgradePlan(user.uid, 'Premium')}>
                          <Crown className="mr-2 h-4 w-4 text-amber-400" /> Upgrade to Premium
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={isSuspended ? 'text-emerald-600' : 'text-orange-600'}
                          onClick={() => handleSuspend(user.uid, user.status)}
                        >
                          {isSuspended ? <><UserCheck className="mr-2 h-4 w-4" /> Reinstate User</> : <><UserX className="mr-2 h-4 w-4" /> Suspend User</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.uid, user.displayName)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Showing count */}
      {!loading && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* User Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Student Profile</SheetTitle>
            <SheetDescription>Full details, activity, and admin controls.</SheetDescription>
          </SheetHeader>

          {detailLoading || !selectedUser ? (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
              </div>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Avatar & Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={selectedUser.photoURL} />
                  <AvatarFallback className="text-xl font-bold">
                    {selectedUser.displayName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{selectedUser.displayName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border', PLAN_META[selectedUser.plan || 'Free'].color)}>
                      {PLAN_META[selectedUser.plan || 'Free'].icon}
                      {selectedUser.plan || 'Free'}
                    </span>
                    {selectedUser.status === 'Suspended' && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Suspended</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Courses', value: selectedUser.enrollments, icon: <BookOpen className="h-4 w-4 text-blue-400" />, color: 'bg-blue-500/10' },
                  { label: 'Graded', value: selectedUser.gradedSubmissions, icon: <ClipboardCheck className="h-4 w-4 text-emerald-400" />, color: 'bg-emerald-500/10' },
                  { label: 'Pending', value: selectedUser.pendingSubmissions, icon: <RefreshCw className="h-4 w-4 text-orange-400" />, color: 'bg-orange-500/10' },
                ].map(stat => (
                  <div key={stat.label} className={cn('rounded-xl p-3 flex flex-col items-center gap-1.5 border', stat.color)}>
                    {stat.icon}
                    <p className="text-xl font-extrabold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
                {[
                  { icon: <Mail className="h-4 w-4 text-muted-foreground" />, label: 'Email', value: selectedUser.email },
                  { icon: <Calendar className="h-4 w-4 text-muted-foreground" />, label: 'Joined', value: selectedUser.createdAt?.seconds ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown' },
                  { icon: <Flame className="h-4 w-4 text-orange-400" />, label: 'Streak', value: selectedUser.streak ? `${selectedUser.streak} days` : 'No streak' },
                  { icon: <Target className="h-4 w-4 text-primary" />, label: 'Career Goal', value: selectedUser.goal || 'Not set' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    {row.icon}
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{row.label}</span>
                    <span className="text-sm font-medium truncate">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Admin Actions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin Controls</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-2 justify-start" onClick={() => handleNotify(selectedUser.uid, selectedUser.displayName)}
                    disabled={actionLoading === selectedUser.uid + '_notify'}>
                    <Bell className="h-4 w-4 text-orange-400" /> Notify
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 justify-start" onClick={() => handleUpgradePlan(selectedUser.uid, selectedUser.plan === 'Premium' ? 'Free' : 'Premium')}
                    disabled={actionLoading === selectedUser.uid + '_plan'}>
                    <Crown className="h-4 w-4 text-amber-400" />
                    {selectedUser.plan === 'Premium' ? 'Downgrade' : 'Upgrade'}
                  </Button>
                  <Button variant="outline" size="sm"
                    className={cn('gap-2 justify-start', selectedUser.status === 'Suspended' ? 'text-emerald-600' : 'text-orange-600')}
                    onClick={() => handleSuspend(selectedUser.uid, selectedUser.status)}
                    disabled={actionLoading === selectedUser.uid + '_suspend'}>
                    {selectedUser.status === 'Suspended' ? <><UserCheck className="h-4 w-4" /> Reinstate</> : <><UserX className="h-4 w-4" /> Suspend</>}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 justify-start text-red-600 hover:text-red-500"
                    onClick={() => handleDelete(selectedUser.uid, selectedUser.displayName)}
                    disabled={actionLoading === selectedUser.uid + '_delete'}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
