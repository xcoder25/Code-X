
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getUniqueTags() {
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, limit(50)); // Limit to 50 courses to find tags
    const querySnapshot = await getDocs(q);

    const allTags = new Set<string>();
    querySnapshot.forEach((doc) => {
        const tags = doc.data().tags;
        if (Array.isArray(tags)) {
            tags.forEach(tag => allTags.add(tag));
        }
    });

    const technicalSkills = ["Python", "JavaScript", "HTML", "CSS", "Fullstack", "React", "Next.js", "TypeScript"];
    const analyticalSkills = ["Data Science", "Machine Learning", "SQL", "Data Analytics"];
    
    const techResult: string[] = [];
    const analyticalResult: string[] = [];
    const otherResult: string[] = [];

    allTags.forEach(tag => {
        if (technicalSkills.includes(tag)) {
            techResult.push(tag);
        } else if (analyticalSkills.includes(tag)) {
            analyticalResult.push(tag);
        } else {
            otherResult.push(tag);
        }
    });

    return {
        technical: techResult,
        analytical: analyticalResult,
        other: otherResult
    };
}


export default async function SkillsSection() {
  const tags = await getUniqueTags();

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Explore Top Skills
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Master the most in-demand technical and analytical skills to advance your career.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 py-12 sm:grid-cols-2">
          <div className="flex flex-col items-start space-y-4">
            <h3 className="text-2xl font-bold">Technical Skills</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground text-left">
              {tags.technical.map((skill) => (
                <li key={skill} className="cursor-pointer hover:underline hover:text-primary">
                    {skill}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start space-y-4">
            <h3 className="text-2xl font-bold">Analytical Skills</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground text-left">
              {tags.analytical.map((skill) => (
                 <li key={skill} className="cursor-pointer hover:underline hover:text-primary">
                    {skill}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
