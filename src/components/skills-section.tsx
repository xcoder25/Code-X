
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
    <section className="w-full py-14 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6 mx-auto">

        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-semibold uppercase tracking-wider">
            Course Catalogue
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Explore Top Skills
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Master the most in-demand technical and analytical skills to advance your career.
          </p>
        </div>

        {/* Two columns: each column gets a scrollable pill cloud on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Technical */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-center sm:text-left border-b border-border/50 pb-2">
              💻 Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {technicalSkills.map((skill) => (
                <Link
                  key={skill}
                  href={`/courses/${toKebabCase(skill)}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                >
                  {skill}
                </Link>
              ))}
            </div>
          </div>

          {/* Analytical */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-center sm:text-left border-b border-border/50 pb-2">
              📊 Analytical Skills
            </h3>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {analyticalSkills.map((skill) => (
                <Link
                  key={skill}
                  href={`/courses/${toKebabCase(skill)}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-border/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm"
                >
                  {skill}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
