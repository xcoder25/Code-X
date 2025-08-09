
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
import { sendMessageAction } from '@/app/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sendMessageFormSchema } from '@/app/schema';
import { useAdminAuth } from '@/app/admin-auth-provider';

interface Course {
  id: string;
  title: string;
}

interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export default function AdminMessagesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();
  const { user: adminUser } = useAdminAuth();

  const form = useForm<z.infer<typeof sendMessageFormSchema>>({
    resolver: zodResolver(sendMessageFormSchema),
    defaultValues: {
      title: '',
      body: '',
      targetType: 'general',
      courseId: '',
      userIds: [],
    },
  });
  
  useEffect(() => {
    if (adminUser) {
        form.reset({
            ...form.getValues(),
            senderId: adminUser.uid,
            senderName: adminUser.displayName || 'Admin',
        });
    }
  }, [adminUser, form]);


  const targetType = useWatch({
    control: form.control,
    name: 'targetType',
  });

  useEffect(() => {
    async function fetchCourses() {
      setIsFetching(true);
      try {
        const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
        const querySnapshot = await getDocs(coursesQuery);
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({ variant: 'destructive', title: 'Error fetching courses' });
      } finally {
        setIsFetching(false);
      }
    }

    async function fetchUsers() {
      setIsFetching(true);
      try {
        const usersQuery = query(collection(db, 'users'), orderBy('displayName'));
        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({ variant: 'destructive', title: 'Error fetching users' });
      } finally {
        setIsFetching(false);
      }
    }

    if (targetType === 'course') fetchCourses();
    else if (targetType === 'user') fetchUsers();
  }, [targetType, toast]);

  const onSubmit = async (values: z.infer<typeof sendMessageFormSchema>) => {
    setIsLoading(true);
    try {
      await sendMessageAction(values);
      toast({
        title: 'Notification Sent!',
        description: 'Your message has been sent successfully.',
      });
      form.reset({
        title: '',
        body: '',
        targetType: 'general',
        courseId: '',
        userIds: [],
        senderId: adminUser?.uid,
        senderName: adminUser?.displayName || 'Admin',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Send Notification</h2>
        <p className="text-muted-foreground">
            Compose and send a notification to all users, a course, or specific people.
        </p>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
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
                            onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('userIds', []);
                            form.setValue('courseId', '');
                            }}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                        >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="general" />
                            </FormControl>
                            <FormLabel className="font-normal">General Announcement</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="course" />
                            </FormControl>
                            <FormLabel className="font-normal">Course-specific</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="user" />
                            </FormControl>
                            <FormLabel className="font-normal">User-specific</FormLabel>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFetching}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder={isFetching ? 'Loading courses...' : 'Select a course'} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.title}
                                </SelectItem>
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
                        name="userIds"
                        render={() => (
                            <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Select Users</FormLabel>
                            </div>
                            <ScrollArea className="h-72 w-full rounded-md border">
                                <div className="p-4">
                                {isFetching && <p>Loading users...</p>}
                                {users.map((user) => (
                                    <FormField
                                    key={user.uid}
                                    control={form.control}
                                    name="userIds"
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={user.uid}
                                            className="flex flex-row items-center space-x-3 space-y-0 mb-4"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(user.uid)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), user.uid])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== user.uid
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.photoURL} alt={user.displayName} data-ai-hint="avatar person" />
                                                    <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <FormLabel className="font-normal cursor-pointer">
                                                {user.displayName || user.email}
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                                </div>
                            </ScrollArea>
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
                <CardTitle>Notification Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., New Course Available!" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Body</FormLabel>
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
