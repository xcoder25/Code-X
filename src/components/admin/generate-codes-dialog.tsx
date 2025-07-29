
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAccessCodesAction } from '@/app/actions';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const generateCodesSchema = z.object({
  courseId: z.string().min(1, "Course is required."),
  prefix: z.string().optional(),
  quantity: z.number().min(1).max(100),
  maxRedemptions: z.number().min(1),
});

interface Course {
    id: string;
    title: string;
}

export default function GenerateCodesDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof generateCodesSchema>>({
    resolver: zodResolver(generateCodesSchema),
    defaultValues: {
      courseId: '',
      prefix: '',
      quantity: 10,
      maxRedemptions: 1,
    },
  });

  useEffect(() => {
    async function fetchCourses() {
        if (isOpen) {
            const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
            const querySnapshot = await getDocs(coursesQuery);
            const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(coursesData);
        }
    }
    fetchCourses();
  }, [isOpen]);

  const onSubmit = async (values: z.infer<typeof generateCodesSchema>) => {
    setIsLoading(true);
    try {
        const result = await generateAccessCodesAction(values);
        if (result.success) {
            toast({
                title: 'Codes Generated!',
                description: `${result.count} new access codes have been created.`,
            });
            setIsOpen(false);
            form.reset();
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to generate codes.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Access Codes</DialogTitle>
          <DialogDescription>
            Create batch codes for a specific course.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
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
                    name="prefix"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Code Prefix (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., BOOTCAMP-FALL" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Quantity: {field.value}</FormLabel>
                        <FormControl>
                             <Slider
                                onValueChange={(value) => field.onChange(value[0])}
                                defaultValue={[field.value]}
                                max={100}
                                step={1}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="maxRedemptions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Max Redemptions per Code</FormLabel>
                        <FormControl>
                             <Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

