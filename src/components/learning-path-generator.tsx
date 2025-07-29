
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { chatWithElaraAction } from '@/app/actions';
import LearningPathDisplay from './learning-path-display';

const pathFormSchema = z.object({
  goal: z
    .string()
    .min(10, 'Please describe your goal in at least 10 characters.'),
});

export default function LearningPathGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [learningPath, setLearningPath] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof pathFormSchema>>({
    resolver: zodResolver(pathFormSchema),
    defaultValues: {
      goal: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof pathFormSchema>) => {
    setIsLoading(true);
    setLearningPath('');

    try {
      const response = await chatWithElaraAction({
        userName: 'Student', // In a real app, get this from auth
        message: `Create a learning path for the following goal: ${values.goal}`,
        history: [], // History is not needed for this specific task
      });

      setLearningPath(response.reply);
      setLearningGoal(values.goal);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate learning path. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!learningPath ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your learning goal?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I want to become a full-stack developer specializing in React and Node.js."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Path
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-4">
          <LearningPathDisplay title={learningGoal} path={learningPath} />
           <Button onClick={() => setLearningPath('')} variant="outline">
            Generate New Path
          </Button>
        </div>
      )}
    </div>
  );
}
