
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CourseClientPage from '@/components/course-client-page';
import type { Metadata } from 'next';

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

type CourseDetailPageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};


export async function generateStaticParams() {
  const coursesSnapshot = await getDocs(collection(db, 'courses'));
  const firestoreCourses = coursesSnapshot.docs.map(doc => ({
    id: doc.id,
  }));
  return firestoreCourses;
}

async function getCourse(id: string): Promise<Course | null> {
    const courseDocRef = doc(db, 'courses', id);
    const docSnapshot = await getDoc(courseDocRef);

    if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            title: data.title,
            description: data.description,
            tags: data.tags || [],
            modules: data.modules || [],
            resources: data.resources || [],
        };
    }
    return null;
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
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


export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = await getCourse(params.id);

  return <CourseClientPage initialCourse={course} courseId={params.id} />;
}
