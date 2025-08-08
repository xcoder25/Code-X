
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createCourseAction, updateCourseModulesAction } from '@/app/actions';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  tags: z.string().min(1, "Please provide at least one tag."),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function CreateCourseForm() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };


  const onSubmit = async (data: CourseFormData) => {
    setLoading(true);

    try {
      // 1. Create the course document immediately without modules
      const { id: courseId } = await createCourseAction(data);
      
      toast({
        title: 'Success!',
        description: 'Course created. File uploads will continue in the background.',
      });

      // 2. Redirect immediately
      router.push(`/admin/courses`);

      // 3. Handle file uploads in the background
      if (files.length > 0) {
        const uploads = files.map(async (file) => {
          const storageRef = ref(storage, `course_files/${courseId}/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            url: url,
          };
        });
        
        const uploadedModules = await Promise.all(uploads);
        
        // 4. Update the course with the module data once uploads are complete
        await updateCourseModulesAction({ courseId, modules: uploadedModules });
        
         toast({
            title: 'Uploads Complete!',
            description: `All files for "${data.title}" have been uploaded.`,
        });
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create course.',
      });
      setLoading(false); // Only set loading to false on error
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
         <p className="text-muted-foreground">
            Fill out the details below to add a new course to the platform.
        </p>
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
                            <p className="text-sm text-muted-foreground mt-2">Drag & drop files or click to browse</p>
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

                {files.length > 0 && (
                  <div className="space-y-2">
                      <h4 className="text-sm font-medium">Selected Files:</h4>
                      <ul className="space-y-2 rounded-md border p-2">
                        {files.map((file, index) => (
                          <li key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                               <FileIcon className="h-4 w-4 shrink-0" />
                               <span className="truncate">{file.name}</span>
                               <span className="text-muted-foreground text-xs shrink-0">({formatBytes(file.size)})</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                  </div>
                )}

                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating Course...' : 'Create Course'}
                </Button>
                </form>
             </CardContent>
        </Card>
    </div>
  );
}
