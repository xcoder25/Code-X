
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCourseAction } from '@/app/actions';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// 1. Schema Definition
const courseFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.string().min(1),
});

// 2. Extend Schema to Include Files & Modules
type CourseFormData = z.infer<typeof courseFormSchema> & {
  files?: FileList | null;
  modules?: any[];
};

export default function CreateCourseForm() {
  const [loading, setLoading] = useState(false);
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

  // 3. Handle File Upload + Firestore Submission
  const onSubmit = async (data: CourseFormData) => {
    setLoading(true);

    try {
      let uploadedModules: { name: string, type: string, size: number, url: string }[] = [];

      if (data.files && data.files.length > 0) {
        const uploads = Array.from(data.files).map(async (file) => {
          const storageRef = ref(storage, `course_files/${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            url: url,
          };
        });

        uploadedModules = await Promise.all(uploads);
      }

      const courseData = {
        title: data.title,
        description: data.description,
        tags: data.tags,
        modules: uploadedModules,
      };

      // Call server action
      await createCourseAction(courseData);

      toast({
        title: 'Success!',
        description: 'Course created successfully!',
      });
      router.push('/admin/courses');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create course.',
      });
    } finally {
      setLoading(false);
    }
  };

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
                </div>

                <div>
                    <Label>Description</Label>
                    <Textarea rows={4} {...form.register('description')} placeholder="A comprehensive course covering..." />
                </div>

                 <div>
                    <Label>Tags</Label>
                    <Input {...form.register('tags')} placeholder="e.g., React, Next.js, TypeScript (comma-separated)" />
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
                        accept=".pdf,.doc,.docx,.mp4,.mov"
                        {...form.register('files')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    </div>
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating Course...' : 'Create Course'}
                </Button>
                </form>
             </CardContent>
        </Card>
    </div>
  );
}
