import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
import { PlusCircle } from 'lucide-react';

const courses = [
    {
        id: "cs101",
        title: "Introduction to Python",
        status: "Published",
        enrollments: 1250,
        createdAt: "2023-10-01"
    },
    {
        id: "cs201",
        title: "Web Development Bootcamp",
        status: "Published",
        enrollments: 2350,
        createdAt: "2023-09-15"
    },
    {
        id: "cs301",
        title: "Advanced JavaScript",
        status: "Draft",
        enrollments: 0,
        createdAt: "2023-11-05"
    }
];

export default function AdminCoursesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Manage Courses</h2>
            <Button asChild>
                <Link href="/admin/courses/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Course
                </Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Courses</CardTitle>
                <CardDescription>
                    A list of all courses in the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>
                                    <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>{course.status}</Badge>
                                </TableCell>
                                <TableCell>{course.enrollments.toLocaleString()}</TableCell>
                                <TableCell>{course.createdAt}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
