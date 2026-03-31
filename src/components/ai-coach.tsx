'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, Send, Sparkles, User, Calendar, Target, Code } from 'lucide-react';
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

const initialMessage = `Hi there! My name is Elara, and I'm your AI learning coach here on the Code-X platform. I'm excited to help you on your coding journey! To best assist you, tell me, what are you hoping to learn or accomplish today?`;

export default function AiCoach({ hideHeader = false }: { hideHeader?: boolean }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{ role: 'model', content: initialMessage }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userName = user?.displayName?.split(' ')[0] || "there";

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
    const historyBefore = messages;
    setMessages([...messages, userMessage]);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/elara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: historyBefore,
        }),
      });

      if (!response.ok) throw new Error('Neural link failure.');

      // Prepare a new model message
      const elaraMessage: Message = { role: 'model', content: '' };
      setMessages((prev) => [...prev, elaraMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          // Update the last message (which is the model message)
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...elaraMessage, content: accumulatedContent };
            return next;
          });
        }
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Neural Link Error',
        description: 'Elara is temporarily out of sync. Please try again.',
      });
      setMessages(historyBefore);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", !hideHeader && "rounded-lg border bg-card text-card-foreground shadow-sm")}>
      {!hideHeader && (
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
      )}
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-6">
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
          {isLoading && (
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
      <div className="p-4 border-t space-y-4">
        {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                    onClick={() => {
                        setInput("Can you create a weekly study plan for me to learn React?");
                    }}
                >
                    <Calendar className="mr-2 h-3.5 w-3.5 text-primary" />
                    Generate Study Plan
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs rounded-full border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                    onClick={() => {
                        setInput("What are the most in-demand skills for a Fullstack Developer in 2024?");
                    }}
                >
                    <Target className="mr-2 h-3.5 w-3.5 text-purple-500" />
                    Market Insights
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs rounded-full border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
                    onClick={() => {
                        setInput("I need help understanding how React hooks work. Can you explain useEffect?");
                    }}
                >
                    <Code className="mr-2 h-3.5 w-3.5 text-blue-500" />
                    Explain Hooks
                </Button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Elara for help..."
            className="flex-1 rounded-full px-4"
            disabled={isLoading || !user}
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={isLoading || !user}>
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
