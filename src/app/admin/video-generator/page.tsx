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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVideo } from '@/app/actions';

const videoGeneratorSchema = z.object({
  prompt: z.string().min(10, 'Please enter a prompt with at least 10 characters.'),
});

export default function AIVideoGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof videoGeneratorSchema>>({
    resolver: zodResolver(videoGeneratorSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof videoGeneratorSchema>) => {
    setIsLoading(true);
    setGeneratedVideo(null);
    try {
      const result = await generateVideo({ prompt: values.prompt });
      setGeneratedVideo(result.videoUrl);
      toast({
        title: 'Video Generated!',
        description: 'Your video has been successfully created.',
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Video className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Video Studio</h2>
          <p className="text-muted-foreground">
            Create stunning videos from text prompts using Google's Veo model.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Prompt</CardTitle>
            <CardDescription>
              Describe the video you want to create in detail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., A majestic dragon soaring over a mystical forest at dawn."
                          {...field}
                          rows={6}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Generating Video...' : 'Generate Video'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
            <CardDescription>
              Your generated video will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full aspect-video bg-muted rounded-lg">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Generating video... this may take a minute.</p>
              </div>
            ) : generatedVideo ? (
              <video
                src={generatedVideo}
                controls
                className="w-full h-full rounded-md"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Video className="h-16 w-16 mx-auto" />
                <p className="mt-2">Your video will be shown here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
