
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
import { PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface Course {
    id: string;
    title: string;
    status: 'Published' | 'Draft';
    enrollments: number;
    createdAt: {
        seconds: number;
    };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(coursesQuery, (snapshot) => {
        const coursesData = snapshot.docs.map(doc => doc.data() as Course);
        setCourses(coursesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching courses:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                </TableRow>
                            ))
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No courses created yet.
                                </TableCell>
                            </TableRow>
                        ) : courses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>
                                    <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>{course.status}</Badge>
                                </TableCell>
                                <TableCell>{course.enrollments.toLocaleString()}</TableCell>
                                <TableCell>{new Date(course.createdAt.seconds * 1000).toLocaleDateString()}</TableCell>
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
