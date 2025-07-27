import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, FileText, CheckSquare, Bot, Video } from 'lucide-react';
import Link from 'next/link';
import ChallengeInterface from '@/components/challenge-interface';
import LearningPathGenerator from '@/components/learning-path-generator';

const courses: { [key: string]: any } = {};
const challenges: { [key: string]: any } = {};


function getLessonIcon(type: string) {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-5 w-5" />;
    case 'reading':
      return <FileText className="h-5 w-5" />;
    case 'challenge':
      return <CheckSquare className="h-5 w-5" />;
    case 'live':
        return <Video className="h-5 w-5" />;
    default:
      return null;
  }
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = courses[params.id];
  
  // Find a challenge related to the course, if any
  const challengeId = course?.modules?.flatMap((m: any) => m.lessons).find((l: any) => l.type === 'challenge')?.id;
  const challenge = challengeId ? challenges[challengeId] : null;

  if (!course) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center">
          <h1 className="font-semibold text-3xl">Course Not Found</h1>
        </div>
        <p>
          The course you are looking for does not exist.
        </p>
         <Button asChild>
            <Link href="/courses">Back to Courses</Link>
         </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
           <h1 className="font-semibold text-3xl">{course.title}</h1>
           <p className="text-muted-foreground mt-2">{course.description}</p>
            <div className="flex items-center gap-2 mt-4">
            {course.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                {tag}
                </Badge>
            ))}
            </div>
        </div>
        <Button asChild size="lg">
            <Link href="/dashboard">
                Return to Dashboard
            </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Course Modules</CardTitle>
                    <CardDescription>Follow the curriculum to complete the course.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible defaultValue="item-0">
                        {course.modules.map((module: any, index: number) => (
                        <AccordionItem value={`item-${index}`} key={module.title}>
                            <AccordionTrigger className="text-lg font-semibold">{module.title}</AccordionTrigger>
                            <AccordionContent>
                            <ul className="space-y-3">
                                {module.lessons.map((lesson: any) => (
                                <li key={lesson.title} className={`flex items-center justify-between p-3 rounded-md transition-colors ${lesson.completed ? 'bg-accent/50 text-muted-foreground' : 'bg-muted/50'}`}>
                                    <div className="flex items-center gap-3">
                                        {getLessonIcon(lesson.type)}
                                        <span className={`${lesson.completed ? 'line-through' : ''}`}>{lesson.title}</span>
                                    </div>
                                    {lesson.type === 'live' ? (
                                        <Button asChild size="sm">
                                            <Link href={lesson.meetingUrl} target="_blank">Join Session</Link>
                                        </Button>
                                    ) : (
                                        <Badge variant={lesson.completed ? "secondary" : "default"}>{lesson.completed ? "Completed" : "Pending"}</Badge>
                                    )}
                                </li>
                                ))}
                            </ul>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card className="mt-8 md:mt-0">
                <CardHeader>
                    <CardTitle>Personalized Learning Path</CardTitle>
                    <CardDescription>
                       Use our AI Coach to generate a custom learning path tailored to your goals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LearningPathGenerator />
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="mt-8">
         {challenge && <ChallengeInterface challenge={challenge} />}
      </div>
    </main>
  );
}
