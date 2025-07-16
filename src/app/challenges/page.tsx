import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

const challenges = [
  {
    id: '1',
    title: 'Two Sum',
    description:
      'Find two numbers in an array that add up to a specific target.',
    difficulty: 'Easy',
    tags: ['Arrays', 'Hash Table'],
  },
  {
    id: '2',
    title: 'Valid Palindrome',
    description:
      'Check if a given string is a palindrome, ignoring non-alphanumeric characters.',
    difficulty: 'Easy',
    tags: ['Strings', 'Two Pointers'],
  },
  {
    id: '3',
    title: 'Binary Tree Inorder Traversal',
    description: 'Traverse a binary tree in-order (left, root, right).',
    difficulty: 'Medium',
    tags: ['Trees', 'DFS', 'Stack'],
  },
  {
    id: '4',
    title: 'Longest Substring Without Repeating Characters',
    description:
      'Find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    tags: ['Strings', 'Sliding Window'],
  },
  {
    id: '5',
    title: 'Median of Two Sorted Arrays',
    description: 'Find the median of two sorted arrays.',
    difficulty: 'Hard',
    tags: ['Arrays', 'Binary Search'],
  },
];

export default function ChallengesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Coding Challenges</h1>
      </div>
      <p className="text-muted-foreground">
        Sharpen your skills with our collection of coding challenges.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{challenge.title}</CardTitle>
                <Badge
                  variant={
                    challenge.difficulty === 'Easy'
                      ? 'secondary'
                      : challenge.difficulty === 'Medium'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {challenge.difficulty}
                </Badge>
              </div>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-x-2">
              {challenge.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/challenges/${challenge.id}`}>
                  Start Challenge <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
