'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-provider';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserSubscription } from '@/types';
import { getPlanById } from '@/lib/subscription-config';
import type { SubscriptionPlan } from '@/lib/subscription-config';

interface UseSubscriptionReturn {
  subscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  isLoading: boolean;
  error: string | null;
  hasFeature: (featureId: string) => boolean;
  canUseFeature: (featureId: string) => boolean;
  getUsage: (featureId: string) => number;
  getLimit: (featureId: string) => number | null;
  isActive: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setPlan(null);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const userSubscription = userData.subscription;
          
          if (userSubscription) {
            setSubscription(userSubscription);
            
            // Get plan details
            const planDetails = getPlanById(userSubscription.planId);
            setPlan(planDetails || null);
          } else {
            setSubscription(null);
            setPlan(null);
          }
        } else {
          setSubscription(null);
          setPlan(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching subscription:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const hasFeature = (featureId: string): boolean => {
    if (!plan || !subscription || subscription.status !== 'active') {
      return false;
    }

    const feature = plan.features.find(f => f.id === featureId);
    return feature ? feature.included : false;
  };

  const canUseFeature = (featureId: string): boolean => {
    if (!hasFeature(featureId)) {
      return false;
    }

    const feature = plan?.features.find(f => f.id === featureId);
    if (!feature) return false;

    // Check if unlimited
    if (feature.unlimited) {
      return true;
    }

    // Check usage limits
    const currentUsage = getUsage(featureId);
    const limit = getLimit(featureId);
    
    return limit === null || currentUsage < limit;
  };

  const getUsage = (featureId: string): number => {
    if (!subscription) return 0;

    switch (featureId) {
      case 'ai_coach_basic':
      case 'ai_coach_unlimited':
        return subscription.usage.aiCoachMessages;
      case 'code_analysis_basic':
      case 'code_analysis_unlimited':
        return subscription.usage.codeAnalyses;
      case 'interview_prep':
        return subscription.usage.interviewPrepSessions;
      case 'projects':
        return subscription.usage.projectsCreated;
      case 'assignments':
        return subscription.usage.assignmentsSubmitted;
      default:
        return 0;
    }
  };

  const getLimit = (featureId: string): number | null => {
    if (!plan) return null;

    const feature = plan.features.find(f => f.id === featureId);
    if (!feature) return null;

    if (feature.unlimited) return null;
    return feature.limit || null;
  };

  const isActive = subscription?.status === 'active';
  const isExpired = subscription?.status === 'expired';

  const daysUntilExpiry = subscription?.endDate 
    ? Math.ceil((subscription.endDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    subscription,
    plan,
    isLoading,
    error,
    hasFeature,
    canUseFeature,
    getUsage,
    getLimit,
    isActive,
    isExpired,
    daysUntilExpiry,
  };
}

// Hook for checking specific feature access
export function useFeatureAccess(featureId: string) {
  const { hasFeature, canUseFeature, getUsage, getLimit, isLoading } = useSubscription();

  return {
    hasAccess: hasFeature(featureId),
    canUse: canUseFeature(featureId),
    usage: getUsage(featureId),
    limit: getLimit(featureId),
    isLoading,
  };
}

// Hook for subscription management
export function useSubscriptionManagement() {
  const { subscription, plan, isActive } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const upgradeSubscription = async (newPlanId: string, interval: 'monthly' | 'yearly' = 'monthly') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: newPlanId,
          interval,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    plan,
    isActive,
    isLoading,
    upgradeSubscription,
    cancelSubscription,
  };
}
