
'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendNotificationAction } from '@/app/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const notificationFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  targetType: z.enum(['general', 'course', 'user'], { required_error: 'You must select a target audience.' }),
  courseId: z.string().optional(),
  userId: z.string().optional(),
}).refine(data => {
    if (data.targetType === 'course') return !!data.courseId;
    if (data.targetType === 'user') return !!data.userId;
    return true;
}, {
    message: 'A selection is required for this target type.',
    path: ['courseId'], // This path will be dynamically relevant
});


interface Course {
    id: string;
    title: string;
}

interface User {
    uid: string;
    displayName: string;
    email: string;
}

export default function AdminNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      title: '',
      message: '',
      targetType: 'general',
      courseId: '',
      userId: '',
    },
  });

  const targetType = useWatch({
    control: form.control,
    name: 'targetType',
  });

  useEffect(() => {
    async function fetchCourses() {
        const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
        const querySnapshot = await getDocs(coursesQuery);
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesData);
    }
     async function fetchUsers() {
        const usersQuery = query(collection(db, 'users'), orderBy('displayName'));
        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map(doc => ({ ...doc.data() } as User));
        setUsers(usersData);
    }

    if (targetType === 'course') {
        fetchCourses();
    } else if (targetType === 'user') {
        fetchUsers();
    }
  }, [targetType]);

  const onSubmit = async (values: z.infer<typeof notificationFormSchema>) => {
    setIsLoading(true);
    try {
      await sendNotificationAction(values);
      toast({
        title: 'Notification Sent!',
        description: 'Your message has been sent.',
      });
      form.reset();
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Send Notification</h2>
       <p className="text-muted-foreground">
        Compose and send a broadcast message to all students or a specific course.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Audience</CardTitle>
              <CardDescription>
                Choose who should receive this notification.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="general" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              General Announcement (All Users)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="course" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Course-specific Announcement
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="user" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Direct Message to a User
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {targetType === 'course' && (
                  <div className="pt-4">
                    <FormField
                      control={form.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Course</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course to notify" />
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
                  </div>
                )}
                 {targetType === 'user' && (
                  <div className="pt-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Select User</FormLabel>
                          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? users.find(
                                        (user) => user.uid === field.value
                                      )?.displayName
                                    : "Select user"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Search user..." />
                                <CommandEmpty>No user found.</CommandEmpty>
                                <CommandGroup>
                                  {users.map((user) => (
                                    <CommandItem
                                      value={user.displayName}
                                      key={user.uid}
                                      onSelect={() => {
                                        form.setValue("userId", user.uid);
                                        setPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          user.uid === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {user.displayName} ({user.email})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
              <CardDescription>
                The message will appear in the targeted student's notification inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New Course Available!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the announcement or update in detail."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                   <Send className="mr-2 h-4 w-4" />
                )}
                Send Notification
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
