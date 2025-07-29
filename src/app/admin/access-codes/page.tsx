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
import { useState } from 'react';

const initialCodes = [
    {
        code: "BOOTCAMP-2024-S1",
        course: "Web Development Bootcamp",
        status: "Active",
        redemptions: 25,
        maxRedemptions: 100,
        createdAt: "2024-05-01"
    },
    {
        code: "JS-ADV-FALL",
        course: "Advanced JavaScript",
        status: "Active",
        redemptions: 8,
        maxRedemptions: 50,
        createdAt: "2024-06-15"
    },
    {
        code: "EXPIRED-PYTHON",
        course: "Introduction to Python",
        status: "Expired",
        redemptions: 20,
        maxRedemptions: 20,
        createdAt: "2024-03-10"
    }
];


export default function AdminAccessCodesPage() {
    const [codes, setCodes] = useState(initialCodes);
    const { toast } = useToast();

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
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Generate Codes
            </Button>
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
                        {codes.map(item => (
                            <TableRow key={item.code}>
                                <TableCell className="font-medium font-mono">{item.code}</TableCell>
                                <TableCell>{item.course}</TableCell>
                                <TableCell>{item.redemptions} / {item.maxRedemptions}</TableCell>
                                <TableCell>
                                    <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>{item.createdAt}</TableCell>
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

