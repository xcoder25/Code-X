import { ArrowRight, Calendar, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const bootcamps = [
  {
    title: "AI & Machine Learning Bootcamp",
    description: "An intensive 12-week program covering everything from Python fundamentals to advanced neural networks.",
    startDate: "Starts Nov 1, 2024",
    level: "Intermediate",
    spots: 25,
  },
  {
    title: "Full-Stack Web3 Development",
    description: "Master blockchain technology, smart contracts, and decentralized applications in this project-based bootcamp.",
    startDate: "Starts Dec 5, 2024",
    level: "Advanced",
    spots: 15,
  },
  {
    title: "Cybersecurity & Ethical Hacking",
    description: "Learn to think like a hacker to defend systems. Covers network security, penetration testing, and more.",
    startDate: "Starts Jan 10, 2025",
    level: "Beginner",
    spots: 30,
  }
]

export default function UpcomingBootcamps() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3">
            <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">Don't Miss Out</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Upcoming Bootcamps</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Enroll in our next cohort and accelerate your journey into specialized tech fields. Limited spots available.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-6 py-12 lg:grid-cols-3 md:gap-8">
          {bootcamps.map((bootcamp) => (
            <Card key={bootcamp.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex justify-between">
                  <Badge variant="outline">{bootcamp.level}</Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {bootcamp.spots} Spots
                  </div>
                </div>
                <CardTitle>{bootcamp.title}</CardTitle>
                <CardDescription>{bootcamp.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Calendar className="h-4 w-4" />
                  <span>{bootcamp.startDate}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/courses">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
