
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
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
    <Card className="border-l-4 border-primary">
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
  
  // In a real app, this would come from the user's profile in the database
  const userEnrolledCourseIds: string[] = []; 

   useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };
    
    const messagesQuery = query(
        collection(db, "in-app-messages"),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      
      const filteredMessages = messagesData.filter(msg => {
          if (msg.targetType === 'general') {
              return true;
          }
          if (msg.targetType === 'course' && msg.courseId) {
              return userEnrolledCourseIds.includes(msg.courseId);
          }
          if (msg.targetType === 'user' && msg.userIds) {
              return msg.userIds.includes(user.uid);
          }
          return false;
      })

      setMessages(filteredMessages);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        setMessages([]);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Inbox</h1>
      </div>
       <p className="text-muted-foreground">
        Important messages and announcements will appear here.
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
