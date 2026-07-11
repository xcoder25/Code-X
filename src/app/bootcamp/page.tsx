'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  BrainCircuit, 
  Code2, 
  Rocket, 
  Video, 
  Calendar, 
  Users2, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';
import BootcampForm from '@/components/bootcamp-form';
import CountdownTimer from '@/components/countdown-timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

const curriculum = [
  {
    icon: BrainCircuit,
    title: 'Module 1: AI Fundamentals & Prompting',
    description: 'Understand how AI works, master prompt engineering, and learn how to collaborate with AI assistants responsibly.',
  },
  {
    icon: Code2,
    title: 'Module 2: Modern Web Design & Layouts',
    description: 'Learn HTML5, CSS3, and Tailwind CSS to structure and style stunning, responsive web interfaces.',
  },
  {
    icon: Code2,
    title: 'Module 3: JavaScript & Interactive Apps',
    description: 'Breathe life into web designs using JavaScript. Master logic, events, DOM manipulation, and state.',
  },
  {
    icon: Rocket,
    title: 'Module 4: Build & Deploy Your AI Web App',
    description: 'Connect a web app to the Google Gemini AI API to create a custom AI assistant, and deploy it live to the web.',
  },
];

const programDetails = [
  { icon: Calendar, title: 'Start Date', info: 'Saturday, 27th July 2026' },
  { icon: Video, title: 'Format', info: '100% Virtual (Zoom & Classroom)' },
  { icon: Users2, title: 'Age Brackets', info: 'Junior (5-11) & Senior (12-17)' },
  { icon: Clock, title: 'Batches', info: 'Morning (10am) & Afternoon (2pm)' },
];

const faqs = [
  {
    q: 'Does my child need prior coding experience?',
    a: 'Not at all! This bootcamp is beginner-friendly. We start from the absolute basics and build up, grouping children by age and experience level to ensure personalized attention.',
  },
  {
    q: 'What are the technical requirements?',
    a: 'A stable internet connection, a laptop or computer (Windows, Mac, or Chromebook) with a webcam, and a free Google account for Google Classroom access.',
  },
  {
    q: 'How does the family discount work?',
    a: 'We offer a special family bundle! While 1 child costs ₦35,000, registering 2 children is ₦50,000 (saving ₦20,000). The form automatically applies this discount based on the number of children you select.',
  },
  {
    q: 'Will certificates be issued?',
    a: 'Yes, every participant who completes their final capstone AI project will receive a personalized Certificate of Completion from CODE-X Tech.',
  },
];

export default function BootcampLandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="px-4 lg:px-8 h-16 flex items-center bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Image
            src="/my logo.png"
            alt="Code-X Logo"
            width={32}
            height={32}
            className="text-primary rounded-full"
          />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Code-X</span>
        </Link>
        <nav className="ml-auto">
          <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <Link href="/" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8 lg:py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 px-4 py-1.5 rounded-full text-orange-400 text-xs font-semibold uppercase tracking-widest animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            Empower the Next Generation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            Build with AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Holiday Bootcamp
            </span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Give your child a competitive edge this holiday. In just 4 weeks, they will transition from digital consumers to creators, learning web coding and building AI tools.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Details & Curriculum */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Quick Details Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {programDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div 
                    key={detail.title} 
                    className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 hover:border-zinc-800 transition-colors"
                  >
                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{detail.title}</p>
                      <p className="text-xs sm:text-sm font-bold mt-0.5 text-zinc-200">{detail.info}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Curriculum Showcase */}
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">What They Will Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {curriculum.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.title} className="bg-zinc-950 border-zinc-900 hover:border-zinc-800 transition-all duration-300 overflow-hidden relative group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-semibold text-zinc-500 tracking-wider">Week {index + 1}</span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-100">{item.title}</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Perks & Features */}
            <div className="space-y-6 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden">
              <div className="absolute -right-24 -bottom-24 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl"></div>
              <h2 className="text-2xl font-extrabold tracking-tight">Included in the Program</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Live Interactive Zoom Cohort sessions',
                  'Dedicated WhatsApp support group',
                  'Personalized mentoring & code reviews',
                  '1-on-1 debug assistance classes',
                  'Google Classroom onboarding',
                  'Industry-recognized cert of completion',
                ].map((perk) => (
                  <div key={perk} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Tiers Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-600/10 to-transparent border border-orange-500/20 space-y-4">
              <h3 className="text-lg font-bold text-orange-400">Exclusive Pricing Plans</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-900">
                  <p className="text-xs font-semibold text-zinc-500 uppercase">Single Ticket</p>
                  <p className="text-2xl font-extrabold text-white mt-1">₦35,000</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Full access for 1 child, all weeks</p>
                </div>
                <div className="bg-zinc-950/80 p-4 rounded-2xl border border-orange-500/30 relative overflow-hidden">
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rotate-12 uppercase tracking-widest">
                    Best Value
                  </div>
                  <p className="text-xs font-semibold text-orange-400 uppercase">Family Bundle (2 Children)</p>
                  <p className="text-2xl font-extrabold text-white mt-1">₦50,000</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Save ₦20,000 overall on enrollment</p>
                </div>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-orange-500" /> FAQs
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem 
                    key={faq.q} 
                    value={`faq-${i}`} 
                    className="border border-zinc-900 rounded-2xl overflow-hidden px-4 bg-zinc-950/50 hover:bg-zinc-950 transition-colors"
                  >
                    <AccordionTrigger className="text-sm sm:text-base font-semibold text-left hover:no-underline text-zinc-200 py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-zinc-400 pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

          </div>

          {/* Right Column: Timer & Form */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <CountdownTimer />
            <BootcampForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 mt-20 text-center text-xs text-zinc-600">
        <p>© 2026 CODE-X Tech. All rights reserved. Empowering tomorrow's creators.</p>
      </footer>
    </div>
  );
}
