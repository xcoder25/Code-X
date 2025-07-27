import ChallengeInterface from '@/components/challenge-interface';

const labChallenge = {
  id: 'code-x-lab',
  title: 'Welcome to the Code-X Lab',
  description:
    'This is your personal coding sandbox. Use this space to experiment with HTML, CSS, and JavaScript. Write your code in the editor on the right and see the results instantly. Happy coding!',
  difficulty: 'Sandbox',
  defaultCode: `<html>
  <head>
    <style>
      body {
        font-family: sans-serif;
        padding: 1rem;
      }
    </style>
  </head>
  <body>
    <h1>Hello, Code-X Lab!</h1>
    <p>You can write any HTML, CSS, or JavaScript you want here.</p>
  </body>
</html>`,
};

export default function LabPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-theme(spacing.14))]">
        <div className="flex items-center mb-4">
            <h1 className="font-semibold text-3xl">Code-X Lab</h1>
        </div>
         <p className="text-muted-foreground mb-6">
            A sandbox environment for you to experiment with code.
        </p>
      <div className="flex-1">
        <ChallengeInterface challenge={labChallenge} />
      </div>
    </main>
  );
}
