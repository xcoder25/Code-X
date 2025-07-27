import LearningPathGenerator from '@/components/learning-path-generator';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function PathPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">AI Coach</h1>
      </div>
      <p className="text-muted-foreground">
        Chat with your AI Coach to get a personalized learning plan, ask
        questions, and get help on your coding journey.
      </p>
      <div className="mt-4">
        <LearningPathGenerator />
      </div>
    </main>
  );
}
