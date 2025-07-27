'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, Loader2 } from 'lucide-react';

import { generateLearningPathAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LearningPathDisplay from './learning-path-display';
import { useToast } from '@/hooks/use-toast';
import type { LearningPathOutput } from '@/ai/flows/generate-learning-path';

const formSchema = z.object({
  skillLevel: z.string().min(1, 'Please select your skill level.'),
  interests: z.string().min(10, 'Please tell us more about your interests.'),
  goals: z.string().min(10, 'Please describe your learning goals.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LearningPathGenerator() {
  const [learningPath, setLearningPath] = useState<LearningPathOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillLevel: 'beginner',
      interests: '',
      goals: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setLearningPath(null);
    try {
      const result = await generateLearningPathAction(values);
      if (result.path) {
        setLearningPath(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to generate a learning path. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Chat with your AI Coach</CardTitle>
          <CardDescription>
            Tell us about yourself and we'll generate a personalized learning
            path for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="skillLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Web development, data science, AI, mobile app development..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What topics are you passionate about?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Build a portfolio, get a job, learn a new skill for a personal project..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What do you want to achieve?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Get Advice
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Your Personalized Plan</CardTitle>
          <CardDescription>
            Here is the step-by-step guide to help you achieve your goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                  Our AI is crafting your plan...
                </p>
              </div>
            </div>
          )}
          {!isLoading && learningPath && (
            <LearningPathDisplay title={learningPath.title} path={learningPath.path} />
          )}
          {!isLoading && !learningPath && (
            <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed border-muted-foreground/30">
              <div className="text-center text-muted-foreground">
                <Bot size={48} className="mx-auto" />
                <p className="mt-4">Your learning plan will appear here.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
