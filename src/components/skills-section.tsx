
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

async function getUniqueTags() {
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, limit(50)); // Limit to 50 courses to find tags
    const querySnapshot = await getDocs(q);

    const allTags = new Set<string>();
    querySnapshot.forEach((doc) => {
        const tags = doc.data().tags;
        if (Array.isArray(tags)) {
            // Filter out "Premium" tag from being displayed as a skill
            tags.filter(tag => tag.toLowerCase() !== 'premium').forEach(tag => allTags.add(tag));
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
  const allSkills = [...tags.technical, ...tags.analytical, ...tags.other];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3">
             <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Top Skills</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Master In-Demand Technologies
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our curriculum is designed to equip you with the most sought-after skills in the tech industry. Explore the topics we cover.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl py-12">
            <div className="flex flex-wrap justify-center gap-4">
                {allSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-lg px-6 py-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                        {skill}
                    </Badge>
                ))}
            </div>
             <div className="text-center mt-12">
                <Link href="/courses" className="inline-flex items-center text-primary hover:underline">
                    Explore all courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </div>
        </div>
      </div>
    </section>
  );
}
