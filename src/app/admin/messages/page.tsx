
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
import { Loader2, Send, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendMessageAction } from '@/app/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sendMessageFormSchema } from '@/app/schema';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

interface Message {
  id: string;
  title: string;
  body: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  targetType: 'general' | 'course' | 'user' | 'admin';
  courseId?: string;
  courseName?: string;
  userIds?: string[];
  senderName?: string;
}

const AudienceTag = ({ message }: { message: Message }) => {
    let text = 'General';
    let variant: "default" | "secondary" | "destructive" | "outline" | null | undefined = "secondary";
    if (message.targetType === 'course') {
        text = `Course: ${message.courseName}`;
    } else if (message.targetType === 'user') {
        text = 'Direct Message';
    } else if (message.targetType === 'admin') {
        text = `From: ${message.senderName || 'User'}`;
        variant = "default";
    }
  return <Badge variant={variant}>{text}</Badge>;
};

const MessageCard = ({ message }: { message: Message }) => {
  return (
    <Card className={message.targetType === 'admin' ? "border-l-4 border-primary" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{message.title}</CardTitle>
          <AudienceTag message={message} />
        </div>
        {message.createdAt && (
          <CardDescription>
            {new Date(message.createdAt.seconds * 1000).toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message.body}</p>
      </CardContent>
    </Card>
  );
};


export default function AdminMessagesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
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
      senderId: adminUser?.uid || 'admin',
      senderName: adminUser?.displayName || 'Admin',
    },
  });

  const targetType = useWatch({
    control: form.control,
    name: 'targetType',
  });

   useEffect(() => {
    const messagesQuery = query(collection(db, "in-app-messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(messagesData);
      setIsFeedLoading(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        setMessages([]);
        setIsFeedLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
        title: 'Message Sent!',
        description: 'Your message has been sent successfully.',
      });
      form.reset({
        title: '',
        body: '',
        targetType: 'general',
        courseId: '',
        userIds: [],
        senderId: adminUser?.uid || 'admin',
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
    <div className="flex-1 space-y-4 p-8 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-4 sticky top-6">
            <h2 className="text-3xl font-bold tracking-tight">Send Message</h2>
            <p className="text-muted-foreground">
                Compose and send a message to all users, a course, or specific people.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                    <CardTitle>Audience</CardTitle>
                    <CardDescription>
                        Choose who should receive this message.
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
                    <CardTitle>Message Details</CardTitle>
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
                        Send Message
                    </Button>
                    </CardFooter>
                </Card>
                </form>
            </Form>
        </div>
        <div className="lg:col-span-2 space-y-4">
             <h2 className="text-3xl font-bold tracking-tight">Message Feed</h2>
            <p className="text-muted-foreground">
                A live feed of all messages sent through the system.
            </p>
             <div className="space-y-4">
                {isFeedLoading ? (
                    [...Array(5)].map((_, i) => (
                        <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                        </Card>
                    ))
                    ) : messages.length > 0 ? (
                    messages.map((msg) => <MessageCard key={msg.id} message={msg} />)
                    ) : (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <Mail className="h-12 w-12 text-muted-foreground/50" />
                        <p>No messages have been sent yet.</p>
                        </CardContent>
                    </Card>
                    )}
                </div>
        </div>
    </div>
  );
}
