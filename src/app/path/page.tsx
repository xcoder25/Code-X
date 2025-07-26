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
        <h1 className="font-semibold text-3xl">Personal Learning Path</h1>
      </div>
      <p className="text-muted-foreground">
        Use our AI assistant to generate a custom learning path tailored to your
        goals.
      </p>
      <div className="mt-4">
        <LearningPathGenerator />
      </div>
    </main>
  );
}
