
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { Mail } from 'lucide-react';


interface Message {
  id: string;
  title: string;
  body: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  targetType: 'general' | 'course' | 'user';
  courseId?: string;
  courseName?: string;
  userIds?: string[];
}

const AudienceTag = ({ message }: { message: Message }) => {
    let text = 'General';
    if (message.targetType === 'course') {
        text = `Course: ${message.courseName}`;
    } else if (message.targetType === 'user') {
        text = 'Direct Message';
    }

  return <Badge variant="secondary">{text}</Badge>;
};

const MessageCard = ({ message }: { message: Message }) => {
  return (
    <Card>
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


export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

   useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };
    
    // 1. Fetch user's enrolled courses
    const getEnrolledCourses = async () => {
        const enrollmentsQuery = query(collection(db, 'users', user.uid, 'enrollments'));
        const querySnapshot = await getDocs(enrollmentsQuery);
        return querySnapshot.docs.map(doc => doc.id);
    };

    const setupListener = async () => {
        const userEnrolledCourseIds = await getEnrolledCourses();
        
        // 2. Construct queries
        const generalQuery = query(
            collection(db, "in-app-messages"), 
            where("targetType", "==", "general")
        );
        
        const userSpecificQuery = query(
            collection(db, "in-app-messages"), 
            where("userIds", "array-contains", user.uid)
        );

        const courseSpecificQuery = userEnrolledCourseIds.length > 0 ? query(
            collection(db, "in-app-messages"),
            where("courseId", "in", userEnrolledCourseIds)
        ) : null;
        
        // 3. Listen to all relevant queries
        const unsubscribes = [
            onSnapshot(generalQuery, (snapshot) => updateMessages(snapshot.docs)),
            onSnapshot(userSpecificQuery, (snapshot) => updateMessages(snapshot.docs)),
        ];

        if (courseSpecificQuery) {
             unsubscribes.push(onSnapshot(courseSpecificQuery, (snapshot) => updateMessages(snapshot.docs)));
        }
        
        setLoading(false);
        
        const allMessages: { [id: string]: Message } = {};

        function updateMessages(docs: any[]) {
             docs.forEach(doc => {
                 allMessages[doc.id] = { id: doc.id, ...doc.data() } as Message;
             });

             const sortedMessages = Object.values(allMessages).sort(
                (a, b) => b.createdAt.seconds - a.createdAt.seconds
             );

             setMessages(sortedMessages);
        }

        return () => unsubscribes.forEach(unsub => unsub());
    }

    const unsubscribePromise = setupListener();

    return () => {
        unsubscribePromise.then(unsub => unsub && unsub());
    };
  }, [user]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Notifications</h1>
      </div>
       <p className="text-muted-foreground">
        Important messages and announcements from your admin will appear here.
      </p>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
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
              <p>Your inbox is empty.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
