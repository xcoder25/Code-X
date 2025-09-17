
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
import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import GradeSubmissionDialog from '@/components/admin/grade-submission-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { gradeProjectAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AssignmentSubmission {
  id: string; // This will be the assignment ID
  userId: string;
  userName: string;
  assignmentTitle: string;
  courseTitle: string;
  colabLink: string;
  status: 'Pending' | 'Graded';
  grade: string | null;
  submittedAt: Timestamp;
}

interface ProjectSubmission {
  id: string; // This will be the project ID
  userId: string;
  userName: string;
  projectTitle: string;
  courseTitle: string;
  colabLink: string;
  status: 'Pending' | 'Graded';
  grade: number | null;
  submittedAt: Timestamp;
}

export default function AdminSubmissionsPage() {
    const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);
    const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Query for assignment submissions
        const assignmentSubmissionsQuery = query(collectionGroup(db, 'submissions'), orderBy('submittedAt', 'desc'));
        const unsubscribeAssignments = onSnapshot(assignmentSubmissionsQuery, (snapshot) => {
            const submissionsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                userId: doc.ref.parent.parent!.id,
            } as AssignmentSubmission));
            setAssignmentSubmissions(submissionsData);
        }, (error) => {
            console.error("Error fetching assignment submissions:", error);
        });

        // Query for project submissions
        const projectSubmissionsQuery = query(collectionGroup(db, 'projectSubmissions'), orderBy('submittedAt', 'desc'));
        const unsubscribeProjects = onSnapshot(projectSubmissionsQuery, (snapshot) => {
            const submissionsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                 userId: doc.ref.parent.parent!.id,
            } as ProjectSubmission));
            setProjectSubmissions(submissionsData);
        }, (error) => {
            console.error("Error fetching project submissions:", error);
        });

        setLoading(false);
        
        return () => {
            unsubscribeAssignments();
            unsubscribeProjects();
        };
    }, []);

    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'Pending':
          return 'default';
        case 'Graded':
          return 'secondary';
        default:
          return 'outline';
      }
    };


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
        </div>
         <p className="text-muted-foreground">
            Review and grade student submissions for assignments and projects.
        </p>

        <Tabs defaultValue="assignments" className="w-full">
            <TabsList>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="assignments">
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Submissions</CardTitle>
                        <CardDescription>A list of all assignment submissions from students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Assignment</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-20 rounded-md" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : assignmentSubmissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">No assignment submissions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    assignmentSubmissions.map(item => (
                                        <TableRow key={`${item.userId}-${item.id}`}>
                                            <TableCell className="font-medium">{item.userName}</TableCell>
                                            <TableCell>{item.assignmentTitle}</TableCell>
                                            <TableCell>{item.courseTitle}</TableCell>
                                            <TableCell>{new Date(item.submittedAt.seconds * 1000).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell>{item.grade || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button asChild variant="outline" size="sm">
                                                        <a href={item.colabLink} target="_blank" rel="noopener noreferrer">View Link</a>
                                                    </Button>
                                                    {item.status === 'Pending' && (
                                                        <GradeSubmissionDialog submission={item}>
                                                            <Button size="sm">Grade</Button>
                                                        </GradeSubmissionDialog>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="projects">
                 <Card>
                    <CardHeader>
                        <CardTitle>Project Submissions</CardTitle>
                        <CardDescription>A list of all project submissions from students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-20 rounded-md" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : projectSubmissions.length === 0 ? (
                                     <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">No project submissions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    projectSubmissions.map(item => (
                                        <TableRow key={`${item.userId}-${item.id}`}>
                                            <TableCell className="font-medium">{item.userName}</TableCell>
                                            <TableCell>{item.projectTitle}</TableCell>
                                            <TableCell>{item.courseTitle}</TableCell>
                                            <TableCell>{new Date(item.submittedAt.seconds * 1000).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                                            </TableCell>
                                            <TableCell>{item.grade === null ? 'N/A' : item.grade}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button asChild variant="outline" size="sm">
                                                        <a href={item.colabLink} target="_blank" rel="noopener noreferrer">View Link</a>
                                                    </Button>
                                                    {item.status === 'Pending' && (
                                                        <GradeProjectDialog submission={item} />
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}


// Grade Project Dialog
const gradeProjectSchema = z.object({
  grade: z.coerce.number().min(0, { message: "Grade must be a positive number." }),
});

function GradeProjectDialog({ submission }: { submission: ProjectSubmission }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof gradeProjectSchema>>({
    resolver: zodResolver(gradeProjectSchema),
    defaultValues: {
      grade: submission.grade || 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof gradeProjectSchema>) => {
    setIsLoading(true);
    try {
        await gradeProjectAction({
            grade: values.grade,
            userId: submission.userId,
            submissionId: submission.id, // submissionId is the projectId
        });
        toast({
            title: 'Project Graded!',
            description: `${submission.userName}'s project has been graded.`,
        });
        setIsOpen(false);
        form.reset();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to grade project.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
          <Button size="sm">Grade</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grade Project Submission</DialogTitle>
          <DialogDescription>
            Review the submission for <span className="font-semibold">{submission.userName}</span> and enter a grade.
          </DialogDescription>
        </DialogHeader>
         <div className="text-sm">
            <p><span className="font-semibold">Project:</span> {submission.projectTitle}</p>
            <p><span className="font-semibold">Course:</span> {submission.courseTitle}</p>
            <p><span className="font-semibold">Submission Link:</span> <a href={submission.colabLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">Open in new tab</a></p>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Final Grade</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 95" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Grade
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
