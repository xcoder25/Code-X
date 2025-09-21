import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CourseClientPage from '@/components/course-client-page';
import type { Metadata } from 'next';
import { cache } from 'react';

// Type definitions for the data models
interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  modules: Module[];
  resources: Resource[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Resource {
  id: string;
  name: string;
  url: string;
}

// Props type for the Next.js dynamic page
type CourseDetailPageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Cached data fetching function to avoid redundant database calls.
// This is a powerful Next.js optimization. 
const getCourse = cache(async (id: string): Promise<Course | null> => {
  try {
    const courseDocRef = doc(db, 'courses', id);
    const docSnapshot = await getDoc(courseDocRef);

    if (!docSnapshot.exists()) {
      return null;
    }

    const data = docSnapshot.data();

    return {
      id: docSnapshot.id,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      modules: data.modules || [],
      resources: data.resources || [],
    };
  } catch (error) {
    console.error('Failed to fetch course:', error);
    return null;
  }
});

// Generates static paths for all courses for Static Site Generation (SSG).
export async function generateStaticParams() {
  const coursesSnapshot = await getDocs(collection(db, 'courses'));
  return coursesSnapshot.docs.map(doc => ({
    id: doc.id,
  }));
}

// Generates dynamic metadata for each course page, important for SEO.
export async function function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const course = await getCourse(params.id);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} | Code-X`,
    description: course.description,
  };
}

// The main page component that fetches data and renders the client component.
export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = await getCourse(params.id);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h1 className="text-4xl font-bold">Course Not Found</h1>
        <p className="mt-2 text-lg text-muted-foreground">The requested course does not exist.</p>
      </div>
    );
  }

  return <CourseClientPage initialCourse={course} courseId={params.id} />;
}