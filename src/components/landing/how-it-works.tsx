
import { Compass, PencilRuler, Rocket } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3">
            <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Your Path to Mastery</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We've designed a simple, effective path to help you achieve your learning goals and launch your career in tech.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
          <div className="grid gap-1 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Compass className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">1. Explore & Enroll</h3>
            <p className="text-muted-foreground">
              Browse our catalog of industry-leading courses and find the perfect path for you. Enroll with a single click.
            </p>
          </div>
          <div className="grid gap-1 text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <PencilRuler className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">2. Learn & Build</h3>
            <p className="text-muted-foreground">
              Dive into hands-on lessons, complete real-world projects, and get instant feedback from our AI teaching assistants.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">3. Graduate & Launch</h3>
            <p className="text-muted-foreground">
              Complete your bootcamp, earn your certificate, and get ready to launch your new career with our full support.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
