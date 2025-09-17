
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherAuth } from '@/app/teacher-auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { createLiveClassAction } from '@/app/actions';


interface Course {
    id: string;
    title: string;
}

interface ScheduleEvent {
    id: string;
    title: string;
    courseTitle: string;
    date: Date;
    type: 'Assignment' | 'Exam' | 'Live Session';
    actionUrl?: string;
}

const liveClassFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  courseId: z.string().min(1, "Please select a course."),
  scheduledAt: z.date({ required_error: "A date is required."}),
  meetingUrl: z.string().url("Please enter a valid meeting URL."),
});

type LiveClassFormData = z.infer<typeof liveClassFormSchema>;

export default function TeacherSchedulePage() {
    const { user } = useTeacherAuth();
    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const form = useForm<LiveClassFormData>({
      resolver: zodResolver(liveClassFormSchema),
    });

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
        const unsubCourses = onSnapshot(coursesQuery, (snapshot) => {
            const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(coursesData);
        });

        const liveClassesQuery = query(collection(db, 'liveClasses'), orderBy('scheduledAt', 'asc'));
        const unsubLiveClasses = onSnapshot(liveClassesQuery, (snapshot) => {
            const liveClassEvents = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    courseTitle: data.courseTitle,
                    date: (data.scheduledAt as Timestamp).toDate(),
                    type: 'Live Session',
                    actionUrl: data.meetingUrl
                } as ScheduleEvent;
            });
            setSchedule(liveClassEvents);
            setLoading(false);
        });
        
        return () => {
          unsubCourses();
          unsubLiveClasses();
        }
    }, [user]);

    const onSubmit = async (data: LiveClassFormData) => {
      form.control.disabled = true;
      try {
        await createLiveClassAction(data);
        toast({ title: 'Success!', description: 'Live class has been scheduled.' });
        form.reset({ title: '', courseId: '', meetingUrl: '' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to schedule class.' });
      } finally {
        form.control.disabled = false;
      }
    };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Schedule Management</h1>
      </div>
       <p className="text-muted-foreground">
        View upcoming events and schedule new live classes for your students.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Live Classes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                            </TableRow>
                        ))
                    ) : schedule.length > 0 ? (
                        schedule.map((event) => (
                            <TableRow key={`${event.type}-${event.id}`}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{event.courseTitle}</TableCell>
                            <TableCell>{event.date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short'})}</TableCell>
                            <TableCell className="text-right">
                                {event.actionUrl && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={event.actionUrl} target="_blank">
                                            {event.type === 'Live Session' ? 'Join Session' : 'View Details'}
                                        </Link>
                                    </Button>
                                )}
                            </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            You have not scheduled any live classes yet.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Schedule a New Class</CardTitle>
                    <CardDescription>Fill out the form to add a new live session.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Q&A Session for Module 3" {...field} />
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
                                name="scheduledAt"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? format(field.value, "PPP") : ( <span>Pick a date</span> )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="meetingUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meeting Link</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://meet.google.com/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={form.control.disabled}>
                                {form.control.disabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Schedule Class
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
