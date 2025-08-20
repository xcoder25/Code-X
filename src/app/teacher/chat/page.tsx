
'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { useTeacherAuth } from '@/app/teacher-auth-provider';
import type { ChatMessage as ChatMessageType, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, User as UserIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Chat = {
  id: string;
  name: string;
  photoURL?: string | null;
}

const ChatPage: React.FC = () => {
  const { user } = useTeacherAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  useEffect(() => {
    async function fetchAdmins() {
        setLoadingAdmins(true);
        try {
            const adminsQuery = query(collection(db, 'admins'));
            const adminsSnap = await getDocs(adminsQuery);
            const adminsData = adminsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setAdmins(adminsData);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoadingAdmins(false);
        }
    }
    fetchAdmins();
  }, []);

  const handleSelectAdmin = (admin: User) => {
    if (!user) return;
    const chatId = getDirectMessageId(user.uid, admin.id);
    setSelectedChat({
        id: chatId,
        name: admin.displayName,
        photoURL: admin.photoURL
    });
  }

  return (
    <main className="flex flex-1 flex-col p-0 h-[calc(100vh-theme(spacing.14))] overflow-hidden">
      <div className="flex h-full border rounded-lg overflow-hidden relative">
          {user ? (
            <>
              <div className={cn(
                "w-full md:w-1/3 lg:w-1/4 flex flex-col transition-transform duration-300 ease-in-out border-r",
                selectedChat ? "-translate-x-full md:translate-x-0" : "translate-x-0"
              )}>
                 <div className="p-4 border-b">
                    <h1 className="font-semibold text-2xl">Chat with Admin</h1>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loadingAdmins ? (
                         [...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
                    ) : admins.map(admin => (
                         <Button
                            key={admin.id}
                            variant="ghost"
                            className="w-full justify-start h-14"
                            onClick={() => handleSelectAdmin(admin)}
                        >
                            <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={admin.photoURL || undefined} data-ai-hint="avatar person" />
                                <AvatarFallback>{admin.displayName?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{admin.displayName}</span>
                        </Button>
                    ))}
                 </div>
              </div>
              <div className={cn(
                  "absolute top-0 left-0 w-full h-full md:static md:w-2/3 lg:w-3/4 flex flex-col bg-background transition-transform duration-300 ease-in-out",
                  selectedChat ? "translate-x-0" : "translate-x-full md:translate-x-0"
              )}>
                 {selectedChat ? (
                    <ChatRoom chat={selectedChat} onBack={() => setSelectedChat(null)} />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Users className="h-16 w-16" />
                        <p className="mt-4">Select an admin to start a conversation</p>
                    </div>
                )}
              </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full w-full gap-4">
                <p className="text-muted-foreground">Loading teacher information...</p>
            </div>
          )}
        </div>
    </main>
  );
};

const getDirectMessageId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
}


interface ChatRoomProps {
  chat: Chat;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chat, onBack }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [formValue, setFormValue] = useState<string>('');
  const { user: teacherUser } = useTeacherAuth();

  const messagesRef = collection(db, 'direct-messages', chat.id, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

  useEffect(() => {
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessageType[];
      setMessages(msgs);
    }, (error) => {
      console.error(`Error fetching messages for ${chat.name}:`, error);
    });
    setMessages([]);
    return unsubscribe;
  }, [chat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teacherUser || formValue.trim() === '') return;

    const { uid, photoURL, displayName } = teacherUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });
    setFormValue('');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-2 border-b flex items-center gap-2">
        <Button onClick={onBack} variant="ghost" size="icon" className="md:hidden">
            <UserIcon className="h-5 w-5" />
        </Button>
         <Avatar className="h-10 w-10">
            <AvatarImage src={chat.photoURL || undefined} data-ai-hint="avatar person" />
            <AvatarFallback>{chat.name?.charAt(0) || 'A'}</AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold">{chat.name}</h3>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-muted/20">
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
        <Input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder={`Message ${chat.name}`}
          autoComplete="off"
        />
        <Button type="submit" disabled={!formValue.trim()}>
            <Send />
            <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { text, uid, photoURL, displayName } = message;
  const { user: teacherUser } = useTeacherAuth();
  const messageClass = uid === teacherUser?.uid ? 'sent' : 'received';

  return (
    <div className={cn('flex items-start gap-3 w-full', messageClass === 'sent' ? 'justify-end' : 'justify-start')}>
      {messageClass === 'received' && (
        <Avatar className="h-8 w-8">
            <AvatarImage src={photoURL || undefined} data-ai-hint="avatar person" />
            <AvatarFallback>{displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col" style={{ alignItems: messageClass === 'sent' ? 'flex-end' : 'flex-start' }}>
        {messageClass === 'received' && <p className="text-xs text-muted-foreground ml-2 mb-1">{displayName}</p>}
        <div className={cn('p-3 rounded-lg max-w-sm md:max-w-md shadow-sm', messageClass === 'sent' ? 'bg-primary text-primary-foreground' : 'bg-background')}>
            <p className="text-sm whitespace-pre-wrap">{text}</p>
        </div>
      </div>
      {messageClass === 'sent' && (
        <Avatar className="h-8 w-8">
            <AvatarImage src={photoURL || undefined} data-ai-hint="avatar person" />
            <AvatarFallback>{displayName?.charAt(0) || 'T'}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatPage;
