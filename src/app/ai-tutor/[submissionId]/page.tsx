
'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '@/app/auth-provider';
import { tutorMe } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Send, Sparkles, User, GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ExamSubmission {
    examId: string;
    examTitle: string;
    answers: Record<string, string>;
}

interface Question {
    id: string;
    text: string;
}

interface AITutorPageProps {
  params: {
    submissionId: string;
  };
}

const AITutorPage: React.FC<AITutorPageProps> = ({ params }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  const [submission, setSubmission] = useState<ExamSubmission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userName = user?.displayName?.split(' ')[0] || 'Student';

  // Fetch submission and exam data
  useEffect(() => {
    if (!user) return;
    const { submissionId } = params;

    async function fetchData() {
        try {
            const submissionDocRef = doc(db, 'users', user.uid, 'examSubmissions', submissionId);
            const submissionSnap = await getDoc(submissionDocRef);

            if (!submissionSnap.exists()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Exam submission not found.' });
                setPageLoading(false);
                return;
            }
            const subData = submissionSnap.data() as ExamSubmission;
            setSubmission(subData);

            const questionsQuery = collection(db, 'exams', subData.examId, 'questions');
            const questionsSnap = await getDocs(questionsQuery);
            const qData = questionsSnap.docs.map(d => ({id: d.id, ...d.data()} as Question));
            setQuestions(qData);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: 'Failed to load exam data.' });
        }
    }
    fetchData();
  }, [user, params, toast]);

  // Initial message from the AI tutor
  useEffect(() => {
    if (!submission || questions.length === 0) return;

    async function startTutorSession() {
        setIsLoading(true);
        setPageLoading(false);
        try {
            const response = await tutorMe({
                userName,
                examTitle: submission.examTitle,
                questions,
                studentAnswers: submission.answers,
                message: "Please analyze my exam performance and give me a study plan.",
                history: [],
            });
            setMessages([{ role: 'model', content: response.reply }]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to start the tutor session. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }
    startTutorSession();
  }, [submission, questions, userName, toast]);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    const scrollDiv = scrollAreaRef.current?.querySelector('div');
    if (scrollDiv) {
      scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !submission) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await tutorMe({
        userName,
        examTitle: submission.examTitle,
        questions,
        studentAnswers: submission.answers,
        message: currentInput,
        history: messages,
      });

      const aiMessage: Message = { role: 'model', content: response.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to get a response. Please try again.' });
       setMessages(prev => prev.slice(0, prev.length -1)); // remove user message on failure
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
      return (
          <main className="flex flex-1 flex-col p-4 md:p-6 items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading your tutoring session...</p>
          </main>
      )
  }

  if (!submission) {
    return (
        <main className="flex flex-1 flex-col p-4 md:p-6 items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-muted-foreground">Could not load tutoring session.</p>
             <Button onClick={() => router.push('/exams')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Exams
            </Button>
        </main>
    )
  }

  return (
     <main className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-theme(spacing.14))]">
        <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/exams')}>
                <ArrowLeft />
            </Button>
            <div>
                <h1 className="font-semibold text-3xl">AI Exam Tutor</h1>
                <p className="text-muted-foreground">
                    Reviewing your performance on: <span className="font-semibold text-foreground">{submission.examTitle}</span>
                </p>
            </div>
        </div>
        <div className="flex-1 flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot /></AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold">Professor Alex</h3>
                    <p className="text-sm text-muted-foreground">Your Personal AI Tutor</p>
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
                    <div className={cn('prose prose-sm dark:prose-invert max-w-[75%] rounded-lg p-3 text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground prose-p:text-primary-foreground' : 'bg-muted')}>
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
                    placeholder="Ask a follow-up question..."
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

export default AITutorPage;
