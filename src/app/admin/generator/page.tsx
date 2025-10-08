'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Copy, FileText, Code, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateContentAction } from '@/app/actions';
import type { GenerateContentOutput } from '@/ai/flows/ai-content-schemas';
import { Badge } from '@/components/ui/badge';

const generatorFormSchema = z.object({
  topic: z.string().min(5, 'Please enter a topic with at least 5 characters.'),
});

export default function AIContentGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateContentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof generatorFormSchema>>({
    resolver: zodResolver(generatorFormSchema),
    defaultValues: {
      topic: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof generatorFormSchema>) => {
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const result = await generateContentAction({ topic: values.topic });
      setGeneratedContent(result);
      toast({
        title: 'Content Generated!',
        description: `Successfully created content for "${values.topic}".`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: `${fieldName} copied to clipboard.` });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">AI Content Generator</h2>
      <p className="text-muted-foreground">
        Automatically generate a lesson plan, code example, and quiz question for any topic.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Topic</CardTitle>
            <CardDescription>
              Provide a topic and let the AI do the rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Introduction to React Hooks"
                          {...field}
                          disabled={isLoading}
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
                  {isLoading ? 'Generating...' : 'Generate Content'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : generatedContent && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText />Lesson Plan</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(generatedContent.lessonPlan, 'Lesson plan')}>
                  <Copy />
                </Button>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none max-h-80 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: generatedContent.lessonPlan.replace(/\n/g, '<br />') }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Code />Code Example</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(generatedContent.codeExample, 'Code example')}>
                  <Copy />
                </Button>
              </CardHeader>
              <CardContent className="bg-muted p-4 rounded-lg overflow-x-auto">
                 <pre><code className="text-sm">{generatedContent.codeExample}</code></pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Check />Quiz Question</CardTitle>
                 <Button variant="ghost" size="icon" onClick={() => handleCopy(JSON.stringify(generatedContent.quizQuestion, null, 2), 'Quiz question')}>
                  <Copy />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{generatedContent.quizQuestion.question}</p>
                <ul className="space-y-2">
                  {generatedContent.quizQuestion.options.map((option, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant={index === generatedContent.quizQuestion.correctAnswerIndex ? 'default' : 'outline'}>
                        {String.fromCharCode(65 + index)}
                      </Badge>
                      <span>{option}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
