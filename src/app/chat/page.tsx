
'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { db, auth, googleProvider } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
} from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { ChatMessage as ChatMessageType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Main Page Component
const ChatPage: React.FC = () => {
  const [user] = useAuthState(auth);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
       <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-3xl">Community Chat</CardTitle>
                    <CardDescription>
                        Talk with other students in real-time.
                    </CardDescription>
                </div>
                {user && <SignOut />}
            </div>
        </CardHeader>
        <CardContent>
            {user ? <ChatRoom /> : <SignIn />}
        </CardContent>
       </Card>
    </main>
  );
};

// Sign-in component
const SignIn: React.FC = () => {
  const { toast } = useToast();
  const signInWithGoogle = () => {
    signInWithPopup(auth, googleProvider).catch((error) => {
        console.error(error);
        toast({
            variant: 'destructive',
            title: "Sign-in failed",
            description: "Could not sign in with Google. Please try again."
        })
    });
  };
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Please sign in to join the chat.</p>
        <Button onClick={signInWithGoogle}>Sign in with Google</Button>
    </div>
  )
};

// Sign-out component
const SignOut: React.FC = () => {
  return auth.currentUser && (
    <Button variant="ghost" onClick={() => auth.signOut()}>
        <LogOut className="mr-2" />
        Sign Out
    </Button>
  );
};

// Chat Room Component
const ChatRoom: React.FC = () => {
  const messagesEndRef = useRef<HTMLSpanElement>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [formValue, setFormValue] = useState<string>('');
  
  // Firestore messages reference
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt'));

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessageType[];
      setMessages(msgs);
    }, (error) => {
      console.error("Error fetching messages:", error)
    });
    return unsubscribe;
  }, []);

  // Auto-scroll to the latest message
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
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 border rounded-md">
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={messagesEndRef}></span>
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 pt-4">
        <Input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something nice"
        />
        <Button type="submit" disabled={!formValue}>🕊️</Button>
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
    <div className={`flex items-start gap-3 ${messageClass === 'sent' ? 'flex-row-reverse' : ''}`}>
       <Avatar>
         <AvatarImage src={photoURL || undefined} data-ai-hint="avatar person" />
         <AvatarFallback>{displayName?.charAt(0) || 'U'}</AvatarFallback>
       </Avatar>
      <div className={`p-3 rounded-lg max-w-xs ${messageClass === 'sent' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
};

export default ChatPage;
