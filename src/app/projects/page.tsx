
'use client';

import {
  Card,
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
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-provider';
import { collection, onSnapshot, query, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectSubmissionDialog } from '@/components/project-submission-dialog';

export interface Project {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: Timestamp;
}

export interface ProjectSubmission {
  id: string; // This will be the project ID
  projectId: string;
  projectTitle: string;
  status: 'Pending' | 'Graded';
  grade: string | null;
}

interface ProjectWithSubmission extends Project {
  submission?: ProjectSubmission;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Map<string, ProjectSubmission>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsQuery = query(collection(db, 'projects'), orderBy('dueDate', 'desc'));
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Project);
        setProjects(projectsData);
        if (!user) setLoading(false);
    });
    
    return () => unsubscribeProjects();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const submissionsQuery = query(collection(db, 'users', user.uid, 'projectSubmissions'));
    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      const submissionsMap = new Map<string, ProjectSubmission>();
      snapshot.forEach(doc => {
        submissionsMap.set(doc.id, { id: doc.id, ...doc.data() } as ProjectSubmission);
      });
      setUserSubmissions(submissionsMap);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching project submissions:", error);
      setLoading(false);
    });

    return () => unsubscribeSubmissions();
  }, [user]);

  const projectsWithSubmissions: ProjectWithSubmission[] = projects.map(project => ({
    ...project,
    submission: userSubmissions.get(project.id),
  }));

  const getStatus = (project: ProjectWithSubmission) => {
    if (project.submission) {
      return project.submission.status;
    }
    return 'Not Submitted';
  };

  const getGrade = (project: ProjectWithSubmission) => {
    return project.submission?.grade?.toString() || 'N/A';
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'default';
      case 'Graded':
        return 'secondary';
      default:
        return 'destructive';
    }
  };
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Projects</h1>
      </div>
      <p className="text-muted-foreground">
        Apply your skills with hands-on projects.
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
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : projectsWithSubmissions.length > 0 ? (
                projectsWithSubmissions.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.title}
                    </TableCell>
                    <TableCell>{project.courseTitle}</TableCell>
                    <TableCell>{new Date(project.dueDate.seconds * 1000).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(getStatus(project))}>
                        {getStatus(project)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getGrade(project)}</TableCell>
                    <TableCell className="text-right">
                       {getStatus(project) === 'Not Submitted' && user && (
                          <ProjectSubmissionDialog 
                            projectId={project.id} 
                            userId={user.uid}
                            userName={user.displayName || 'Anonymous'}
                          >
                             <Button variant="outline" size="sm">
                                Submit
                            </Button>
                          </ProjectSubmissionDialog>
                       )}
                       {getStatus(project) === 'Pending' && (
                          <Button variant="outline" size="sm" disabled>
                            Pending Review
                          </Button>
                       )}
                       {getStatus(project) === 'Graded' && (
                          <Button variant="outline" size="sm" disabled>
                            View Submission
                          </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
