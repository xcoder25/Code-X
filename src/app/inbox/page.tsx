
'use client';

import { collection, query, orderBy, onSnapshot, where, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markMessagesAsRead } from '../actions';
import { useLoading } from '@/context/loading-provider';

interface Message {
  id: string;
  title: string;
  body: string;
  createdAt: Timestamp;
  readBy?: string[];
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const generalQuery = query(
        collection(db, 'in-app-messages'),
        where('targetType', '==', 'general'),
        orderBy('createdAt', 'desc')
    );

    const directQuery = query(
        collection(db, 'in-app-messages'),
        where('userIds', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
    );

    const unsubGeneral = onSnapshot(generalQuery, (generalSnapshot) => {
        const generalMessages = generalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message);
        
        // Now get the direct messages and combine them
        getDocs(directQuery).then(directSnapshot => {
             const directMessages = directSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message);
             
             const allMessages = [...generalMessages, ...directMessages];
             
             // Sort all messages by date
             const sortedMessages = allMessages.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

             // Remove duplicates that might occur if a message is both general and direct (unlikely but safe)
             const uniqueMessages = sortedMessages.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

             setMessages(uniqueMessages);

            if (uniqueMessages.length > 0 && !selectedMessage) {
                setSelectedMessage(uniqueMessages[0]);
            } else if (uniqueMessages.length === 0) {
                setSelectedMessage(null);
            }
            setLoading(false);
        });

    }, (error) => {
      console.error("Error fetching general messages:", error);
      setLoading(false);
    });

    // Mark messages as read when the component mounts
    markMessagesAsRead(user.uid);

    return () => {
        unsubGeneral();
    };
  }, [user, selectedMessage]);
  
  const handleSelectMessage = (message: Message) => {
    showLoading();
    setTimeout(() => {
        setSelectedMessage(message);
        hideLoading();
    }, 200); // Simulate network latency for a better UX
  }

  return (
    <main className="flex flex-1 flex-col md:p-0 h-[calc(100vh-theme(spacing.14))] overflow-hidden">
       <div className="flex h-full border rounded-lg">
            {/* Message List Pane */}
            <div className={cn("w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto", selectedMessage && "hidden md:block")}>
                <div className="p-4 border-b">
                    <h1 className="font-semibold text-2xl">Inbox</h1>
                    <p className="text-muted-foreground text-sm">All notifications</p>
                </div>
                {loading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                ) : messages.length > 0 ? (
                    <div className="p-2">
                        {messages.map((msg) => {
                            const isRead = user && msg.readBy ? msg.readBy.includes(user.uid) : false;
                            return (
                            <button
                                key={msg.id}
                                onClick={() => handleSelectMessage(msg)}
                                className={cn(
                                "w-full text-left p-3 rounded-md flex items-start gap-3 transition-colors",
                                selectedMessage?.id === msg.id ? "bg-muted" : "hover:bg-muted/50",
                                !isRead && "font-bold"
                                )}
                            >
                                {!isRead && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />}
                                <div className={cn("flex-1", isRead ? "pl-5" : "")}>
                                    <p className="truncate">{msg.title}</p>
                                    <p className={cn("text-xs text-muted-foreground truncate", !isRead && "text-foreground/80")}>
                                        {msg.body}
                                    </p>
                                </div>
                            </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <Mail className="h-12 w-12 text-muted-foreground/50" />
                        <p>Your inbox is empty.</p>
                    </div>
                )}
            </div>

            {/* Message Content Pane */}
             <div className={cn("flex-1 flex flex-col", !selectedMessage && "hidden md:flex")}>
                {selectedMessage ? (
                    <>
                    <div className="p-4 border-b flex items-start gap-4">
                         <button onClick={() => setSelectedMessage(null)} className="md:hidden p-2 -ml-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        </button>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold">{selectedMessage.title}</h2>
                            <p className="text-sm text-muted-foreground">
                                {new Date(selectedMessage.createdAt.seconds * 1000).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                    </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                       <div className="flex flex-col items-center gap-4">
                           <MessageCircle className="h-16 w-16 text-muted-foreground/30" />
                           <p>Select a message to read</p>
                       </div>
                    </div>
                )}
            </div>
       </div>
    </main>
  );
}
