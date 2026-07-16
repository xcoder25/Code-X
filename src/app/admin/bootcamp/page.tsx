'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  GraduationCap, Search, Calendar, Phone, Mail,
  BookOpen, Coins, Clock4, Filter, Download, Eye, School,
  Sparkles, Layers, Users2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface BootcampRegistration {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: number;
  schoolName: string;
  numberOfChildren: number;
  preferredSession: 'morning' | 'afternoon';
  howDidYouHear?: string;
  referredBy?: string;
  registrationId: string;
  amountPaid: number;
  paymentReference: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  createdAt: { seconds: number } | null;
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <Card className={cn('border bg-card text-card-foreground shadow-sm', color)}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn('p-2.5 rounded-xl border shrink-0', color)}>{icon}</div>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold tracking-tight truncate">{value}</p>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminBootcampPage() {
  const [registrations, setRegistrations] = useState<BootcampRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState<BootcampRegistration | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  const [referrerProfile, setReferrerProfile] = useState<{
    type: 'parent' | 'student' | 'teacher' | 'custom';
    name: string;
    email?: string;
    phone?: string;
  } | null>(null);
  const [referrerLoading, setReferrerLoading] = useState(false);

  useEffect(() => {
    if (!selectedReg || !selectedReg.referredBy) {
      setReferrerProfile(null);
      return;
    }

    const refCode = selectedReg.referredBy;

    // 1. Is it a Parent registration?
    const parentReferrer = registrations.find(r => r.registrationId === refCode);
    if (parentReferrer) {
      setReferrerProfile({
        type: 'parent',
        name: parentReferrer.parentName,
        email: parentReferrer.email,
        phone: parentReferrer.phone
      });
      return;
    }

    // 2. Is it a Student UID or Teacher UID?
    const fetchUserReferrer = async () => {
      setReferrerLoading(true);
      try {
        // Try user collection first
        const userDoc = await getDoc(doc(db, 'users', refCode));
        if (userDoc.exists()) {
          const u = userDoc.data();
          setReferrerProfile({
            type: 'student',
            name: u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Student Partner',
            email: u.email,
            phone: u.phone || 'N/A'
          });
          return;
        }

        // Try teacher collection
        const teacherDoc = await getDoc(doc(db, 'teachers', refCode));
        if (teacherDoc.exists()) {
          const t = teacherDoc.data();
          setReferrerProfile({
            type: 'teacher',
            name: t.displayName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher Partner',
            email: t.email,
            phone: t.phone || 'N/A'
          });
          return;
        }

        // It is a custom/affiliate promo code
        setReferrerProfile({
          type: 'custom',
          name: refCode
        });
      } catch (err) {
        console.error("Error looking up referrer:", err);
        setReferrerProfile({
          type: 'custom',
          name: refCode
        });
      } finally {
        setReferrerLoading(false);
      }
    };

    fetchUserReferrer();
  }, [selectedReg, registrations]);

  // Listen to Firestore registrations in real time
  useEffect(() => {
    const q = query(
      collection(db, 'bootcamp_registrations'),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, snap => {
      setRegistrations(
        snap.docs.map(d => ({ ...d.data(), id: d.id }) as BootcampRegistration)
      );
      setLoading(false);
    }, err => {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Failed to retrieve registrations in real time.',
      });
      setLoading(false);
    });

    return () => unsub();
  }, [toast]);

  // Derive Statistics Metrics
  const stats = useMemo(() => {
    const totalRevenue = registrations.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
    const morningCount = registrations.filter(r => r.preferredSession === 'morning').length;
    const afternoonCount = registrations.filter(r => r.preferredSession === 'afternoon').length;
    
    // Age Cohort breakdown: Junior (5-11), Senior (12-17)
    const juniorCount = registrations.filter(r => r.childAge < 12).length;
    const seniorCount = registrations.filter(r => r.childAge >= 12).length;

    return {
      total: registrations.length,
      revenue: totalRevenue,
      morning: morningCount,
      afternoon: afternoonCount,
      junior: juniorCount,
      senior: seniorCount
    };
  }, [registrations]);

  // Search & Filter registrations logic
  const filtered = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch = !search ||
        r.parentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.childName?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.registrationId?.toLowerCase().includes(search.toLowerCase()) ||
        r.schoolName?.toLowerCase().includes(search.toLowerCase());
      
      const matchSession = sessionFilter === 'all' || r.preferredSession === sessionFilter;
      
      let matchAge = true;
      if (ageFilter === 'junior') matchAge = r.childAge < 12;
      if (ageFilter === 'senior') matchAge = r.childAge >= 12;

      return matchSearch && matchSession && matchAge;
    });
  }, [registrations, search, sessionFilter, ageFilter]);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast({
        title: 'Export Cancelled',
        description: 'There are no records matching current filters to export.',
      });
      return;
    }

    const headers = [
      'Registration ID',
      'Parent Name',
      'Email',
      'Phone',
      'Child Name',
      'Child Age',
      'Cohort',
      'Session',
      'School Name',
      'No. of Kids',
      'Amount Paid (NGN)',
      'Payment Reference',
      'Payment Date',
      'Referral Source',
      'Referred By Code',
      'Referred By Parent Name'
    ];

    const rows = filtered.map(r => {
      const cohort = r.childAge < 12 ? 'Junior' : 'Senior';
      const formattedSession = r.preferredSession === 'morning' ? 'Morning' : 'Afternoon';
      const createdDate = r.createdAt?.seconds 
        ? new Date(r.createdAt.seconds * 1000).toISOString()
        : r.paymentDate || '';

      const referrer = r.referredBy 
        ? filtered.find(x => x.registrationId === r.referredBy)
        : null;

      return [
        r.registrationId || '',
        `"${r.parentName?.replace(/"/g, '""') || ''}"`,
        r.email || '',
        `'${r.phone || ''}`, // Prepend apostrophe to prevent excel string truncate
        `"${r.childName?.replace(/"/g, '""') || ''}"`,
        r.childAge || '',
        cohort,
        formattedSession,
        `"${r.schoolName?.replace(/"/g, '""') || ''}"`,
        r.numberOfChildren || 1,
        r.amountPaid || 0,
        r.paymentReference || '',
        createdDate,
        `"${r.howDidYouHear?.replace(/"/g, '""') || ''}"`,
        r.referredBy || '',
        referrer ? `"${referrer.parentName?.replace(/"/g, '""') || ''}"` : ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bootcamp_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export Complete',
      description: `Successfully exported ${filtered.length} bootcamp registrations to CSV.`,
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 font-body">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bootcamp Registrants</h1>
          <p className="text-muted-foreground mt-1">Review student registrations, cohort sessions, and billing for the AI Holiday Bootcamp.</p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2 shrink-0 self-start sm:self-center">
          <Download className="h-4 w-4" /> Export CSV List
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Registrations" 
          value={loading ? '—' : stats.total} 
          icon={<GraduationCap className="h-5 w-5 text-blue-400" />} 
          color="bg-blue-500/5 border-blue-500/25" 
        />
        <StatCard 
          label="Gross Revenue" 
          value={loading ? '—' : `₦${stats.revenue.toLocaleString()}`} 
          icon={<Coins className="h-5 w-5 text-emerald-400" />} 
          color="bg-emerald-500/5 border-emerald-500/25" 
        />
        <StatCard 
          label="Cohorts (Jr / Sr)" 
          value={loading ? '—' : `${stats.junior} / ${stats.senior}`} 
          icon={<Layers className="h-5 w-5 text-purple-400" />} 
          color="bg-purple-500/5 border-purple-500/25" 
        />
        <StatCard 
          label="Sessions (AM / PM)" 
          value={loading ? '—' : `${stats.morning} / ${stats.afternoon}`} 
          icon={<Clock4 className="h-5 w-5 text-orange-400" />} 
          color="bg-orange-500/5 border-orange-500/25" 
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parent name, child name, email, school, pass ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Session Select Filter */}
            <div className="flex-1 md:flex-initial">
              <Select value={sessionFilter} onValueChange={setSessionFilter}>
                <SelectTrigger className="w-full md:w-[160px] rounded-xl">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="morning">Morning Batch</SelectItem>
                  <SelectItem value="afternoon">Afternoon Batch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Cohort Select Filter */}
            <div className="flex-1 md:flex-initial">
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-full md:w-[160px] rounded-xl">
                  <Layers className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Cohorts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  <SelectItem value="junior">Junior (5-11 yrs)</SelectItem>
                  <SelectItem value="senior">Senior (12-17 yrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations List Grid / Table */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6">Pass ID</th>
                <th className="p-4">Student & Age</th>
                <th className="p-4">Parent Details</th>
                <th className="p-4">Session Allocation</th>
                <th className="p-4">School</th>
                <th className="p-4">Paid</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="p-4 pl-6"><Skeleton className="h-5 w-24" /></td>
                    <td className="p-4">
                      <div className="space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3.5 w-16" /></div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3.5 w-36" /></div>
                    </td>
                    <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4 pr-6 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-25" />
                    <p className="font-semibold text-base">No registrations found</p>
                    <p className="text-xs mt-0.5">There are no records matching your current filter filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(reg => {
                  const cohortBadge = reg.childAge < 12 
                    ? 'Junior Builders' 
                    : 'Senior Builders';
                  
                  const dateString = reg.createdAt?.seconds 
                    ? new Date(reg.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'N/A';

                  return (
                    <motion.tr 
                      key={reg.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="border-b border-border/40 hover:bg-muted/10 transition-colors align-middle"
                    >
                      <td className="p-4 pl-6 font-mono text-xs font-bold text-orange-500 tracking-wider">
                        {reg.registrationId || 'CX-XXXX-XXXX'}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-foreground">{reg.childName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>Age: {reg.childAge}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                          <span>{cohortBadge}</span>
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-sm text-zinc-300">{reg.parentName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">{reg.email}</p>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider',
                            reg.preferredSession === 'morning' 
                              ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' 
                              : 'bg-orange-500/5 text-orange-400 border-orange-500/20'
                          )}
                        >
                          {reg.preferredSession === 'morning' ? 'Morning Batch' : 'Afternoon Batch'}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-zinc-300 truncate max-w-[140px]">
                        {reg.schoolName}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm">₦{(reg.amountPaid || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{dateString}</p>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Button 
                          onClick={() => {
                            setSelectedReg(reg);
                            setSheetOpen(true);
                          }} 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full p-0 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slideout Detail Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <GraduationCap className="h-5 w-5" />
              <span className="text-xs font-black tracking-widest uppercase">Student Profile</span>
            </div>
            <SheetTitle className="text-xl font-bold">
              {selectedReg?.childName}
            </SheetTitle>
            <SheetDescription className="font-mono text-xs text-orange-400 uppercase tracking-widest">
              Pass ID: {selectedReg?.registrationId}
            </SheetDescription>
          </SheetHeader>

          {selectedReg && (
            <div className="py-6 space-y-6 text-sm">
              {/* Enrollment Info Card Group */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" /> CLASS ASSIGNMENT
                </h4>
                
                <div className="space-y-3.5 bg-muted/20 border border-border/60 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Cohort</span>
                    <span className="font-bold text-foreground">
                      {selectedReg.childAge < 12 ? 'Junior Builders (5-11)' : 'Senior Builders (12-17)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Clock4 className="h-3.5 w-3.5" /> Allocated Batch</span>
                    <span className="font-bold text-foreground">
                      {selectedReg.preferredSession === 'morning' ? 'Morning (10 AM WAT)' : 'Afternoon (2 PM WAT)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5"><School className="h-3.5 w-3.5" /> School</span>
                    <span className="font-bold text-foreground text-right max-w-[200px] truncate">{selectedReg.schoolName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Start Date</span>
                    <span className="font-semibold text-foreground">Saturday, July 27, 2026</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-orange-500" /> CONTACT INFORMATION
                </h4>
                <div className="space-y-3 bg-muted/20 border border-border/60 rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Parent / Guardian Name</span>
                    <span className="text-sm font-semibold text-foreground">{selectedReg.parentName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Email Address</span>
                    <a href={`mailto:${selectedReg.email}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {selectedReg.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Phone Number</span>
                    <a href={`tel:${selectedReg.phone}`} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {selectedReg.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Transaction details */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-orange-500" /> TRANSACTION RECEIPT
                </h4>
                <div className="space-y-3 bg-muted/20 border border-border/60 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Total Amount Paid</span>
                    <span className="font-extrabold text-foreground text-base">₦{(selectedReg.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Payment Method</span>
                    <span className="font-semibold text-foreground uppercase text-xs">Paystack Card</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Payment Status</span>
                    <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/10 text-[10px] font-bold py-0.5 rounded-full uppercase tracking-wider">
                      Verified Success
                    </Badge>
                  </div>
                  <Separator className="bg-border/60 my-1" />
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Gateway Audit Reference</span>
                    <span className="text-xs font-mono text-zinc-400 break-all select-all mt-0.5 block">{selectedReg.paymentReference}</span>
                  </div>
                  {selectedReg.paymentDate && (
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Transaction Timestamp</span>
                      <span className="text-xs font-mono text-zinc-400 mt-0.5 block">
                        {new Date(selectedReg.paymentDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Referral survey & tracking */}
              {(selectedReg.howDidYouHear || selectedReg.referredBy) && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-orange-500" /> SURVEY & REFERRAL
                  </h4>
                  <div className="bg-muted/20 border border-border/60 rounded-2xl p-4 space-y-3 text-xs">
                    {selectedReg.howDidYouHear && (
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">How did you hear about Code-X?</span>
                        <p className="text-sm font-semibold text-zinc-300 mt-0.5">"{selectedReg.howDidYouHear}"</p>
                      </div>
                    )}
                    {selectedReg.referredBy && (
                      <div className="pt-2 border-t border-border/40">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Referred By Code</span>
                        <p className="text-sm font-mono font-bold text-orange-500 mt-0.5">{selectedReg.referredBy}</p>
                        {referrerLoading ? (
                          <div className="mt-1.5 p-3 flex justify-center bg-zinc-950 border border-zinc-800 rounded-lg">
                            <div className="w-4 h-4 border-2 border-t-orange-500 border-r-transparent border-zinc-800 rounded-full animate-spin"></div>
                          </div>
                        ) : referrerProfile ? (
                          <div className="mt-1.5 p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Referrer Identity</span>
                              <Badge className={cn(
                                "text-[9px] font-bold px-1.5 py-0 rounded-md border-none uppercase tracking-wider h-auto text-center shrink-0",
                                referrerProfile.type === 'parent' && "bg-blue-500/10 text-blue-400",
                                referrerProfile.type === 'student' && "bg-emerald-500/10 text-emerald-400",
                                referrerProfile.type === 'teacher' && "bg-purple-500/10 text-purple-400",
                                referrerProfile.type === 'custom' && "bg-zinc-800 text-zinc-400"
                              )}>
                                {referrerProfile.type}
                              </Badge>
                            </div>
                            <p className="text-xs font-extrabold text-zinc-200">{referrerProfile.name}</p>
                            {referrerProfile.email && (
                              <p className="text-[10px] text-zinc-400">{referrerProfile.email}</p>
                            )}
                            {referrerProfile.phone && referrerProfile.phone !== 'N/A' && (
                              <p className="text-[10px] text-zinc-500">{referrerProfile.phone}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-500 italic mt-0.5">No referrer details found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
