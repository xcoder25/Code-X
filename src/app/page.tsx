import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Code, Users, BrainCircuit, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import LandingPageFooter from '@/components/landing-page-footer';
import SkillsSection from '@/components/skills-section';

const features = [
  {
    icon: BookOpen,
    title: 'Structured Bootcamps',
    desc: 'From web fundamentals to advanced topics, our courses are designed to build your skills progressively.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Target,
    title: 'Personalized Learning',
    desc: 'Use our AI to generate a learning path that is tailored to your specific goals and interests.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Code,
    title: 'Hands-On Projects',
    desc: 'Apply what you learn with real-world projects and coding challenges to build your portfolio.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Users,
    title: 'Community & Mentorship',
    desc: 'Connect with peers, get help from mentors, and grow with our supportive community.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
];

const testimonials = [
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
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ─── Header ────────────────────────────────────────────────── */}
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <Link href="#" className="flex items-center gap-2 shrink-0">
          <Image
            src="/my logo.png"
            alt="Code-X Logo"
            width={30}
            height={30}
            className="rounded-full"
          />
          <span className="text-base font-bold tracking-tight">Code-X</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link
            href="/bootcamp"
            className="text-xs sm:text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            🚀 <span className="hidden xs:inline">AI </span>Bootcamp
          </Link>
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Button asChild size="sm" className="text-xs px-3 h-8 rounded-lg">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">

        {/* ─── Hero ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-32 border-b border-zinc-900 w-full">
          {/* Radial glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

              {/* Left: Headline & CTA */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full text-orange-500 text-[11px] font-semibold uppercase tracking-widest animate-fade-slide-up">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  Next-Gen Coding Academy
                </div>

                {/* Headline */}
                <h1 className="text-[2.4rem] leading-[1.1] sm:text-6xl font-extrabold tracking-tight text-white animate-fade-slide-up animation-delay-100">
                  Build the Future of{' '}
                  <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 bg-clip-text text-transparent block sm:inline">
                    Software & AI
                  </span>
                </h1>

                {/* Subtext */}
                <p className="text-zinc-400 text-sm sm:text-lg max-w-xl leading-relaxed animate-fade-slide-up animation-delay-200 mx-auto lg:mx-0">
                  Join our immersive, project-based bootcamps. Access personalized learning paths, collaborate with Elara—our 1-on-1 AI coach—and gain the skills to deploy production-ready applications.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-fade-slide-up animation-delay-300">
                  <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-8 w-full sm:w-auto shadow-lg shadow-orange-500/25 group">
                    <Link href="/courses" className="flex items-center gap-2">
                      Explore Courses
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-orange-400 hover:text-orange-300 font-bold border border-orange-500/25 rounded-xl px-8 w-full sm:w-auto">
                    <Link href="/bootcamp">Join AI Bootcamp 🚀</Link>
                  </Button>
                </div>

                {/* Benefits row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-zinc-500 pt-2 border-t border-zinc-900 w-full animate-fade-slide-up animation-delay-300">
                  {['1-on-1 AI Mentor', 'Project-Based Curriculum', 'Career-Ready Projects'].map(b => (
                    <span key={b} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-orange-500 shrink-0" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Code Editor Mockup — hidden on small mobile */}
              <div className="lg:col-span-5 relative hidden sm:block">
                <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-3xl pointer-events-none transform -rotate-3 scale-95" />
                <div className="p-1 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden hover:border-orange-500/30 transition-all duration-500">
                  {/* Mac-style titlebar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/80 rounded-t-[14px] border-b border-zinc-900">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">elara-coach.js</span>
                    <div className="w-8" />
                  </div>
                  {/* Editor body */}
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

        {/* ─── Features ──────────────────────────────────────────────── */}
        <section id="features" className="w-full py-14 md:py-24 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-2 mb-10">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-semibold uppercase tracking-wider">Key Features</div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Why Choose Us?</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Our platform is designed to provide you with a comprehensive and engaging learning experience.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="group flex flex-col gap-3 p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base mb-1">{f.title}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ──────────────────────────────────────────── */}
        <section id="testimonials" className="w-full py-14 md:py-24 bg-muted/30 order-1 md:order-2">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-2 mb-10">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-semibold uppercase tracking-wider">Testimonials</div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Trusted by Learners Worldwide</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Hear from our students about their experience and how Code-X helped them achieve their goals.
              </p>
            </div>

            {/* Mobile: horizontal scroll snap — Desktop: grid */}
            <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="flex flex-col justify-between p-5 bg-card border border-border/60 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 min-w-[78vw] sm:min-w-0 snap-center shrink-0 sm:shrink"
                >
                  {/* Quote mark */}
                  <div className="text-4xl text-primary/20 font-serif leading-none mb-1">"</div>
                  <p className="text-muted-foreground italic text-sm leading-relaxed flex-1">
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/40">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll indicator dots — mobile only */}
            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {testimonials.map((t) => (
                <span key={t.name} className="w-1.5 h-1.5 rounded-full bg-primary/30 inline-block" />
              ))}
            </div>
          </div>
        </section>

        {/* ─── Skills ──────────────────────────────────────────────── */}
        <div className="order-2 md:order-1">
          <SkillsSection />
        </div>

      </main>
      <LandingPageFooter />
    </div>
  );
}
