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
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Code, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1 rounded-lg border"
    >
      <ResizablePanel defaultSize={40}>
        <div className="flex h-full flex-col p-4">
          <CardHeader className="p-2">
            <CardTitle className="text-2xl">{challenge.title}</CardTitle>
            <div className="flex items-center gap-2 pt-2">
              <Badge
                variant={
                  challenge.difficulty === 'Easy'
                    ? 'secondary'
                    : challenge.difficulty === 'Medium'
                    ? 'default'
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
          <CardContent className="p-2 flex-1 overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {challenge.description}
            </p>
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
            <Button onClick={handleSubmit} disabled={isSubmitting || isCompleted}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : 'Submit Solution'}
            </Button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
