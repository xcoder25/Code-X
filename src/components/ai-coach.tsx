'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Bot, Loader2, Send, Sparkles, User, Volume2, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { chatWithElaraAction } from '@/app/actions';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/auth-provider';

interface Message {
  role: 'user' | 'model';
  content: string;
  audioUrl?: string;
}

const initialMessage = `Hi there! My name is Elara, and I'm your AI learning coach here on the Code-X platform. I'm excited to help you on your coding journey! To best assist you, tell me, what are you hoping to learn or accomplish today?`;

export default function AiCoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{ role: 'model', content: initialMessage }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userName = user?.displayName?.split(' ')[0] || "there";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  useEffect(() => {
    // Audio player singleton
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setCurrentlyPlaying(null);
    }
  }, []);
  
  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      if (currentlyPlaying === audioUrl) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentlyPlaying(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentlyPlaying(audioUrl);
      }
    }
  };

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    const scrollDiv = scrollAreaRef.current?.querySelector('div');
    if (scrollDiv) {
      scrollDiv.scrollTo({
        top: scrollDiv.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // We pass the history *before* the new user message
      const response = await chatWithElaraAction({
        userName,
        message: currentInput,
        history: messages,
      });

      const audioResponse = await textToSpeech({ text: response.reply });

      const elaraMessage: Message = { 
        role: 'model', 
        content: response.reply,
        audioUrl: audioResponse.audioUrl,
      };
      setMessages((prev) => [...prev, elaraMessage]);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
      });
      // remove the user message if the API fails
      setMessages(prev => prev.slice(0, prev.length - 1));
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
                  'max-w-[75%] rounded-lg p-3 text-sm prose dark:prose-invert',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground prose-p:text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.audioUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => playAudio(message.audioUrl!)}
                    className="mt-2 h-7 w-7 text-muted-foreground"
                  >
                    {currentlyPlaying === message.audioUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
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
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Elara for help..."
            className="flex-1"
            disabled={isLoading || !user}
          />
          <Button type="submit" disabled={isLoading || !user || !input.trim()}>
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
