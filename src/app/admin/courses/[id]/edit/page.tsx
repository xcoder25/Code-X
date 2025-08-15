
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, File as FileIcon, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { updateCourseAction } from '@/app/actions';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { storage, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  tags: z.string().min(1, "Please provide at least one tag."),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface Module {
    name: string;
    type: string;
    size: number;
    url: string;
}

export default function EditCourseForm() {
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingModules, setExistingModules] = useState<Module[]>([]);
  
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
    },
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
                });
                setExistingModules(data.modules || []);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingModule = (url: string) => {
    setExistingModules(prev => prev.filter(m => m.url !== url));
  }

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);

    try {
        // 1. Upload any new files and get their data
        const newUploadedModules = await Promise.all(newFiles.map(async (file) => {
            const storageRef = ref(storage, `course_files/${courseId}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return { name: file.name, type: file.type, size: file.size, url: url };
        }));

        // 2. Combine existing and new modules
        const allModules = [...existingModules, ...newUploadedModules];

        // 3. Call the update server action
        await updateCourseAction({
            courseId,
            ...data,
            modules: allModules,
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
                    <Skeleton className="h-32 w-full" />
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
        <Card>
             <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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


                    <div>
                        <Label>Course Materials (Videos, PDFs, etc.)</Label>
                        <div className="relative flex items-center justify-center border-2 border-dashed rounded-md h-32 cursor-pointer hover:border-primary transition">
                            <div className="text-center">
                                <Upload className="mx-auto text-muted-foreground w-8 h-8" />
                                <p className="text-sm text-muted-foreground mt-2">Drag & drop new files or click to browse</p>
                            </div>
                            <Input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.mp4,.mov,.zip"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                id="file-upload"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {(existingModules.length > 0) && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Current Files:</h4>
                                <ul className="space-y-2 rounded-md border p-2">
                                    {existingModules.map((module) => (
                                    <li key={module.url} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                        <FileIcon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{module.name}</span>
                                        <span className="text-muted-foreground text-xs shrink-0">({formatBytes(module.size)})</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingModule(module.url)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {newFiles.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">New Files to Upload:</h4>
                            <ul className="space-y-2 rounded-md border p-2 border-primary/50">
                                {newFiles.map((file, index) => (
                                <li key={index} className="flex items-center justify-between p-2 bg-primary/10 rounded-md text-sm">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                    <FileIcon className="h-4 w-4 shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                    <span className="text-muted-foreground text-xs shrink-0">({formatBytes(file.size)})</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewFile(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                                ))}
                            </ul>
                        </div>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </Button>
                </form>
             </CardContent>
        </Card>
    </div>
  );
}
