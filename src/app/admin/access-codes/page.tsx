
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import GenerateCodesDialog from '@/components/admin/generate-codes-dialog';
import { motion } from 'framer-motion';
import { 
    Activity, Key, ShieldCheck, 
    TrendingUp, Search, Filter,
    CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React from 'react';


interface AccessCode {
    id: string;
    code: string;
    courseTitle: string;
    status: 'Active' | 'Expired';
    redemptions: number;
    maxRedemptions: number;
    createdAt: {
        seconds: number;
    }
}


export default function AdminAccessCodesPage() {
    const [codes, setCodes] = useState<AccessCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const codesQuery = query(collection(db, 'accessCodes'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(codesQuery, (snapshot) => {
            const codesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as AccessCode);
            setCodes(codesData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching access codes:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Code Copied!",
            description: `${code} has been copied to your clipboard.`,
        });
    }

    const stats = {
        total: codes.length,
        active: codes.filter(c => c.status === 'Active').length,
        redeemed: codes.reduce((acc, curr) => acc + curr.redemptions, 0),
        capacity: codes.reduce((acc, curr) => acc + curr.maxRedemptions, 0),
    };

    return (
        <div className="flex-1 space-y-8 p-8 bg-slate-950 min-h-screen text-slate-100">
            {/* Header section with glass dashboard feel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                        Access Control
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">NEXUS Vault: Enrollment Key Orchestration</p>
                </div>
                <div className="flex items-center gap-3">
                    <GenerateCodesDialog>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 px-6 h-11 rounded-xl font-bold">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Mint New Keys
                        </Button>
                    </GenerateCodesDialog>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Issued', value: stats.total, icon: <Key />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                    { label: 'System Active', value: stats.active, icon: <Activity />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Redemptions', value: stats.redeemed, icon: <TrendingUp />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                    { label: 'Total Capacity', value: stats.capacity, icon: <ShieldCheck />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={cn("p-4 rounded-2xl border backdrop-blur-md", stat.bg)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                            <div className={cn("p-1.5 rounded-lg", stat.bg)}>{React.cloneElement(stat.icon as React.ReactElement, { className: "h-3.5 w-3.5" })}</div>
                        </div>
                        <div className={cn("text-2xl font-black truncate", stat.color)}>{stat.value.toLocaleString()}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                                Deployment Registry
                            </CardTitle>
                            <CardDescription className="text-slate-500">Live monitoring of all enrollment protocols</CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input 
                                placeholder="Search keys or courses..." 
                                className="pl-10 bg-slate-950/50 border-slate-800 rounded-xl h-10 text-xs"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-950/30">
                            <TableRow className="hover:bg-transparent border-slate-800">
                                <TableHead className="w-[200px] pl-8 text-[11px] font-bold uppercase tracking-widest text-slate-500">Access Key</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Linked Course</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Utilization</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Timestamp</TableHead>
                                <TableHead className="pr-8 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i} className="border-slate-800">
                                        <TableCell className="pl-8"><Skeleton className="h-5 w-32 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-40 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20 bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16 rounded-full bg-slate-800" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24 bg-slate-800" /></TableCell>
                                        <TableCell className="pr-8 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md bg-slate-800" /></TableCell>
                                    </TableRow>
                                ))
                            ) : codes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Key className="h-12 w-12" />
                                            <p className="font-bold">No active keys found in registry.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : codes.map(item => {
                                const utilPercent = (item.redemptions / item.maxRedemptions) * 100;
                                return (
                                    <TableRow key={item.id} className="border-slate-800/50 hover:bg-slate-800/20 group">
                                        <TableCell className="pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-500/10 transition-colors">
                                                    <Key className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-400" />
                                                </div>
                                                <span className="font-mono text-sm font-bold tracking-wider text-slate-100">{item.code}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-300">{item.courseTitle}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">ID: {item.id.substring(0, 8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5 w-32">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                    <span>{item.redemptions}/{item.maxRedemptions}</span>
                                                    <span>{Math.round(utilPercent)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${utilPercent}%` }}
                                                        className={cn(
                                                            "h-full rounded-full transition-colors",
                                                            utilPercent > 90 ? "bg-amber-500" : "bg-blue-500"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.status === 'Active' ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2.5 h-6">
                                                    <CheckCircle2 className="mr-1.5 h-3 w-3" /> ACTIVE
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-slate-800 text-slate-500 border border-slate-700 text-[10px] font-black px-2.5 h-6">
                                                    <AlertCircle className="mr-1.5 h-3 w-3" /> EXPIRED
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium font-mono">
                                                <Clock className="h-3 w-3" />
                                                {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-800">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200 w-44 rounded-xl shadow-2xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-3 py-2">Protocol Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => copyCode(item.code)} className="px-3 py-2.5 cursor-pointer focus:bg-blue-600 focus:text-white rounded-lg">
                                                        <Copy className="mr-3 h-4 w-4" /> Copy Key
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-800" />
                                                    <DropdownMenuItem className="px-3 py-2.5 cursor-pointer text-red-500 focus:text-white focus:bg-red-600 rounded-lg">
                                                        <Trash2 className="mr-3 h-4 w-4" /> Revoke Protocol
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
