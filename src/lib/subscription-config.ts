/**
 * Centralized subscription configuration
 * This file contains all subscription plans, pricing, and feature definitions
 */

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unlimited?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD' | 'NGN';
  interval: 'monthly' | 'yearly';
  paystackPlanCode?: string;
  features: SubscriptionFeature[];
  isPopular?: boolean;
  isFree?: boolean;
  maxUsers?: number;
  maxCourses?: number;
  maxProjects?: number;
  maxAssignments?: number;
  aiCoachMessages?: number;
  codeAnalyses?: number;
  interviewPrepSessions?: number;
  prioritySupport?: boolean;
  communityAccess?: boolean;
  customBranding?: boolean;
  apiAccess?: boolean;
}

export const SUBSCRIPTION_FEATURES: Record<string, SubscriptionFeature> = {
  // Core Features
  BASIC_COURSES: {
    id: 'basic_courses',
    name: 'Basic Courses',
    description: 'Access to introductory and basic level courses',
    included: true,
  },
  ALL_COURSES: {
    id: 'all_courses',
    name: 'All Courses',
    description: 'Access to all courses including premium content',
    included: false,
  },
  
  // AI Features
  AI_COACH_BASIC: {
    id: 'ai_coach_basic',
    name: 'AI Coach (Limited)',
    description: 'Limited AI coaching sessions per month',
    included: true,
    limit: 5,
  },
  AI_COACH_UNLIMITED: {
    id: 'ai_coach_unlimited',
    name: 'AI Coach (Unlimited)',
    description: 'Unlimited AI coaching sessions',
    included: false,
    unlimited: true,
  },
  
  CODE_ANALYSIS_BASIC: {
    id: 'code_analysis_basic',
    name: 'Code Analysis (Limited)',
    description: 'Limited code analysis sessions per month',
    included: true,
    limit: 2,
  },
  CODE_ANALYSIS_UNLIMITED: {
    id: 'code_analysis_unlimited',
    name: 'Code Analysis (Unlimited)',
    description: 'Unlimited code analysis sessions',
    included: false,
    unlimited: true,
  },
  
  INTERVIEW_PREP: {
    id: 'interview_prep',
    name: 'AI Interview Prep',
    description: 'AI-powered mock interview sessions',
    included: false,
    limit: 10,
  },
  
  // Community & Support
  COMMUNITY_ACCESS: {
    id: 'community_access',
    name: 'Community Access',
    description: 'Access to exclusive Discord community',
    included: false,
  },
  PRIORITY_SUPPORT: {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Priority customer support and faster response times',
    included: false,
  },
  
  // Advanced Features
  CUSTOM_BRANDING: {
    id: 'custom_branding',
    name: 'Custom Branding',
    description: 'Custom branding for organizations',
    included: false,
  },
  API_ACCESS: {
    id: 'api_access',
    name: 'API Access',
    description: 'Access to platform API for integrations',
    included: false,
  },
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with coding basics',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    isFree: true,
    features: [
      SUBSCRIPTION_FEATURES.BASIC_COURSES,
      SUBSCRIPTION_FEATURES.AI_COACH_BASIC,
      SUBSCRIPTION_FEATURES.CODE_ANALYSIS_BASIC,
    ],
    maxUsers: 1,
    maxCourses: 3,
    maxProjects: 2,
    maxAssignments: 1,
    aiCoachMessages: 5,
    codeAnalyses: 2,
    interviewPrepSessions: 0,
    prioritySupport: false,
    communityAccess: false,
    customBranding: false,
    apiAccess: false,
  },
  {
    id: 'essentials',
    name: 'Essentials',
    description: 'For learners who need regular AI assistance',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    paystackPlanCode: 'PLN_essentials_monthly',
    features: [
      SUBSCRIPTION_FEATURES.ALL_COURSES,
      SUBSCRIPTION_FEATURES.AI_COACH_UNLIMITED,
      SUBSCRIPTION_FEATURES.CODE_ANALYSIS_BASIC,
      SUBSCRIPTION_FEATURES.PRIORITY_SUPPORT,
    ],
    maxUsers: 1,
    maxCourses: -1, // unlimited
    maxProjects: 10,
    maxAssignments: 5,
    aiCoachMessages: -1, // unlimited
    codeAnalyses: 50,
    interviewPrepSessions: 5,
    prioritySupport: true,
    communityAccess: false,
    customBranding: false,
    apiAccess: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users preparing for a career in tech',
    price: 19.99,
    currency: 'USD',
    interval: 'monthly',
    paystackPlanCode: 'PLN_pro_monthly',
    isPopular: true,
    features: [
      SUBSCRIPTION_FEATURES.ALL_COURSES,
      SUBSCRIPTION_FEATURES.AI_COACH_UNLIMITED,
      SUBSCRIPTION_FEATURES.CODE_ANALYSIS_UNLIMITED,
      SUBSCRIPTION_FEATURES.INTERVIEW_PREP,
      SUBSCRIPTION_FEATURES.COMMUNITY_ACCESS,
      SUBSCRIPTION_FEATURES.PRIORITY_SUPPORT,
    ],
    maxUsers: 1,
    maxCourses: -1, // unlimited
    maxProjects: -1, // unlimited
    maxAssignments: -1, // unlimited
    aiCoachMessages: -1, // unlimited
    codeAnalyses: -1, // unlimited
    interviewPrepSessions: 20,
    prioritySupport: true,
    communityAccess: true,
    customBranding: false,
    apiAccess: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations and educational institutions',
    price: 49.99,
    currency: 'USD',
    interval: 'monthly',
    paystackPlanCode: 'PLN_enterprise_monthly',
    features: [
      SUBSCRIPTION_FEATURES.ALL_COURSES,
      SUBSCRIPTION_FEATURES.AI_COACH_UNLIMITED,
      SUBSCRIPTION_FEATURES.CODE_ANALYSIS_UNLIMITED,
      SUBSCRIPTION_FEATURES.INTERVIEW_PREP,
      SUBSCRIPTION_FEATURES.COMMUNITY_ACCESS,
      SUBSCRIPTION_FEATURES.PRIORITY_SUPPORT,
      SUBSCRIPTION_FEATURES.CUSTOM_BRANDING,
      SUBSCRIPTION_FEATURES.API_ACCESS,
    ],
    maxUsers: 100,
    maxCourses: -1, // unlimited
    maxProjects: -1, // unlimited
    maxAssignments: -1, // unlimited
    aiCoachMessages: -1, // unlimited
    codeAnalyses: -1, // unlimited
    interviewPrepSessions: -1, // unlimited
    prioritySupport: true,
    communityAccess: true,
    customBranding: true,
    apiAccess: true,
  },
];

