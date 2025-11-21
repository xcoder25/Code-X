'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { z } from 'zod';
import { 
  SUBSCRIPTION_PLANS, 
  YEARLY_PLANS, 
  getPlanById, 
  type SubscriptionPlan 
} from './subscription-config';
import type { UserSubscription, SubscriptionUsage } from '@/types';

// Schema for creating subscriptions
const createSubscriptionSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  interval: z.enum(['monthly', 'yearly']),
  paymentMethod: z.enum(['paystack', 'manual']).optional(),
});

// Schema for updating subscription usage
const updateUsageSchema = z.object({
  userId: z.string(),
  feature: z.enum(['aiCoachMessages', 'codeAnalyses', 'interviewPrepSessions', 'projectsCreated', 'assignmentsSubmitted']),
  increment: z.number().default(1),
});

// Schema for subscription status updates
const updateSubscriptionStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(['active', 'inactive', 'cancelled', 'expired', 'pending']),
  paystackSubscriptionCode: z.string().optional(),
});

export async function createSubscriptionAction(input: z.infer<typeof createSubscriptionSchema>) {
  const { userId, planId, interval, paymentMethod = 'paystack' } = createSubscriptionSchema.parse(input);

  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('User not found.');
  }

  const userData = userDoc.data();
  const plan = getPlanById(planId, interval);

  if (!plan) {
    throw new Error('Invalid subscription plan.');
  }

  // Check if user already has an active subscription
  if (userData.subscription?.status === 'active') {
    throw new Error('User already has an active subscription.');
  }

  let paystackSubscriptionCode: string | undefined;

  if (paymentMethod === 'paystack' && plan.paystackPlanCode) {
    // Create Paystack subscription
    paystackSubscriptionCode = await createPaystackSubscription(userData, plan);
  }

  // Calculate subscription dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (interval === 'yearly' ? 12 : 1));

  const nextBillingDate = new Date(endDate);

  // Initialize usage tracking
  const usage: SubscriptionUsage = {
    aiCoachMessages: 0,
    codeAnalyses: 0,
    interviewPrepSessions: 0,
    projectsCreated: 0,
    assignmentsSubmitted: 0,
    lastResetDate: serverTimestamp() as any,
  };

  const subscription: UserSubscription = {
    planId: plan.id,
    planName: plan.name,
    status: paymentMethod === 'manual' ? 'active' : 'pending',
    startDate: serverTimestamp() as any,
    endDate: serverTimestamp() as any,
    nextBillingDate: serverTimestamp() as any,
    paystackSubscriptionCode,
    autoRenew: true,
    usage,
  };

  // Update user document
  await updateDoc(userDocRef, {
    subscription,
    plan: plan.name, // Keep legacy field for compatibility
  });

  // Create subscription history record
  await addDoc(collection(db, 'subscriptionHistory'), {
    userId,
    planId: plan.id,
    planName: plan.name,
    interval,
    price: plan.price,
    currency: plan.currency,
    status: subscription.status,
    startDate: serverTimestamp(),
    endDate: serverTimestamp(),
    paymentMethod,
    paystackSubscriptionCode,
  });

  return { 
    success: true, 
    subscription,
    message: `Successfully subscribed to ${plan.name} plan.`
  };
}

export async function updateSubscriptionUsageAction(input: z.infer<typeof updateUsageSchema>) {
  const { userId, feature, increment } = updateUsageSchema.parse(input);

  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('User not found.');
  }

  const userData = userDoc.data();
  const subscription = userData.subscription;

  if (!subscription || subscription.status !== 'active') {
    throw new Error('No active subscription found.');
  }

  const plan = getPlanById(subscription.planId);
  if (!plan) {
    throw new Error('Invalid subscription plan.');
  }

  // Check usage limits
  const currentUsage = subscription.usage[feature];
  const limit = plan.limits[feature];

  if (limit && limit !== -1 && currentUsage + increment > limit) {
    throw new Error(`Usage limit exceeded for ${feature}. Current: ${currentUsage}, Limit: ${limit}`);
  }

  // Update usage
  const updatedUsage = {
    ...subscription.usage,
    [feature]: currentUsage + increment,
  };

  await updateDoc(userDocRef, {
    'subscription.usage': updatedUsage,
  });

  return { success: true, usage: updatedUsage };
}

