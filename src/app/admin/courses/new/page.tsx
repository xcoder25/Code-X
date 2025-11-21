
'use client';

import { useState, useId } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, GripVertical, Loader2, X, DollarSign, Bot, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createCourseAction } from '@/app/actions';
import { aiCreateCourseAction } from '@/lib/ai-course-actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const lessonSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Lesson title is required."),
    content: z.string().min(1, "Lesson content is required."),
});

const moduleSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Module title is required."),
    lessons: z.array(lessonSchema),
});

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  tags: z.string().min(1, "Please provide at least one tag."),
  modules: z.array(moduleSchema),
  price: z.coerce.number().min(0, "Price must be a positive number.").optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function CreateCourseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [useAiAssistant, setUseAiAssistant] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const uniqueId = useId();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: { 
      title: '', 
      description: '', 
      tags: '',
      modules: [],
      price: 0,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  const addModule = () => {
    append({
        id: `${uniqueId}-module-${fields.length}`,
        title: `New Module ${fields.length + 1}`,
        lessons: [],
    });
  };
  
  const addLesson = (moduleIndex: number) => {
    const modules = form.getValues('modules');
    const newLesson = {
        id: `${uniqueId}-lesson-${modules[moduleIndex].lessons.length}`,
        title: 'New Lesson',
        content: 'Write your lesson content here. You can use Markdown.',
    };
    const updatedLessons = [...modules[moduleIndex].lessons, newLesson];
    update(moduleIndex, { ...modules[moduleIndex], lessons: updatedLessons });
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const modules = form.getValues('modules');
    const updatedLessons = modules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    update(moduleIndex, { ...modules[moduleIndex], lessons: updatedLessons });
  };
  
  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      if (useAiAssistant) {
        const result = await aiCreateCourseAction({
          title: data.title,
          description: data.description,
          tags: data.tags.split(',').map(tag => tag.trim()),
          difficulty: 'intermediate', // Default, can be made configurable
          generateContent: true,
        });
        
        toast({ 
          title: 'Success!', 
          description: `Course "${data.title}" has been created with AI assistance.` 
        });
      } else {
        await createCourseAction(data);
        toast({ title: 'Success!', description: `Course "${data.title}" has been created.` });
      }
      
      router.push(`/admin/courses`);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create course.' });
      setIsSubmitting(false); // Only stop loading on error
    }
  };

  const handleAiGenerate = async () => {
    const formData = form.getValues();
    if (!formData.title || !formData.description) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in title and description before generating content.',
      });
      return;
    }

    setIsAiGenerating(true);
    try {
      const result = await aiCreateCourseAction({
        title: formData.title,
        description: formData.description,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        difficulty: 'intermediate',
        generateContent: true,
      });

      if (result.courseStructure?.modules) {
        // Update form with AI-generated content
        form.setValue('modules', result.courseStructure.modules);
        toast({
          title: 'AI Content Generated!',
          description: 'Course structure has been generated. Review and modify as needed.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: error.message || 'Failed to generate course content.',
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
            <p className="text-muted-foreground">Fill out the details below to add a new course to the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleAiGenerate}
              disabled={isAiGenerating}
            >
              {isAiGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Generate with AI
            </Button>
          </div>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Ultimate Next.js Bootcamp" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={4} placeholder="A comprehensive course covering..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., React, Next.js (comma-separated)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (in NGN)</FormLabel>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} className="pl-8" />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Content</CardTitle>
                        <CardDescription>Add modules and lessons to build your curriculum.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((module, moduleIndex) => (
                            <Card key={module.id} className="bg-muted/50">
                                <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-4">
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                    <Input 
                                        {...form.register(`modules.${moduleIndex}.title`)}
                                        className="text-lg font-semibold border-none shadow-none focus-visible:ring-1 p-1 h-auto"
                                    />
                                    <Button variant="ghost" size="icon" className="ml-auto" onClick={() => remove(moduleIndex)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-4">
                                    <div className="space-y-2">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <div key={lesson.id} className="flex flex-col gap-2 p-3 bg-background rounded-md border">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={`lesson-title-${module.id}-${lesson.id}`}>Lesson Title</Label>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLesson(moduleIndex, lessonIndex)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Input
                                                    id={`lesson-title-${module.id}-${lesson.id}`}
                                                    {...form.register(`modules.${moduleIndex}.lessons.${lessonIndex}.title`)}
                                                    placeholder="e.g., Introduction to React"
                                                />
                                                {form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.title?.message}</p>}
                                                
                                                <Label htmlFor={`lesson-content-${module.id}-${lesson.id}`} className="mt-2">Lesson Content (Markdown supported)</Label>
                                                <Textarea
                                                    id={`lesson-content-${module.id}-${lesson.id}`}
                                                    {...form.register(`modules.${moduleIndex}.lessons.${lessonIndex}.content`)}
                                                    placeholder="Write lesson content here..."
                                                    rows={6}
                                                />
                                                {form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.content && <p className="text-sm text-destructive mt-1">{form.formState.errors.modules?.[moduleIndex]?.lessons?.[lessonIndex]?.content?.message}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addLesson(moduleIndex)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Lesson
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={addModule}>
                            <Plus className="mr-2 h-4 w-4" /> Add Module
                        </Button>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Creating Course...' : 'Create Course'}
                </Button>
            </form>
        </Form>
    </div>
  );
}
