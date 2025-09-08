
'use client';

import { useState, useEffect, useId } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateExamAction } from '@/app/actions';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
    id: string;
    title: string;
}

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Question text cannot be empty."),
});

const examFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Please select a course."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  questions: z.array(questionSchema).min(1, "An exam must have at least one question."),
});

type ExamFormData = z.infer<typeof examFormSchema>;

export default function EditExamPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  const { toast } = useToast();
  const uniqueId = useId();

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  useEffect(() => {
    async function fetchCoursesAndExam() {
        setPageLoading(true);
        try {
            // Fetch courses
            const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
            const coursesSnapshot = await getDocs(coursesQuery);
            setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));

            // Fetch exam data
            const examRef = doc(db, 'exams', examId);
            const examSnap = await getDoc(examRef);

            if (examSnap.exists()) {
                const data = examSnap.data();
                const questionsRef = collection(db, 'exams', examId, 'questions');
                const questionsSnap = await getDocs(questionsRef);
                const questions = questionsSnap.docs.map(doc => doc.data() as z.infer<typeof questionSchema>);
                
                form.reset({
                    title: data.title,
                    courseId: data.courseId,
                    duration: data.duration / 60, // convert seconds to minutes
                    questions: questions,
                });
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Exam not found.' });
                 router.push('/admin/exams');
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch data.' });
        } finally {
            setPageLoading(false);
        }
    }
    fetchCoursesAndExam();
  }, [examId, form, router, toast]);

    
  const addQuestion = () => {
    append({
        id: `${uniqueId}-q-${fields.length}`,
        text: '',
    });
  };

  const onSubmit = async (data: ExamFormData) => {
    setIsSubmitting(true);
    try {
      await updateExamAction({ examId, ...data });
      toast({ title: 'Success!', description: 'Exam has been updated.' });
      router.push('/admin/exams');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update exam.' });
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
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/admin/exams">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Exams</span>
                </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Edit Exam</h2>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
                 <Card>
                    <CardHeader>
                        <CardTitle>Exam Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., HTML Fundamentals Quiz" {...field} />
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
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (in minutes)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Questions</CardTitle>
                        <CardDescription>Add and manage questions for this exam.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((question, qIndex) => (
                            <Card key={question.id} className="bg-muted/50 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-base font-semibold">Question {qIndex + 1}</Label>
                                    <Button variant="ghost" size="icon" onClick={() => remove(qIndex)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name={`questions.${qIndex}.text`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question Text</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="What is HTML?" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </Card>
                        ))}
                         <Button type="button" variant="outline" onClick={addQuestion}>
                            <Plus className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                        <FormMessage>{form.formState.errors.questions?.message}</FormMessage>
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
