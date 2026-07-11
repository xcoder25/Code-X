
import Link from 'next/link';

const technicalSkills = [
  "ChatGPT",
  "Coding",
  "Computer Science",
  "Cybersecurity",
  "DevOps",
  "Ethical Hacking",
  "Generative AI",
  "Java Programming",
  "Python",
  "Web Development",
];

const analyticalSkills = [
  "Artificial Intelligence",
  "Big Data",
  "Business Analysis",
  "Data Analytics",
  "Data Science",
  "Financial Modeling",
  "Machine Learning",
  "Microsoft Excel",
  "Microsoft Power BI",
  "SQL",
];

const toKebabCase = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export default function SkillsSection() {
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
          <div className="flex flex-col items-center sm:items-start space-y-4 w-full">
            <h3 className="text-xl sm:text-2xl font-bold">Technical Skills</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground text-left text-sm w-full">
              {technicalSkills.map((skill) => (
                <li key={skill}>
                  <Link href={`/courses/${toKebabCase(skill)}`} className="hover:underline hover:text-primary">
                    {skill}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center sm:items-start space-y-4 w-full">
            <h3 className="text-xl sm:text-2xl font-bold">Analytical Skills</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground text-left text-sm w-full">
              {analyticalSkills.map((skill) => (
                <li key={skill}>
                  <Link href={`/courses/${toKebabCase(skill)}`} className="hover:underline hover:text-primary">
                    {skill}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
