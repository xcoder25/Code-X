import ChallengeInterface from '@/components/challenge-interface';
import { notFound } from 'next/navigation';

const challenges = [
  {
    id: '1',
    title: 'Two Sum',
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: 'Easy',
    defaultCode: `function twoSum(nums, target) {\n  // Your code here\n};`,
  },
  {
    id: '2',
    title: 'Valid Palindrome',
    description:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    difficulty: 'Easy',
    defaultCode: `function isPalindrome(s) {\n  // Your code here\n};`,
  },
  {
    id: '3',
    title: 'Binary Tree Inorder Traversal',
    description:
      "Given the `root` of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: 'Medium',
    defaultCode: `/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\nfunction inorderTraversal(root) {\n  // Your code here\n};`,
  },
  {
    id: '4',
    title: 'Longest Substring Without Repeating Characters',
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    defaultCode: `function lengthOfLongestSubstring(s) {\n  // Your code here\n};`,
  },
  {
    id: '5',
    title: 'Median of Two Sorted Arrays',
    description:
      'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).',
    difficulty: 'Hard',
    defaultCode: `function findMedianSortedArrays(nums1, nums2) {\n  // Your code here\n};`,
  },
];

interface ChallengePageProps {
  params: {
    id: string;
  };
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const challenge = challenges.find((c) => c.id === params.id);

  if (!challenge) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col h-[calc(100vh-2rem)] p-4 md:p-6">
      <ChallengeInterface challenge={challenge} />
    </main>
  );
}

export async function generateStaticParams() {
  return challenges.map((challenge) => ({
    id: challenge.id,
  }));
}
