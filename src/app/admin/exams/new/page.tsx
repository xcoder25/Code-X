
'use client';

import { useState, useEffect, useId } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createExamAction } from '@/app/actions';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Course {
    id: string;
    title: string;
}

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Question text cannot be empty."),
  options: z.array(z.string().min(1, "Option text cannot be empty.")).min(2, "Must have at least two options."),
  correctAnswer: z.string().min(1, "A correct answer must be selected."),
});

const examFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Please select a course."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  questions: z.array(questionSchema).min(1, "An exam must have at least one question."),
});

type ExamFormData = z.infer<typeof examFormSchema>;

export default function CreateExamPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const uniqueId = useId();

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: { 
      title: '',
      courseId: '',
      duration: 10,
      questions: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "questions",
  });

   useEffect(() => {
    async function fetchCourses() {
        const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
        const querySnapshot = await getDocs(coursesQuery);
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesData);
    }
    fetchCourses();
  }, []);
  
  const addQuestion = () => {
    append({
        id: `${uniqueId}-q-${fields.length}`,
        text: '',
        options: ['', ''],
        correctAnswer: '',
    });
  };

  const addOption = (questionIndex: number) => {
    const question = form.getValues(`questions.${questionIndex}`);
    update(questionIndex, {
      ...question,
      options: [...question.options, ''],
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = form.getValues(`questions.${questionIndex}`);
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    // If the removed option was the correct one, reset correctAnswer
    if (question.correctAnswer === question.options[optionIndex]) {
        update(questionIndex, { ...question, options: newOptions, correctAnswer: '' });
    } else {
        update(questionIndex, { ...question, options: newOptions });
    }
  };

  const onSubmit = async (data: ExamFormData) => {
    setIsSubmitting(true);
    try {
      await createExamAction(data);
      toast({ title: 'Success!', description: `Exam "${data.title}" has been created.` });
      router.push(`/admin/exams`);
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create exam.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Create New Exam</h2>
        <p className="text-muted-foreground">Fill out the details below to add a new exam.</p>
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
                                    <FormField
                                        control={form.control}
                                        name={`questions.${qIndex}.correctAnswer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Options (select the correct answer)</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className="space-y-2"
                                                    >
                                                        {question.options.map((_, oIndex) => (
                                                             <FormField
                                                                key={`${question.id}-opt-${oIndex}`}
                                                                control={form.control}
                                                                name={`questions.${qIndex}.options.${oIndex}`}
                                                                render={({ field: optionField }) => (
                                                                     <FormItem className="flex items-center gap-2">
                                                                        <RadioGroupItem value={optionField.value} id={`${question.id}-opt-${oIndex}`} />
                                                                        <FormControl>
                                                                            <Input {...optionField} placeholder={`Option ${oIndex + 1}`} />
                                                                        </FormControl>
                                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}>
                                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                     </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Option
                                    </Button>
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
                    {isSubmitting ? 'Creating...' : 'Create Exam'}
                </Button>
            </form>
        </Form>
    </div>
  );
}
