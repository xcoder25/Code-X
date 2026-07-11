import AiCoach from '@/components/ai-coach';
import LearningPathGenerator from '@/components/learning-path-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PathPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 min-h-[calc(100vh-theme(spacing.14))] bg-background">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="font-extrabold text-3xl tracking-tight text-foreground">AI Intelligence Hub</h1>
        <p className="text-muted-foreground text-sm">
          Collaborate with Elara, your personal AI Coach, and construct custom roadmaps for your educational goals.
        </p>
      </div>

      <Tabs defaultValue="coach" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="coach" className="font-semibold">AI Coach Chat</TabsTrigger>
          <TabsTrigger value="roadmap" className="font-semibold">Personalized Roadmap</TabsTrigger>
        </TabsList>
        <TabsContent value="coach" className="flex-1 flex flex-col h-full min-h-[500px]">
          <div className="flex-1">
            <AiCoach />
          </div>
        </TabsContent>
        <TabsContent value="roadmap" className="flex-1 bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <LearningPathGenerator />
        </TabsContent>
      </Tabs>
    </main>
  );
}
