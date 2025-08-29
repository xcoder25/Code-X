
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Timer, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { submitExamAction } from '@/app/actions';
import { doc, getDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/app/auth-provider';

interface ExamDetails {
    id: string;
    title: string;
    course: string;
    duration: number; // in seconds
}

interface Question {
    id: string;
    text: string;
}

export default function ExamTakingPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!examId) return;

    const examRef = doc(db, 'exams', examId);
    const unsubscribeExam = onSnapshot(examRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const details = {
                id: docSnap.id,
                title: data.title,
                course: data.courseTitle,
                duration: data.duration,
            };
            setExamDetails(details);
            setTimeLeft(details.duration);
        } else {
            setExamDetails(null);
        }
        setLoading(false);
    });

    const questionsRef = collection(db, 'exams', examId, 'questions');
    const unsubscribeQuestions = onSnapshot(questionsRef, (querySnapshot) => {
        const questionsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                text: data.text,
            } as Question;
        });
        setExamQuestions(questionsData);
    });

    return () => {
        unsubscribeExam();
        unsubscribeQuestions();
    };

  }, [examId]);

  useEffect(() => {
    if (!examDetails || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examDetails, isSubmitted]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting || !user) return;

    setIsSubmitting(true);
    try {
      await submitExamAction({ examId, answers, userId: user.uid });
      setIsSubmitted(true);
      toast({
        title: 'Exam Submitted!',
        description: 'Your answers have been saved for review.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error submitting exam',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
     return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <Card>
                <CardHeader><Skeleton className="h-10 w-3/4" /></CardHeader>
                <CardContent className="space-y-8">
                     {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                     ))}
                </CardContent>
            </Card>
        </main>
     )
  }

  if (!examDetails) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Exam Not Found</h1>
        <p className="text-muted-foreground">This exam does not exist or is unavailable.</p>
        <Button onClick={() => router.push('/exams')} className="mt-6">
          Back to Exams
        </Button>
      </main>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / examDetails.duration) * 100;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">{examDetails.title}</CardTitle>
              <CardDescription>{examDetails.course}</CardDescription>
            </div>
             <div className="flex items-center gap-2 text-lg font-semibold">
                <Timer className="h-6 w-6" />
                <span>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
             </div>
          </div>
            <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
            {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="w-24 h-24 text-green-500" />
                    <h2 className="mt-6 text-3xl font-bold">Submission Successful!</h2>
                    <p className="mt-2 text-muted-foreground">Your answers have been submitted for review.</p>
                    <Button onClick={() => router.push('/exams')} className="mt-8">
                       Return to Exams List
                    </Button>
                </div>
            ) : (
                <form className="space-y-8">
                {examQuestions.map((question, index) => (
                    <div key={question.id}>
                      <Label htmlFor={`q-${question.id}`} className="font-semibold text-lg">{index + 1}. {question.text}</Label>
                      <Textarea
                        id={`q-${question.id}`}
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mt-2"
                        placeholder="Type your answer here..."
                        rows={5}
                        disabled={isSubmitting || isSubmitted}
                      />
                    </div>
                ))}
                </form>
            )}
        </CardContent>
        {!isSubmitted && (
            <CardFooter>
            <Button onClick={handleSubmit} disabled={isSubmitting || isSubmitted}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
            </CardFooter>
        )}
      </Card>
    </main>
  );
}
