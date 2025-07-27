'use client';

import { useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Card,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Code, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { analyzeCodeAction } from '@/app/actions';
import type { AnalyzeCodeOutput } from '@/ai/flows/analyze-code';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  defaultCode: string;
}

interface ChallengeInterfaceProps {
  challenge: Challenge;
}

export default function ChallengeInterface({
  challenge,
}: ChallengeInterfaceProps) {
  const [code, setCode] = useState(challenge.defaultCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeCodeOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      toast({
        title: 'Success!',
        description: 'Your solution was correct.',
      });
    }, 1500);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeCodeAction({ code });
      setAnalysis(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to analyze code. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1 rounded-lg border h-full"
    >
      <ResizablePanel defaultSize={40}>
        <div className="flex h-full flex-col p-4 overflow-y-auto">
          <CardHeader className="p-2">
            <CardTitle className="text-2xl">{challenge.title}</CardTitle>
            <div className="flex items-center gap-2 pt-2">
              <Badge
                variant={
                  challenge.difficulty === 'Easy'
                    ? 'secondary'
                    : challenge.difficulty === 'Medium'
                    ? 'default'
                    : challenge.difficulty === 'Sandbox'
                    ? 'outline'
                    : 'destructive'
                }
              >
                {challenge.difficulty}
              </Badge>
              {isCompleted && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-2 flex-1">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {challenge.description}
            </p>

            {(isAnalyzing || analysis) && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Code Analysis
                  </CardTitle>
                  <CardDescription>
                    Here's what our AI assistant thinks of your code.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                     <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     </div>
                  ) : analysis ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Explanation</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.explanation}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Feedback</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.feedback}</p>
                        </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

          </CardContent>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={60}>
        <div className="flex flex-col h-full">
          <div className="p-2 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Code size={16} /> Solution
            </h3>
          </div>
          <div className="flex-1 relative">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="absolute inset-0 w-full h-full resize-none rounded-none border-none font-mono text-sm bg-muted/30"
            />
          </div>
          <div className="p-2 border-t flex justify-end gap-2 items-center">
            {isCompleted && (
              <Alert className="border-green-500/50 text-green-700 dark:text-green-400 w-full text-left bg-green-500/10">
                <CheckCircle className="h-4 w-4 !text-green-700 dark:!text-green-400" />
                <AlertTitle>Congratulations!</AlertTitle>
                <AlertDescription>
                  You've successfully completed this challenge.
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleAnalyze} variant="outline" disabled={isAnalyzing}>
                {isAnalyzing ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                    </>
                ) : (
                    <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Code
                    </>
                )}
            </Button>
            {challenge.difficulty !== 'Sandbox' && (
                <Button onClick={handleSubmit} disabled={isSubmitting || isCompleted}>
                {isSubmitting ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                    </>
                ) : 'Submit Solution'}
                </Button>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
