
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
import { submitProjectAction } from '@/app/actions';

const submissionSchema = z.object({
  colabLink: z.string().url({ message: "Please enter a valid Google Colab URL." }),
});

interface ProjectSubmissionDialogProps {
  children: React.ReactNode;
  projectId: string;
  userId: string;
  userName: string;
}

export function ProjectSubmissionDialog({ children, projectId, userId, userName }: ProjectSubmissionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      colabLink: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof submissionSchema>) => {
    setIsLoading(true);
    try {
        await submitProjectAction({
            ...values,
            projectId,
            userId,
            userName,
        });
        toast({
            title: 'Project Submitted!',
            description: 'Your submission is now pending review.',
        });
        setIsOpen(false);
        form.reset();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to submit project.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Project</DialogTitle>
          <DialogDescription>
            Paste the link to your Google Colab notebook below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="colabLink"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Google Colab Link</FormLabel>
                    <FormControl>
                        <Input placeholder="https://colab.research.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit for Review
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
