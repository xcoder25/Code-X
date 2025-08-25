
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
  collectionGroup,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { ChatMessage as ChatMessageType, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Send, Hash, Users, Code, ArrowLeft, User as UserIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for chat groups
const chatGroups = [
  { id: 'python-intro', name: 'Intro to Python', icon: <Hash className="h-5 w-5" /> },
];

type Chat = {
  id: string;
  name: string;
  type: 'group' | 'dm';
  icon?: React.ReactNode;
  photoURL?: string | null;
}

const ChatPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  return (
    <main className="flex flex-1 flex-col p-0 h-[calc(100vh-theme(spacing.14))] overflow-hidden">
      <div className="flex h-full border rounded-lg overflow-hidden relative">
          {user ? (
            <>
              <div className={cn(
                "w-full md:w-1/3 lg:w-1/4 flex flex-col transition-transform duration-300 ease-in-out",
                selectedChat ? "-translate-x-full md:translate-x-0" : "translate-x-0"
              )}>
                  <ChatList onSelectChat={setSelectedChat} />
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
                        <p className="mt-4">Select a chat to start messaging</p>
                    </div>
                )}
              </div>
            </>
          ) : (
            <SignIn />
          )}
        </div>
    </main>
  );
};

// Sign-in component
const SignIn: React.FC = () => {
  const { toast } = useToast();
  const signInWithGoogle = () => {
    toast({ description: "Please log in to use the chat." });
  };
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4">
      <p className="text-muted-foreground">Please sign in to join the chat.</p>
      <Button onClick={signInWithGoogle}>Sign in to Chat</Button>
    </div>
  );
};

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  return (
    <div className="flex flex-col h-full border-r">
       <div className="p-4 border-b">
        <h1 className="font-semibold text-2xl">Community Chat</h1>
      </div>
      <Tabs defaultValue="groups" className="flex flex-col flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {chatGroups.map((group) => (
              <Button
                key={group.id}
                variant="ghost"
                className="w-full justify-start h-14"
                onClick={() => onSelectChat({ ...group, type: 'group' })}
              >
                 <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{group.icon}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{group.name}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="people" className="flex-1 overflow-y-auto">
            <ClassmatesList onSelectUser={(user) => onSelectChat({
                id: getDirectMessageId(auth.currentUser!.uid, user.id),
                name: user.displayName,
                photoURL: user.photoURL,
                type: 'dm'
            })}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const ClassmatesList: React.FC<{ onSelectUser: (user: User) => void }> = ({ onSelectUser }) => {
    const [user] = useAuthState(auth);
    const [classmates, setClassmates] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const pythonCourseId = 'intro-to-python';

    useEffect(() => {
        async function fetchClassmates(currentUser: import('firebase/auth').User) {
            setLoading(true);
            try {
                // Fetch all enrollments for the "Intro to Python" course
                const enrollmentsQuery = query(collectionGroup(db, 'enrollments'), where('courseId', '==', pythonCourseId));
                const enrollmentsSnap = await getDocs(enrollmentsQuery);
                
                // Get the unique user IDs from those enrollments
                const userIds = Array.from(new Set(enrollmentsSnap.docs.map(doc => doc.ref.parent.parent!.id)));

                if (userIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch the user documents for all those user IDs
                const usersQuery = query(collection(db, 'users'), where('uid', 'in', userIds));
                const userDocsSnap = await getDocs(usersQuery);
                
                // Map to User objects and filter out the current user
                const usersData = userDocsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as User))
                    .filter(u => u.id !== currentUser.uid);
                
                setClassmates(usersData);
            } catch (error) {
                console.error("Error fetching classmates:", error);
            } finally {
                setLoading(false);
            }
        }
        
        if (user) {
            fetchClassmates(user);
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <div className="p-2 space-y-1">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
    }

    if (classmates.length === 0) {
        return <div className="text-center p-8 text-muted-foreground text-sm">No classmates found in the Intro to Python course.</div>;
    }

    return <div className="p-2 space-y-1">
        {classmates.map((classmate) => (
            <Button
                key={classmate.id}
                variant="ghost"
                className="w-full justify-start h-14"
                onClick={() => onSelectUser(classmate)}
            >
                <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={classmate.photoURL || undefined} data-ai-hint="avatar person" />
                    <AvatarFallback>{classmate.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{classmate.displayName}</span>
            </Button>
        ))}
    </div>
}

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

  const collectionPath = chat.type === 'group' 
    ? ['groups', chat.id, 'messages'] 
    : ['direct-messages', chat.id, 'messages'];
  
  const messagesRef = collection(db, ...collectionPath);
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
    if (!auth.currentUser || formValue.trim() === '') return;

    const { uid, photoURL, displayName } = auth.currentUser;

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
            <ArrowLeft className="h-5 w-5" />
        </Button>
         <Avatar className="h-10 w-10">
            {chat.type === 'group' ? (
                <AvatarFallback>{chat.icon || <Users />}</AvatarFallback>
            ) : (
                <>
                <AvatarImage src={chat.photoURL || undefined} data-ai-hint="avatar person" />
                <AvatarFallback>{chat.name?.charAt(0) || 'U'}</AvatarFallback>
                </>
            )}
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
          placeholder={`Message ${chat.type === 'group' ? '#' : ''}${chat.name}`}
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
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

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
            <AvatarFallback>{displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatPage;
