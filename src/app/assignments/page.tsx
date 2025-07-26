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

const assignments = [
  {
    title: 'State Management',
    course: 'Web Development Bootcamp',
    dueDate: 'Oct 29, 2024',
    status: 'Pending',
  },
  {
    title: 'Component Lifecycle',
    course: 'Web Development Bootcamp',
    dueDate: 'Oct 22, 2024',
    status: 'Graded',
    grade: 'A-',
  },
  {
    title: 'Server Actions',
    course: 'Advanced Next.js',
    dueDate: 'Nov 5, 2024',
    status: 'Pending',
  },
    {
    title: 'JS Fundamentals',
    course: 'Web Development Bootcamp',
    dueDate: 'Oct 15, 2024',
    status: 'Graded',
    grade: 'B+',
  },
];

export default function AssignmentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Assignments</h1>
      </div>
      <p className="text-muted-foreground">
        Track your assignments, due dates, and grades.
      </p>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.title}>
                  <TableCell className="font-medium">
                    {assignment.title}
                  </TableCell>
                  <TableCell>{assignment.course}</TableCell>
                  <TableCell>{assignment.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        assignment.status === 'Pending'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.grade || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={assignment.status === 'Graded'}
                    >
                      {assignment.status === 'Graded'
                        ? 'View Submission'
                        : 'Submit'}
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
