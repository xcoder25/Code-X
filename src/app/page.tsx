import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PencilRuler, BookOpen, Target, Code } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background shadow-sm">
        <Link href="#" className="flex items-center justify-center">
          <PencilRuler className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">Software Academy</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Unlock Your Potential in Software Engineering
                </h1>
                <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                  Join our immersive bootcamps and gain the skills to build amazing applications. Personalized learning paths, expert mentorship, and hands-on projects.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" variant="secondary">
                   <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                   <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                   <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Us?</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform is designed to provide you with a comprehensive and engaging learning experience.
                  </p>
                </div>
              </div>
              <div className="col-span-2 grid items-start gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-bold">Structured Bootcamps</h3>
                    </div>
                  <p className="text-muted-foreground">
                    From web fundamentals to advanced topics, our courses are designed to build your skills progressively.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                        <Target className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-bold">Personalized Learning</h3>
                    </div>
                  <p className="text-muted-foreground">
                    Use our AI to generate a learning path that is tailored to your specific goals and interests.
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Code className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-bold">Hands-On Projects</h3>
                    </div>
                  <p className="text-muted-foreground">
                    Apply what you learn with real-world projects and coding challenges to build your portfolio.
                  </p>
                </div>
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <h3 className="text-xl font-bold">Community & Mentorship</h3>
                    </div>
                  <p className="text-muted-foreground">
                    Connect with peers, get help from mentors, and grow with our supportive community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Software Academy. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
