
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Access Codes</h2>
             <GenerateCodesDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Generate Codes
                </Button>
            </GenerateCodesDialog>
        </div>
         <p className="text-muted-foreground">
            Generate and manage access codes for specific courses or bootcamps.
        </p>
        <Card>
            <CardHeader>
                <CardTitle>Existing Codes</CardTitle>
                <CardDescription>
                    A list of all generated access codes.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Redemptions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {loading ? (
                             [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                                </TableRow>
                            ))
                        ) : codes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No access codes found.
                                </TableCell>
                            </TableRow>
                        ) : codes.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium font-mono">{item.code}</TableCell>
                                <TableCell>{item.courseTitle}</TableCell>
                                <TableCell>{item.redemptions} / {item.maxRedemptions}</TableCell>
                                <TableCell>
                                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>{new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button
                                        aria-haspopup="true"
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => copyCode(item.code)}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Code
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-500/10">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Revoke
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
