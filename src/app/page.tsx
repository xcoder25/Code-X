import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Code, Users, BrainCircuit, Sparkles } from 'lucide-react';
import Image from 'next/image';
import LandingPageFooter from '@/components/landing-page-footer';
import SkillsSection from '@/components/skills-section';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center">
          <Image
            src="/my logo.png"
            alt="Code-X Logo"
            width={32}
            height={32}
            className="text-primary rounded-full"
          />
          <span className="ml-2 text-lg font-semibold">Code-X</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            href="/bootcamp"
            className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors px-2 py-1"
          >
            AI Bootcamp 🚀
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4 px-2 py-1 transition-colors rounded-md hover:bg-accent"
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="relative overflow-hidden bg-black py-20 lg:py-32 border-b border-zinc-900 w-full">
          {/* Glowing Radial Gradients */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-orange-600/5 rounded-full blur-[150px] pointer-events-none"></div>
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
          
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Headline & CTA */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full text-orange-500 text-xs font-semibold uppercase tracking-widest animate-fade-slide-up">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  Next-Gen Coding Academy
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white animate-fade-slide-up animation-delay-100 text-center lg:text-left font-sans">
                  Build the Future of <br />
                  <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    Software & AI
                  </span>
                </h1>
                
                <p className="text-zinc-400 text-base sm:text-lg max-w-xl leading-relaxed animate-fade-slide-up animation-delay-200 text-center lg:text-left mx-auto lg:mx-0">
                  Join our immersive, project-based bootcamps. Access personalized learning paths, collaborate with Elara—our 1-on-1 AI coach—and gain the skills to deploy production-ready applications.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-slide-up animation-delay-300 w-full sm:w-auto justify-center lg:justify-start items-center">
                  <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-8 w-full sm:w-auto shadow-lg shadow-orange-500/20">
                     <Link href="/courses">Explore Courses</Link>
                  </Button>
                  <Button asChild size="lg" className="bg-zinc-950 hover:bg-zinc-900 text-orange-500 hover:text-orange-400 font-bold border border-orange-500/30 rounded-xl px-8 w-full sm:w-auto shadow-lg shadow-orange-500/10">
                     <Link href="/bootcamp">Join AI Bootcamp 🚀</Link>
                  </Button>
                </div>
                
                {/* Benefits List */}
                <div className="pt-4 border-t border-zinc-900 flex flex-wrap gap-x-8 gap-y-3 text-xs text-zinc-500 justify-center lg:justify-start w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    1-on-1 AI Mentor
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Project-Based Curriculum
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Career-Ready Projects
                  </div>
                </div>
              </div>
              
              {/* Right Column: Code Editor Mockup */}
              <div className="lg:col-span-5 relative">
                {/* Glowing glow backdrop for editor */}
                <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-3xl pointer-events-none transform -rotate-3 scale-95"></div>
                
                <div className="p-1 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-500">
                  {/* Mac style header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/80 rounded-t-[14px] border-b border-zinc-900">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">elara-coach.js</span>
                    <div className="w-8"></div>
                  </div>
                  
                  {/* Editor content */}
                  <div className="p-5 bg-zinc-950 font-mono text-xs text-zinc-400 space-y-4 h-[280px]">
                    <div className="space-y-1">
                      <p className="text-zinc-500">// 1. Initialize Code-X Learn session</p>
                      <p><span className="text-orange-400">const</span> learner = <span className="text-amber-300">new</span> <span className="text-blue-400">CodeXLearner</span>();</p>
                      <p>await learner.<span className="text-blue-400">initialize</span>(<span className="text-green-400">"Full-Stack"</span>);</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-zinc-500">// 2. Connect to Elara AI Assistant</p>
                      <p><span className="text-orange-400">const</span> assistant = learner.<span className="text-blue-400">getCoach</span>();</p>
                      <p>await assistant.<span className="text-blue-400">optimizeCode</span>(myProjectCode);</p>
                    </div>

                    {/* Elara Chat Bubble */}
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-1.5 mt-4">
                      <div className="flex items-center gap-1.5 text-[9px] text-orange-400 font-bold uppercase tracking-wider">
                        <BrainCircuit className="h-3.5 w-3.5 text-orange-500" />
                        Elara AI Coach
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        "Great job! Your React component matches all specs. Let's add Framer Motion for premium animations. Ready to try?"
                      </p>
                    </div>
                  </div>
                </div>
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
                        <Users className="h-8 w-8 text-primary" />
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
        <SkillsSection />
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-semibold">Testimonials</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by Learners Worldwide</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Hear from our students about their experience and how Code-X helped them achieve their goals.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  name: 'Sarah L.',
                  role: 'Full-Stack Developer',
                  initials: 'SL',
                  gradient: 'from-orange-400 to-amber-500',
                  quote: 'The Web Development Bootcamp was a game-changer. The hands-on projects gave me the confidence to build real applications and land my dream job.',
                },
                {
                  name: 'Michael B.',
                  role: 'Data Scientist',
                  initials: 'MB',
                  gradient: 'from-blue-400 to-indigo-500',
                  quote: 'I was new to programming, but the Python course was so well-structured. The AI coach, Elara, was incredibly helpful for explaining complex topics.',
                },
                {
                  name: 'Jessica P.',
                  role: 'UX/UI Designer',
                  initials: 'JP',
                  gradient: 'from-pink-400 to-rose-500',
                  quote: 'As a designer, I wanted to understand the fundamentals of code. Code-X made it accessible and fun. I can now collaborate so much better with my engineering team.',
                },
              ].map((t) => (
                <div key={t.name} className="flex flex-col justify-between p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <p className="text-muted-foreground italic text-sm sm:text-base leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold font-sans shadow-sm`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <LandingPageFooter />
    </div>
  );
}
