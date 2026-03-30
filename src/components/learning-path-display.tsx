
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Flag, Rocket, Star, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="p-8 text-center border-2 border-dashed rounded-xl border-muted">
         <p className="text-muted-foreground">
            No valid learning path steps found. Try describing your goal in more detail.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm"
      >
        <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                <Rocket className="h-6 w-6" />
                Your Roadmap to Success
            </h2>
            <p className="text-muted-foreground">{title}</p>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[200px]">
            <div className="flex justify-between w-full text-sm font-medium">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 w-full rounded-full" />
        </div>
      </motion.div>

      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group",
                step.completed ? "opacity-100" : "opacity-80 hover:opacity-100"
              )}
            >
              {/* Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted dark:bg-slate-900 group-hover:scale-110 transition-transform z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                )}
              </div>

              {/* Content */}
              <Card 
                className={cn(
                    "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 cursor-pointer transition-all duration-300 border-2",
                    step.completed ? "bg-primary/5 border-primary/20" : "hover:border-primary/30"
                )}
                onClick={() => handleStepToggle(step.id)}
              >
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "p-2 rounded-lg bg-background border shrink-0",
                        step.completed ? "text-primary border-primary/20" : "text-muted-foreground"
                    )}>
                        {index === 0 ? <Target className="h-5 w-5" /> : 
                         index === steps.length - 1 ? <Flag className="h-5 w-5" /> : 
                         <Star className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1">
                        <p className={cn(
                            "text-sm font-medium leading-relaxed transition-colors",
                            step.completed ? "text-primary" : "text-foreground"
                        )}>
                            {step.text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {step.completed ? "Successfully Mastered" : "Next Milestone"}
                        </p>
                    </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

