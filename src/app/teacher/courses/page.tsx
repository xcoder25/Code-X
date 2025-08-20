
'use client';

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
import { MoreHorizontal, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherAuth } from '@/app/teacher-auth-provider';

interface Course {
    id: string;
    title: string;
    status: 'Published' | 'Draft';
    enrollments: number;
    createdAt: {
        seconds: number;
    };
}

export default function TeacherCoursesPage() {
  const { user } = useTeacherAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const coursesQuery = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
    const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Course);
        setCourses(coursesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching teacher courses:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
        </div>
        <p className="text-muted-foreground">A list of courses you are assigned to teach.</p>
        <Card>
            <CardHeader>
                <CardTitle>Assigned Courses</CardTitle>
                <CardDescription>
                    Manage the content for your courses below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(2)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    You have not been assigned any courses yet.
                                </TableCell>
                            </TableRow>
                        ) : courses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>
                                    <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>{course.status}</Badge>
                                </TableCell>
                                <TableCell>{course.enrollments.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/teacher/courses/${course.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Manage Course
                                        </Link>
                                    </Button>
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
