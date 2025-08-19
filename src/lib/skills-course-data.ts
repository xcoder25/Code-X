
interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  progress: number;
  status: 'not-started';
  modules: any[];
  resources: any[];
}

const toKebabCase = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

const skillNames = [
  "ChatGPT",
  "Coding",
  "Computer Science",
  "Cybersecurity",
  "DevOps",
  "Ethical Hacking",
  "Generative AI",
  "Java Programming",
  "Web Development",
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

export const skillsCourses: Course[] = skillNames.map(skill => ({
  id: toKebabCase(skill),
  title: skill,
  description: `An in-depth course on ${skill}. Content is being prepared and will be available soon.`,
  tags: [skill],
  progress: 0,
  status: 'not-started',
  modules: [],
  resources: [],
}));

export function getSkillCourseById(id: string) {
  return skillsCourses.find(course => course.id === id);
}
