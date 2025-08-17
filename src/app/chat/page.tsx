
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
  doc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { ChatMessage as ChatMessageType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Send, Hash, Users, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data for chat groups
const chatGroups = [
  { id: 'general', name: 'General Chat', icon: <Users /> },
  { id: 'web-dev', name: 'Web Development', icon: <Code /> },
  { id: 'python-intro', name: 'Intro to Python', icon: <Hash /> },
  { id: 'random', name: 'Random', icon: <Hash /> },
];

const ChatPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [selectedGroup, setSelectedGroup] = useState(chatGroups[0]);

  return (
    <main className="flex flex-1 flex-col p-4 md:p-0 h-[calc(100vh-theme(spacing.14))] overflow-hidden">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Community Chat</CardTitle>
              <CardDescription>Talk with other students in real-time.</CardDescription>
            </div>
            {user && <SignOut />}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          {user ? (
            <div className="flex h-full">
              <GroupList 
                groups={chatGroups} 
                selectedGroup={selectedGroup} 
                setSelectedGroup={setSelectedGroup} 
              />
              <ChatRoom group={selectedGroup} />
            </div>
          ) : (
            <SignIn />
          )}
        </CardContent>
      </Card>
    </main>
  );
};

// Sign-in component (unchanged)
const SignIn: React.FC = () => {
  const { toast } = useToast();
  const signInWithGoogle = () => {
    // Note: In a real app, you would likely use signInWithPopup, but that's already in your login flow.
    // This is a placeholder for the signed-out state.
    toast({ description: "Please log in to use the chat." });
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-muted-foreground">Please sign in to join the chat.</p>
      <Button onClick={signInWithGoogle}>Sign in to Chat</Button>
    </div>
  );
};

// Sign-out component (unchanged)
const SignOut: React.FC = () => {
  return auth.currentUser && (
    <Button variant="ghost" onClick={() => auth.signOut()}>
      <LogOut className="mr-2" />
      Sign Out
    </Button>
  );
};

interface GroupListProps {
    groups: typeof chatGroups;
    selectedGroup: typeof chatGroups[0];
    setSelectedGroup: (group: typeof chatGroups[0]) => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, selectedGroup, setSelectedGroup }) => {
    return (
        <div className="w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto p-2">
            <h2 className="p-2 text-lg font-semibold">Channels</h2>
            <nav className="flex flex-col gap-1">
                {groups.map((group) => (
                    <Button
                        key={group.id}
                        variant={selectedGroup.id === group.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedGroup(group)}
                    >
                        <div className="mr-2">{group.icon}</div>
                        {group.name}
                    </Button>
                ))}
            </nav>
        </div>
    );
};


interface ChatRoomProps {
  group: typeof chatGroups[0];
}

const ChatRoom: React.FC<ChatRoomProps> = ({ group }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [formValue, setFormValue] = useState<string>('');

  // Firestore messages reference, now pointing to a sub-collection
  const messagesRef = collection(db, 'groups', group.id, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

  useEffect(() => {
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessageType[];
      setMessages(msgs);
    }, (error) => {
      console.error(`Error fetching messages for ${group.name}:`, error);
    });
    // Reset messages when group changes
    setMessages([]);
    return unsubscribe;
  }, [group]);

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
      <div className="p-4 border-b">
         <h3 className="text-xl font-semibold">{group.name}</h3>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
        <Input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder={`Message #${group.name}`}
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

// Props interface for the ChatMessage component
interface ChatMessageProps {
  message: ChatMessageType;
}

// Single Message Component
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
        <div className={cn('p-3 rounded-lg max-w-sm md:max-w-md', messageClass === 'sent' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
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

    