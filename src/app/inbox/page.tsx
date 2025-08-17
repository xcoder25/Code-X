
'use client';

import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';
import { Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markMessagesAsRead } from '../actions';

interface Message {
  id: string;
  title: string;
  body: string;
  createdAt: Timestamp;
  readBy?: string[];
  targetType: 'general' | 'direct';
  userIds?: string[];
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const selectedMessageRef = useRef<Message | null>(null);

  useEffect(() => {
    selectedMessageRef.current = selectedMessage;
  }, [selectedMessage]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Query all messages and filter client-side to avoid index issues.
    const messagesQuery = query(
        collection(db, 'in-app-messages'),
        orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message);
        
        const userMessages = allMessages.filter(msg => {
            const isGeneral = msg.targetType === 'general';
            const isDirectToUser = Array.isArray(msg.userIds) && msg.userIds.includes(user.uid);
            return isGeneral || isDirectToUser;
        });

        setMessages(userMessages);

        if (loading) {
            if (userMessages.length > 0 && !selectedMessageRef.current) {
                setSelectedMessage(userMessages[0]);
            } else if (userMessages.length === 0) {
                setSelectedMessage(null);
            }
            setLoading(false);
        }
    }, (error) => {
        console.error("Error fetching messages:", error);
        if (loading) setLoading(false);
    });

    markMessagesAsRead(user.uid);

    return () => {
        unsubscribe();
    };
  }, [user, loading]);
  
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
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
                                {!isRead && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                                <div className={cn("flex-1 overflow-hidden", isRead && "pl-5")}>
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
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-4 h-full justify-center">
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
                         <button onClick={handleBackToList} className="md:hidden p-2 -ml-2">
                            <ArrowLeft />
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
                ) : !loading ? (
                    <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                       <div className="flex flex-col items-center gap-4">
                           <MessageCircle className="h-16 w-16 text-muted-foreground/30" />
                           <p>Select a message to read</p>
                       </div>
                    </div>
                ): null}
            </div>
       </div>
    </main>
  );
}
