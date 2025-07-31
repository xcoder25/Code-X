
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { Mail, PlusCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendMessageAction } from '../actions';
import { useToast } from '@/hooks/use-toast';


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
  senderId?: string;
}

const AudienceTag = ({ message, currentUserId }: { message: Message, currentUserId: string | null }) => {
    let text = 'General';
    let variant: "default" | "secondary" | "destructive" | "outline" | null | undefined = "secondary";
    
    if (message.targetType === 'course') {
        text = `Course: ${message.courseName}`;
    } else if (message.targetType === 'user' || message.senderId === currentUserId) {
        text = 'Direct Message';
    } else if (message.targetType === 'admin') {
        text = `From: ${message.senderName || 'User'}`;
    }

  return <Badge variant={variant}>{text}</Badge>;
};

const MessageCard = ({ message, currentUserId }: { message: Message, currentUserId: string | null }) => {
  const isFromAdmin = message.targetType !== 'admin';
  return (
    <Card className={!isFromAdmin ? 'border-l-4 border-primary' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{message.title}</CardTitle>
          <AudienceTag message={message} currentUserId={currentUserId} />
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


const ComposeMessageDialog = () => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
            return;
        }
        setIsLoading(true);
        try {
            await sendMessageAction({
                title,
                body,
                targetType: 'admin',
            });
            toast({ title: 'Message Sent!', description: 'Your message has been sent to the admin.' });
            setOpen(false);
            setTitle('');
            setBody('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Compose Message
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Send a Message to Admin</DialogTitle>
                        <DialogDescription>
                            Have a question or need help? Send a message directly to the site administrator.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Subject
                            </Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="body" className="text-right">
                                Message
                            </Label>
                            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                             {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Send className="mr-2 h-4 w-4" /> )}
                            Send
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

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
    
    // This query is intentionally broad for the demo. 
    // A more complex query would be needed to fetch messages based on user's courses.
    const messagesQuery = query(
        collection(db, "in-app-messages"),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      
      // Client-side filtering
      const filteredMessages = messagesData.filter(msg => {
          // General announcements
          if (msg.targetType === 'general') return true;
          // Messages for courses the user is in
          if (msg.targetType === 'course' && msg.courseId && userEnrolledCourseIds.includes(msg.courseId)) return true;
          // Messages sent directly to this user
          if (msg.targetType === 'user' && msg.userIds && msg.userIds.includes(user.uid)) return true;
          // Messages sent *by* this user
          if (msg.senderId === user.uid) return true;
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
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Inbox</h1>
        {user && <ComposeMessageDialog />}
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
          messages.map((msg) => <MessageCard key={msg.id} message={msg} currentUserId={user?.uid || null} />)
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
