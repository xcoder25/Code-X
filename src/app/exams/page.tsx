import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const exams = [
  {
    title: 'Mid-term Exam',
    course: 'Web Development Bootcamp',
    date: 'Oct 30, 2024',
    status: 'Upcoming',
  },
  {
    title: 'JavaScript Fundamentals Quiz',
    course: 'Web Development Bootcamp',
    date: 'Oct 18, 2024',
    status: 'Completed',
    score: '92%',
  },
   {
    title: 'Final Exam',
    course: 'Web Development Bootcamp',
    date: 'Dec 15, 2024',
    status: 'Upcoming',
  },
  {
    title: 'Advanced Next.js Concepts',
    course: 'Advanced Next.js',
    date: 'Nov 20, 2024',
    status: 'Upcoming',
  },
];

export default function ExamsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Exams & Tests</h1>
      </div>
      <p className="text-muted-foreground">
        Prepare for upcoming exams and review your past results.
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.title}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.course}</TableCell>
                  <TableCell>{exam.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        exam.status === 'Upcoming' ? 'default' : 'secondary'
                      }
                    >
                      {exam.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{exam.score || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exam.status === 'Completed'}
                    >
                      {exam.status === 'Completed' ? 'View Results' : 'Begin Exam'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
