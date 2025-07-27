
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
import { AlertCircle, CheckCircle, Timer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const exams: { [key: string]: any } = {
  'mid-term-exam': {
    id: 'mid-term-exam',
    title: 'Mid-term Exam',
    course: 'Web Development Bootcamp',
    duration: 3600, // 60 minutes in seconds
    questions: [
      {
        id: 'q1',
        text: 'What is the correct HTML for referring to an external style sheet?',
        options: [
          '<style src="mystyle.css">',
          '<stylesheet>mystyle.css</stylesheet>',
          '<link rel="stylesheet" type="text/css" href="mystyle.css">',
        ],
        correctAnswer: '<link rel="stylesheet" type="text/css" href="mystyle.css">',
      },
      {
        id: 'q2',
        text: 'Which property is used to change the background color?',
        options: ['color', 'bgcolor', 'background-color'],
        correctAnswer: 'background-color',
      },
       {
        id: 'q3',
        text: 'How do you write "Hello World" in an alert box?',
        options: ['msg("Hello World");', 'alert("Hello World");', 'alertBox("Hello World");'],
        correctAnswer: 'alert("Hello World");',
      },
    ],
  },
};

export default function ExamTakingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const exam = exams[params.id];
  
  const [timeLeft, setTimeLeft] = useState(exam?.duration || 0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
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
  }, []);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    let correctAnswers = 0;
    exam.questions.forEach((q: any) => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = (correctAnswers / exam.questions.length) * 100;
    setScore(finalScore);
    setIsSubmitted(true);
     toast({
        title: 'Exam Submitted!',
        description: `You scored ${finalScore.toFixed(2)}%.`,
    });
  };

  if (!exam) {
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
  const progress = (timeLeft / exam.duration) * 100;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">{exam.title}</CardTitle>
              <CardDescription>{exam.course}</CardDescription>
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
                {exam.questions.map((question: any, index: number) => (
                    <div key={question.id}>
                    <p className="font-semibold text-lg">{index + 1}. {question.text}</p>
                    <RadioGroup
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        className="mt-4 space-y-2"
                        disabled={isSubmitted}
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
            <Button onClick={handleSubmit} disabled={isSubmitted}>
                Submit Exam
            </Button>
            </CardFooter>
        )}
      </Card>
    </main>
  );
}
