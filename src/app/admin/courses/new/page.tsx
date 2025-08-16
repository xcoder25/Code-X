
'use client';

import { useState, useId } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, File as FileIcon, Plus, GripVertical, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createCourseAction, updateCourseAction } from '@/app/actions';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  tags: z.string().min(1, "Please provide at least one tag."),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface LessonFile {
    id: string;
    file: File;
}

interface Module {
    id: string;
    title: string;
    lessons: LessonFile[];
}

export default function CreateCourseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const uniqueId = useId();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: { title: '', description: '', tags: '' },
  });

  const addModule = () => {
    const newModule: Module = {
        id: `${uniqueId}-module-${modules.length}`,
        title: `New Module ${modules.length + 1}`,
        lessons: [],
    };
    setModules(prev => [...prev, newModule]);
  };
  
  const updateModuleTitle = (moduleId: string, newTitle: string) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, title: newTitle } : m));
  };
  
  const removeModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, moduleId: string) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ id: `${uniqueId}-${file.name}`, file }));
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, lessons: [...m.lessons, ...newFiles] } : m
      ));
    }
  };
  
  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
    ));
  };

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create course document
      const { id: courseId } = await createCourseAction(data);
      
      toast({ title: 'Course Created', description: 'Now uploading files. This may take a moment...' });
      
      // 2. Upload all files and build the final modules structure
      const finalModules = await Promise.all(modules.map(async (module) => {
          const uploadedLessons = await Promise.all(module.lessons.map(async (lessonFile) => {
              const storageRef = ref(storage, `course_files/${courseId}/${module.id}/${lessonFile.file.name}`);
              await uploadBytes(storageRef, lessonFile.file);
              const url = await getDownloadURL(storageRef);
              return {
                  id: lessonFile.id,
                  name: lessonFile.file.name,
                  type: lessonFile.file.type,
                  size: lessonFile.file.size,
                  url: url,
              };
          }));
          return {
              id: module.id,
              title: module.title,
              lessons: uploadedLessons,
          };
      }));

      // 3. Update course with module data (if any modules exist)
      if (finalModules.length > 0) {
        // We use updateCourseAction here to set modules and empty resources array
        await updateCourseAction({ 
            courseId, 
            ...data, 
            modules: finalModules,
            resources: [] 
        });
      }

      toast({ title: 'Success!', description: `Course "${data.title}" and its content have been created.` });
      router.push(`/admin/courses`);

    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create course.' });
      setIsSubmitting(false); // Only stop loading on error
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
        <p className="text-muted-foreground">Fill out the details below to add a new course to the platform.</p>
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
                    <CardDescription>Add modules and lessons to build your curriculum.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {modules.map((module) => (
                        <Card key={module.id} className="bg-muted/50">
                            <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                <Input 
                                    value={module.title} 
                                    onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                                    className="text-lg font-semibold border-none shadow-none focus-visible:ring-1 p-1 h-auto"
                                />
                                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => removeModule(module.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="space-y-2">
                                    {module.lessons.map(lessonFile => (
                                        <div key={lessonFile.id} className="flex items-center justify-between p-2 bg-background rounded-md text-sm">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileIcon className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{lessonFile.file.name}</span>
                                                <span className="text-muted-foreground text-xs shrink-0">({formatBytes(lessonFile.file.size)})</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLesson(module.id, lessonFile.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative flex items-center justify-center border-2 border-dashed rounded-md h-20 mt-4 cursor-pointer hover:border-primary transition">
                                    <div className="text-center">
                                        <Upload className="mx-auto text-muted-foreground w-6 h-6" />
                                        <p className="text-xs text-muted-foreground mt-1">Upload Lessons</p>
                                    </div>
                                    <Input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.mp4,.mov,.zip"
                                        onChange={(e) => handleFileChange(e, module.id)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={isSubmitting}
                                    />
                                </div>
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
    </div>
  );
}
