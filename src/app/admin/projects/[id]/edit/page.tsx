
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateProjectAction } from '@/app/actions';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { type PageProps } from 'next';

interface Course {
    id: string;
    title: string;
}

const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Please select a course."),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

type EditProjectPageProps = PageProps<{ id: string }>;

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { 
      title: '',
      courseId: '',
      description: '',
    },
  });

  useEffect(() => {
    async function fetchCoursesAndProject() {
        setPageLoading(true);
        try {
            // Fetch courses
            const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
            const coursesSnapshot = await getDocs(coursesQuery);
            const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(coursesData);

            // Fetch project data
            const projectRef = doc(db, 'projects', projectId);
            const docSnap = await getDoc(projectRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                form.reset({
                    title: data.title,
                    courseId: data.courseId,
                    dueDate: data.dueDate.toDate(),
                    description: data.description || '',
                });
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Project not found.' });
                 router.push('/admin/projects');
            }
        } catch (error) {
             console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch data.' });
        } finally {
            setPageLoading(false);
        }
    }
    fetchCoursesAndProject();
  }, [projectId, form, router, toast]);

  
  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await updateProjectAction({ projectId, ...data });
      toast({ title: 'Success!', description: 'Project has been updated.' });
      router.push('/admin/projects');
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update project.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
      return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Skeleton className="h-9 w-64" />
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-60" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/admin/projects">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Projects</span>
                </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Edit Project</h2>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <Card>
                    <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Python Basics Challenge" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="courseId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Course</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select the associated course" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide instructions or details about the project..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    </div>
  );
}
