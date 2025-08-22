
'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteAssignmentAction } from '@/app/actions';

interface Assignment {
    id: string;
    title: string;
    courseTitle: string;
    dueDate: Timestamp;
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const { toast } = useToast();


  useEffect(() => {
    const assignmentsQuery = query(collection(db, 'assignments'), orderBy('dueDate', 'desc'));
    const unsubscribe = onSnapshot(assignmentsQuery, (snapshot) => {
        const assignmentsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Assignment);
        setAssignments(assignmentsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching assignments:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAssignment) return;
    try {
        await deleteAssignmentAction(selectedAssignment.id);
        toast({
            title: "Assignment Deleted",
            description: `"${selectedAssignment.title}" has been successfully deleted.`
        })
    } catch(e: any) {
        toast({
            variant: "destructive",
            title: "Error Deleting Assignment",
            description: e.message
        })
    } finally {
        setIsAlertOpen(false);
        setSelectedAssignment(null);
    }
  }

  return (
    <>
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Manage Assignments</h2>
            <Button asChild>
                <Link href="/admin/assignments/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Assignment
                </Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Assignments</CardTitle>
                <CardDescription>
                    A list of all assignments in the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : assignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No assignments created yet.
                                </TableCell>
                            </TableRow>
                        ) : assignments.map(assignment => (
                            <TableRow key={assignment.id}>
                                <TableCell className="font-medium">{assignment.title}</TableCell>
                                <TableCell>{assignment.courseTitle}</TableCell>
                                <TableCell>{new Date(assignment.dueDate.seconds * 1000).toLocaleDateString()}</TableCell>
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
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/assignments/${assignment.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDeleteClick(assignment)} className="text-red-600 focus:text-red-600 focus:bg-red-500/10">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
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
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the assignment.
                    Student submissions for this assignment will not be deleted but will become orphaned.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
