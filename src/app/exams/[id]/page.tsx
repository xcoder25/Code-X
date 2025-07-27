
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Timer, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getExamQuestions, getExamDetails } from '@/lib/exam-data';
import { submitExamAction } from '@/app/actions';

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const examDetails = getExamDetails(params.id);
  const examQuestions = getExamQuestions(params.id);

  const [timeLeft, setTimeLeft] = useState(examDetails?.duration || 0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!examDetails) return;
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
  }, [examDetails]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitted || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitExamAction({ examId: params.id, answers });
      setScore(result.score);
      setIsSubmitted(true);
      toast({
        title: 'Exam Submitted!',
        description: `You scored ${result.score.toFixed(2)}%.`,
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
                    <p className="mt-2 text-muted-foreground">Your exam has been graded.</p>
                    <div className="mt-8 text-5xl font-extrabold text-primary">
                        {score.toFixed(2)}%
                    </div>
                    <Button onClick={() => router.push('/exams')} className="mt-8">
                       Return to Exams List
                    </Button>
                </div>
            ) : (
                <form className="space-y-8">
                {examQuestions.map((question: any, index: number) => (
                    <div key={question.id}>
                    <p className="font-semibold text-lg">{index + 1}. {question.text}</p>
                    <RadioGroup
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        className="mt-4 space-y-2"
                        disabled={isSubmitting || isSubmitted}
                    >
                        {question.options.map((option: string) => (
                        <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                            <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                        </div>
                        ))}
                    </RadioGroup>
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
