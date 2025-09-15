
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { pythonCourse, pythonCourseData } from '@/lib/python-course-data';
import { getSkillCourseById, skillsCourses } from '@/lib/skills-course-data';
import { webDevCourse, webDevCourseData } from '@/lib/web-dev-course-data';
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


export async function generateStaticParams() {
  // Fetch dynamic courses from Firestore
  const coursesSnapshot = await getDocs(collection(db, 'courses'));
  const firestoreCourses = coursesSnapshot.docs.map(doc => ({
    id: doc.id,
  }));

  // Get hardcoded course IDs
  const hardcodedCourseIds = [
    pythonCourse.id,
    webDevCourse.id,
    ...skillsCourses.map(c => c.id)
  ].map(id => ({ id }));

  // Combine and return unique IDs
  const allIds = [...firestoreCourses, ...hardcodedCourseIds];
  const uniqueIds = allIds.filter((item, index, self) => 
    index === self.findIndex((t) => t.id === item.id)
  );

  return uniqueIds;
}

async function getCourse(id: string): Promise<Course | null> {
    if (id === 'intro-to-python') {
        return pythonCourseData;
    }
     if (id === 'web-dev-bootcamp') {
        return webDevCourseData;
    }

    const hardcodedSkillCourse = getSkillCourseById(id);
    if (hardcodedSkillCourse) {
        return hardcodedSkillCourse;
    }

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
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


export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = await getCourse(params.id);

  return <CourseClientPage initialCourse={course} courseId={params.id} />;
}
