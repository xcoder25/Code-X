
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp, increment, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

interface EnrollStudentDialogProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface Course {
    id: string;
    title: string;
}

export function EnrollStudentDialog({ user, isOpen, onOpenChange }: EnrollStudentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCourses() {
        if (isOpen) {
            const coursesQuery = query(collection(db, 'courses'), orderBy('title'));
            const querySnapshot = await getDocs(coursesQuery);
            const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(coursesData);
        }
    }
    fetchCourses();
  }, [isOpen]);

  const handleEnroll = async () => {
    if (!selectedCourse) {
        toast({ variant: 'destructive', title: 'Please select a course.' });
        return;
    }
    
    setIsLoading(true);
    try {
        const batch = writeBatch(db);

        // Create an enrollment document for the user
        const enrollmentDocRef = doc(db, 'users', user.uid, 'enrollments', selectedCourse);
        batch.set(enrollmentDocRef, {
            courseId: selectedCourse,
            enrolledAt: serverTimestamp(),
            progress: 0,
        });
        
        // Increment enrollment count on the course
        const courseDocRef = doc(db, 'courses', selectedCourse);
        batch.update(courseDocRef, { enrollments: increment(1) });

        await batch.commit();

        toast({
            title: 'Enrollment Successful!',
            description: `${user.displayName} has been enrolled in the selected course.`,
        });
        onOpenChange(false);
        setSelectedCourse('');
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to enroll student.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Select a course to enroll <span className="font-semibold">{user.displayName}</span> in.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Select onValueChange={setSelectedCourse} value={selectedCourse}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                    {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
            <Button onClick={handleEnroll} disabled={isLoading || !selectedCourse}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enroll Student
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
