'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LearningPathDisplayProps {
  title: string;
  path: string;
}

interface Step {
  id: number;
  text: string;
  completed: boolean;
}

export default function LearningPathDisplay({ title, path }: LearningPathDisplayProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const parsedSteps = path
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && /^\d+\./.test(line))
      .map((line, index) => ({
        id: index,
        text: line.replace(/^\d+\.\s*/, ''),
        completed: false,
      }));
    setSteps(parsedSteps);
    setProgress(0);
  }, [path]);

  useEffect(() => {
    const completedSteps = steps.filter((step) => step.completed).length;
    const totalSteps = steps.length;
    setProgress(totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0);
  }, [steps]);

  const handleStepToggle = (stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  if (steps.length === 0) {
    return (
      <p>
        No valid learning path steps found. The AI might have returned an
        unexpected format.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="progress">Your Progress</Label>
        <Progress id="progress" value={progress} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-1">
          {Math.round(progress)}% complete
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4 pt-0">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start space-x-3">
              <Checkbox
                id={`step-${step.id}`}
                checked={step.completed}
                onCheckedChange={() => handleStepToggle(step.id)}
                className="mt-1"
              />
              <Label
                htmlFor={`step-${step.id}`}
                className={`flex-1 text-sm font-normal transition-colors ${
                  step.completed
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground'
                }`}
              >
                {step.text}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
