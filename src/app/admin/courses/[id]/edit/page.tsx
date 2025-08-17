
'use client';

import { useState, useEffect, useId } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, File as FileIcon, Loader2, ArrowLeft, GripVertical, Plus, Library, Trash2, Edit } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateCourseAction } from '@/app/actions';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { storage, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

const resourceSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string().url(),
});

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  tags: z.string().min(1, "Please provide at least one tag."),
  modules: z.array(moduleSchema),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface Resource {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
}

export default function EditCourseForm() {
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { toast } = useToast();
  const uniqueId = useId();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      modules: [],
    },
  });

  const { fields: moduleFields, append: appendModule, remove: removeModule, update: updateModule } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseData = async () => {
        setPageLoading(true);
        try {
            const courseRef = doc(db, 'courses', courseId);
            const docSnap = await getDoc(courseRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                form.reset({
                    title: data.title,
                    description: data.description,
                    tags: (data.tags || []).join(', '),
                    modules: data.modules || [],
                });
                setResources(data.resources || []);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Course not found.' });
                router.push('/admin/courses');
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch course data.' });
        } finally {
            setPageLoading(false);
        }
    };
    fetchCourseData();
  }, [courseId, form, router, toast]);

  const handleResourceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsSubmitting(true);
        try {
            const uploadedResources = await Promise.all(files.map(async file => {
                const storageRef = ref(storage, `course_resources/${courseId}/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                return { 
                    id: `${uniqueId}-resource-${file.name}`,
                    name: file.name, 
                    type: file.type, 
                    size: file.size, 
                    url: url 
                };
            }));
            
            setResources(prev => [...prev, ...uploadedResources]);
            toast({ title: 'Upload successful', description: `${files.length} resource(s) added.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not upload resources.' });
        } finally {
            setIsSubmitting(false);
            e.target.value = '';
        }
    }
  };
  
  const addModule = () => {
    appendModule({
        id: `${uniqueId}-module-${moduleFields.length}`,
        title: `New Module ${moduleFields.length + 1}`,
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
    updateModule(moduleIndex, { ...modules[moduleIndex], lessons: updatedLessons });
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const modules = form.getValues('modules');
    const updatedLessons = modules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    updateModule(moduleIndex, { ...modules[moduleIndex], lessons: updatedLessons });
  };

  const removeResource = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
  }

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
        await updateCourseAction({
            courseId,
            ...data,
            resources,
        });
      
      toast({
        title: 'Success!',
        description: 'Course has been updated successfully.',
      });
      
      router.push(`/admin/courses`);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update course.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  if (pageLoading) {
      return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-6 w-96" />
            <Card>
                <CardContent className="pt-6 space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/admin/courses">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Courses</span>
                </Link>
            </Button>
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Edit Course</h2>
                <p className="text-muted-foreground">
                    Update the course details and manage its content.
                </p>
            </div>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Course Title</Label>
                        <Input {...form.register('title')} placeholder="e.g., Ultimate Next.js Bootcamp" />
                        {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea rows={4} {...form.register('description')} placeholder="A comprehensive course covering..." />
                        {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
                    </div>
                    <div>
                        <Label>Tags</Label>
                        <Input {...form.register('tags')} placeholder="e.g., React, Next.js, TypeScript (comma-separated)" />
                        {form.formState.errors.tags && <p className="text-sm text-destructive mt-1">{form.formState.errors.tags.message}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>Manage the modules and lessons for this course.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {moduleFields.map((module, moduleIndex) => (
                        <Card key={module.id} className="bg-muted/50">
                            <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <Input 
                                    {...form.register(`modules.${moduleIndex}.title`)}
                                    className="text-lg font-semibold border-none shadow-none focus-visible:ring-1 p-1 h-auto"
                                />
                                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => removeModule(moduleIndex)}>
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

             <Card>
                <CardHeader>
                    <CardTitle>Resource Library</CardTitle>
                     <CardDescription>Upload supplementary materials like e-books, source code, or cheat sheets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        {resources.map(resource => (
                            <div key={resource.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Library className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{resource.name}</span>
                                    <span className="text-muted-foreground text-xs shrink-0">({formatBytes(resource.size)})</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeResource(resource.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                     <div className="relative flex items-center justify-center border-2 border-dashed rounded-md h-20 mt-4 cursor-pointer hover:border-primary transition">
                        <div className="text-center">
                            <Upload className="mx-auto text-muted-foreground w-6 h-6" />
                            <p className="text-xs text-muted-foreground mt-1">Upload Resources</p>
                        </div>
                        <Input
                            type="file"
                            multiple
                            onChange={handleResourceFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isSubmitting}
                        />
                    </div>
                </CardContent>
            </Card>


            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </form>
    </div>
  );
}

    