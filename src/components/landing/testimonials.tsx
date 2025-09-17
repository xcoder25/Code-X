
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah L.",
    role: "Full-Stack Developer",
    avatarUrl: "https://picsum.photos/seed/p1/100/100",
    quote: "The Web Development Bootcamp was a game-changer. The hands-on projects gave me the confidence to build real applications and land my dream job.",
    aiHint: "woman programmer"
  },
  {
    name: "Michael B.",
    role: "Data Scientist",
    avatarUrl: "https://picsum.photos/seed/p2/100/100",
    quote: "I was new to programming, but the Python course was so well-structured. The AI coach, Elara, was incredibly helpful for explaining complex topics.",
    aiHint: "man developer"
  },
  {
    name: "Jessica P.",
    role: "UX/UI Designer",
    avatarUrl: "https://picsum.photos/seed/p3/100/100",
    quote: "As a designer, I wanted to understand the fundamentals of code. Code-X made it accessible and fun. I can now collaborate so much better with my engineering team.",
    aiHint: "woman designer"
  }
];

export default function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">What Our Students Say</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by Learners Worldwide</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from our students about their experience and how Code-X helped them achieve their goals.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="text-left">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Image
                            src={testimonial.avatarUrl}
                            alt={`Avatar of ${testimonial.name}`}
                            width={56}
                            height={56}
                            className="rounded-full"
                            data-ai-hint={testimonial.aiHint}
                        />
                        <div>
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                    </div>
                    <blockquote className="text-muted-foreground italic">
                        "{testimonial.quote}"
                    </blockquote>
                </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