// Yearly plans with discount
export const YEARLY_PLANS: SubscriptionPlan[] = SUBSCRIPTION_PLANS.map(plan => ({
  ...plan,
  interval: 'yearly' as const,
  price: plan.price * 10, // 2 months free (20% discount)
  paystackPlanCode: plan.paystackPlanCode?.replace('monthly', 'yearly'),
}));

// Helper functions
export function getPlanById(id: string, interval: 'monthly' | 'yearly' = 'monthly'): SubscriptionPlan | undefined {
  const plans = interval === 'yearly' ? YEARLY_PLANS : SUBSCRIPTION_PLANS;
  return plans.find(plan => plan.id === id);
}

export function getAllPlans(interval: 'monthly' | 'yearly' = 'monthly'): SubscriptionPlan[] {
  return interval === 'yearly' ? YEARLY_PLANS : SUBSCRIPTION_PLANS;
}

export function getPopularPlan(interval: 'monthly' | 'yearly' = 'monthly'): SubscriptionPlan | undefined {
  const plans = getAllPlans(interval);
  return plans.find(plan => plan.isPopular);
}

export function getFreePlan(): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find(plan => plan.isFree)!;
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

export function calculateYearlyDiscount(monthlyPrice: number): number {
  return Math.round((monthlyPrice * 12 - monthlyPrice * 10) / (monthlyPrice * 12) * 100);
}