export async function updateSubscriptionStatusAction(input: z.infer<typeof updateSubscriptionStatusSchema>) {
  const { userId, status, paystackSubscriptionCode } = updateSubscriptionStatusSchema.parse(input);

  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('User not found.');
  }

  const updateData: any = {
    'subscription.status': status,
  };

  if (paystackSubscriptionCode) {
    updateData['subscription.paystackSubscriptionCode'] = paystackSubscriptionCode;
  }

  await updateDoc(userDocRef, updateData);

  return { success: true };
}

export async function cancelSubscriptionAction(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('User not found.');
  }

  const subscription = userDoc.data().subscription;

  if (!subscription) {
    throw new Error('No subscription found.');
  }

  // Cancel Paystack subscription if exists
  if (subscription.paystackSubscriptionCode) {
    await cancelPaystackSubscription(subscription.paystackSubscriptionCode);
  }

  // Update subscription status
  await updateDoc(userDocRef, {
    'subscription.status': 'cancelled',
    'subscription.autoRenew': false,
  });

  return { success: true };
}

export async function getUserSubscriptionAction(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('User not found.');
  }

  const userData = userDoc.data();
  const subscription = userData.subscription;

  if (!subscription) {
    return { subscription: null };
  }

  const plan = getPlanById(subscription.planId);
  
  return { 
    subscription: {
      ...subscription,
      plan,
    }
  };
}

export async function getSubscriptionHistoryAction(userId: string) {
  const historyQuery = query(
    collection(db, 'subscriptionHistory'),
    where('userId', '==', userId),
    orderBy('startDate', 'desc'),
    limit(10)
  );

  const snapshot = await getDocs(historyQuery);
  const history = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return { history };
}

// Helper function to create Paystack subscription
async function createPaystackSubscription(userData: any, plan: SubscriptionPlan): Promise<string> {
  let paystackCustomerCode = userData.paystackCustomerCode;

  // Create customer if doesn't exist
  if (!paystackCustomerCode) {
    const customerResponse = await fetch('https://api.paystack.co/customer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        first_name: userData.firstName || userData.displayName?.split(' ')[0],
        last_name: userData.lastName || userData.displayName?.split(' ')[1],
      }),
    });

    const customerData = await customerResponse.json();
    if (!customerResponse.ok) {
      throw new Error(customerData.message || 'Failed to create Paystack customer.');
    }

    paystackCustomerCode = customerData.data.customer_code;
    
    // Update user with customer code
    await updateDoc(doc(db, 'users', userData.id), {
      paystackCustomerCode,
    });
  }

  // Create subscription
  const subscriptionResponse = await fetch('https://api.paystack.co/subscription', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer: paystackCustomerCode,
      plan: plan.paystackPlanCode,
    }),
  });

  const subscriptionData = await subscriptionResponse.json();
  if (!subscriptionResponse.ok) {
    throw new Error(subscriptionData.message || 'Failed to create subscription.');
  }

  return subscriptionData.data.subscription_code;
}

// Helper function to cancel Paystack subscription
async function cancelPaystackSubscription(subscriptionCode: string): Promise<void> {
  const response = await fetch(`https://api.paystack.co/subscription/${subscriptionCode}/disable`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel subscription.');
  }
}

// Utility function to check if user has access to a feature
export async function checkFeatureAccessAction(userId: string, feature: string): Promise<boolean> {
  const { subscription } = await getUserSubscriptionAction(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const plan = subscription.plan;
  if (!plan) {
    return false;
  }

  // Check if feature is included in plan
  const featureConfig = plan.features.find(f => f.id === feature);
  if (!featureConfig || !featureConfig.included) {
    return false;
  }

  // Check usage limits
  if (featureConfig.limit && !featureConfig.unlimited) {
    const currentUsage = subscription.usage[feature as keyof SubscriptionUsage] || 0;
    return currentUsage < featureConfig.limit;
  }

  return true;
}
