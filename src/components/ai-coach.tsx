'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { chatWithElaraAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/auth-provider';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AiCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userName = user?.displayName?.split(' ')[0] || "there";

  // Initial welcome message from Elara
  useEffect(() => {
    async function getInitialMessage() {
      if (messages.length > 0) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      try {
        const initialResponse = await chatWithElaraAction({
            userName,
            message: "Hello, introduce yourself!",
            history: [],
        });
        setMessages([{ role: 'model', content: initialResponse.reply }]);
      } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to connect with Elara. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    if (user) {
        getInitialMessage();
    }
  }, [userName, toast, user, messages.length]);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    const scrollDiv = scrollAreaRef.current?.querySelector('div');
    if (scrollDiv) {
      scrollDiv.scrollTo({
        top: scrollDiv.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithElaraAction({
        userName,
        message: currentInput,
        history: messages, // Pass the history *before* the new user message
      });

      const elaraMessage: Message = { role: 'model', content: response.reply };
      setMessages((prev) => [...prev, elaraMessage]);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
      });
      // remove the user message if the API fails
      setMessages(newMessages.slice(0, newMessages.length -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
                <Sparkles />
            </AvatarFallback>
        </Avatar>
        <div>
            <h3 className="text-lg font-semibold">Elara</h3>
            <p className="text-sm text-muted-foreground">Your Personal AI Coach</p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-6">
          {isLoading && messages.length === 0 && (
             <div className="flex items-start gap-3 justify-start">
                 <Avatar className="h-8 w-8">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot />
                   </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
             </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-8 w-8">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot />
                   </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                 <Avatar className="h-8 w-8">
                   <AvatarFallback>
                        <User />
                   </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && (
             <div className="flex items-start gap-3 justify-start">
                 <Avatar className="h-8 w-8">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot />
                   </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
             </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Elara for help..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !user}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
