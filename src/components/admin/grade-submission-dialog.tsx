
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { gradeAssignmentAction } from '@/app/actions';
import type { Timestamp } from 'firebase/firestore';


interface Submission {
  id: string; // assignment ID
  userId: string;
  userName: string;
  assignmentTitle: string;
  courseTitle: string;
  colabLink: string;
  status: 'Pending' | 'Graded';
  grade: string | null;
  submittedAt: Timestamp;
}


interface GradeSubmissionDialogProps {
  children: React.ReactNode;
  submission: Submission;
}

const gradeSchema = z.object({
  grade: z.string().min(1, { message: "Grade is required." }),
});

export default function GradeSubmissionDialog({ children, submission }: GradeSubmissionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof gradeSchema>>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      grade: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof gradeSchema>) => {
    setIsLoading(true);
    try {
        await gradeAssignmentAction({
            grade: values.grade,
            userId: submission.userId,
            submissionId: submission.id, // submissionId is the assignmentId
        });
        toast({
            title: 'Assignment Graded!',
            description: `${submission.userName}'s submission has been graded.`,
        });
        setIsOpen(false);
        form.reset();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to grade assignment.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
          <DialogDescription>
            Review the submission for <span className="font-semibold">{submission.userName}</span> and enter a grade below.
          </DialogDescription>
        </DialogHeader>
         <div className="text-sm">
            <p><span className="font-semibold">Assignment:</span> {submission.assignmentTitle}</p>
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
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., A+, 95%, Complete" {...field} />
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
