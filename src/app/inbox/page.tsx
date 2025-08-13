
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { Mail, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  title: string;
  body: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

const MessageCard = ({ message }: { message: Message }) => {
  const urls = message.body.match(urlRegex);
  const link = urls ? urls[0] : null;

  const cardContent = (
    <Card className={link ? 'hover:bg-muted/50 cursor-pointer transition-colors' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{message.title}</CardTitle>
                {message.createdAt && (
                <CardDescription>
                    {new Date(message.createdAt.seconds * 1000).toLocaleString()}
                </CardDescription>
                )}
            </div>
             {link && <LinkIcon className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message.body}</p>
      </CardContent>
    </Card>
  );

  if (link) {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg block">
            {cardContent}
        </a>
    )
  }

  return cardContent;
};

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // This query fetches all 'general' notifications for everyone.
    const messagesQuery = query(
      collection(db, 'in-app-messages'),
      where('targetType', '==', 'general'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
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
