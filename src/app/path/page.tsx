import AiCoach from '@/components/ai-coach';

export default function PathPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-theme(spacing.14))]">
       <div className="flex items-center mb-4">
        <h1 className="font-semibold text-3xl">AI Coach</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Chat with your AI Coach, Elara, to get a personalized learning plan, ask
        questions, and get help on your coding journey.
      </p>
      <div className="flex-1">
        <AiCoach />
      </div>
    </main>
  );
}
