
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, File as FileIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createCourseAction } from '@/app/actions';
import { Separator } from '@/components/ui/separator';

const courseFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  tags: z.string().min(1, 'Please add at least one tag (comma-separated).'),
  modules: z.array(z.any()).optional(), // Will handle file validation separately
});

export default function NewCoursePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      modules: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };


  const onSubmit = async (values: z.infer<typeof courseFormSchema>) => {
    setIsLoading(true);
    // In a real app, you would upload files to a service like Firebase Storage
    // and get back URLs. For now, we'll just pass file names and metadata.
    const moduleData = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
    }));
    
    try {
        const result = await createCourseAction({ ...values, modules: moduleData });
        if (result.success) {
            toast({
                title: 'Course Created!',
                description: `The course "${values.title}" has been successfully created.`,
            });
            router.push('/admin/courses');
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Creating Course",
            description: error.message || "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Create New Course</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Fill in the information for the new course or bootcamp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced JavaScript" {...field} />
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
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the course content, goals, and target audience."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Web Development, Frontend, JavaScript" {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Enter tags separated by commas.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
               <div className="space-y-4">
                <FormLabel>Course Modules</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Upload your course materials in PDF or DOCX format.
                </p>
                <FormControl>
                    <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2">Drag & drop files here, or click to select files</p>
                        <Input
                            type="file"
                            multiple
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </FormControl>
                {files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Files:</h4>
                    <ul className="divide-y divide-border rounded-md border">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2">
                           <div className="flex items-center gap-2">
                             <FileIcon className="h-5 w-5 text-muted-foreground" />
                             <span className="text-sm">{file.name}</span>
                           </div>
                           <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Course
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
