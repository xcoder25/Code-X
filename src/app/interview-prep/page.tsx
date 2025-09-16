
'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '@/app/auth-provider';
import { interviewPrepAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Send, Sparkles, User, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const interviewSetupSchema = z.object({
  topic: z.string().min(2, 'Please enter a topic.'),
});

const InterviewPrepPage: React.FC = () => {
  const [interviewTopic, setInterviewTopic] = useState<string | null>(null);

  if (!interviewTopic) {
    return <InterviewSetupForm onStart={setInterviewTopic} />;
  }

  return <InterviewRoom topic={interviewTopic} />;
};

const InterviewSetupForm: React.FC<{ onStart: (topic: string) => void }> = ({ onStart }) => {
    const form = useForm<z.infer<typeof interviewSetupSchema>>({
        resolver: zodResolver(interviewSetupSchema),
        defaultValues: { topic: '' },
    });

    const onSubmit = (values: z.infer<typeof interviewSetupSchema>) => {
        onStart(values.topic);
    }
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 items-center justify-center">
      <Card className="w-full max-w-md">
         <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit">
                <GraduationCap className="h-8 w-8" />
            </div>
           <CardTitle className="text-2xl mt-4">AI Mock Interview</CardTitle>
           <CardDescription>
             Hone your skills by practicing a technical interview with an AI.
             Enter a topic below to get started.
           </CardDescription>
         </CardHeader>
         <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Interview Topic</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., React, Python, Data Structures..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full">
                        Start Interview
                    </Button>
                </form>
            </Form>
         </CardContent>
      </Card>
    </main>
  );
};


const InterviewRoom: React.FC<{ topic: string }> = ({ topic }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userName = user?.displayName?.split(' ')[0] || 'there';

  useEffect(() => {
    // Initial message from the AI interviewer
    async function startInterview() {
        setIsLoading(true);
        try {
            const response = await interviewPrepAction({
                userName,
                topic,
                message: "Let's start the interview.",
                history: [],
            });
            setMessages([{ role: 'model', content: response.reply }]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to start the interview. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }
    startInterview();
  }, [topic, userName, toast]);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    const scrollDiv = scrollAreaRef.current?.querySelector('div');
    if (scrollDiv) {
      scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await interviewPrepAction({
        userName,
        topic,
        message: currentInput,
        history: messages,
      });

      const aiMessage: Message = { role: 'model', content: response.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to get a response. Please try again.' });
      setMessages(newMessages.slice(0, newMessages.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <main className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-theme(spacing.14))]">
        <div className="flex items-center mb-4">
            <h1 className="font-semibold text-3xl">AI Interview Prep</h1>
        </div>
         <p className="text-muted-foreground mb-6">
            You are in a mock interview for a <span className="font-semibold text-foreground">{topic}</span> role.
        </p>
        <div className="flex-1 flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold">Alex</h3>
                    <p className="text-sm text-muted-foreground">AI Technical Interviewer</p>
                </div>
            </div>
            <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
                <div className="space-y-6">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                    {message.role === 'model' && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn('max-w-[75%] rounded-lg p-3 text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                        <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
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
                    placeholder="Your answer..."
                    className="flex-1"
                    disabled={isLoading || !user}
                />
                <Button type="submit" disabled={isLoading || !user}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
                </form>
            </div>
        </div>
    </main>
  );
};

export default InterviewPrepPage;
