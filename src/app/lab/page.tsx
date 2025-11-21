'use client';

import ChallengeInterface from '@/components/challenge-interface';

const sandboxChallenge = {
  id: 'sandbox-1',
  title: 'Code Sandbox',
  description: `Welcome to the Code Lab!

This is a sandbox environment where you can write and experiment with any code you'd like.

- Write your code in the editor on the right.
- Click "Analyze Code" to get instant feedback and an explanation from our AI assistant.

This is a great place to test snippets, practice concepts, or just play around with code.`,
  difficulty: 'Sandbox',
  defaultCode: `function greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("Code-X Student"));`,
};

export default function LabPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-theme(spacing.14))]">
      <div className="flex items-center mb-4">
        <h1 className="font-semibold text-3xl">AI Code Lab</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Practice your coding skills and get instant AI-powered feedback.
      </p>
      <div className="flex-1">
        <ChallengeInterface challenge={sandboxChallenge} />
      </div>
    </main>
  );
}
