
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../auth-provider';
import { createSubscriptionAction } from '../actions';
import { useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect } from 'react';

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For individuals getting started with coding.",
        features: [
            "Access to introductory courses",
            "Basic coding challenges",
            "Limited AI Coach interactions"
        ],
        planCode: null,
        cta: "Current Plan",
    },
    {
        name: "AI Essentials",
        price: "$3",
        description: "For learners who need regular AI assistance.",
        features: [
            "All Free features",
            "50 AI Coach messages per month",
            "10 Code Analyses per month",
            "Priority support",
        ],
        planCode: 'PLN_xxxxxxxxxxxx', // Replace with your actual Paystack Plan Code
        cta: "Upgrade to Essentials",
    },
     {
        name: "AI Pro",
        price: "$5",
        description: "For power users who rely heavily on AI.",
        features: [
            "Unlimited AI Coach messages",
            "Unlimited Code Analyses",
            "Discord community access",
            "Everything in AI Essentials"
        ],
        planCode: 'PLN_yyyyyyyyyyyy', // Replace with your actual Paystack Plan Code
        cta: "Upgrade to Pro",
    }
]

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentUserPlan, setCurrentUserPlan] = useState('Free');

  useEffect(() => {
    if (user) {
        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setCurrentUserPlan(doc.data().plan || 'Free');
            }
        });
        return () => unsub();
    }
  }, [user]);

  const handleSubscription = async (planCode: string, planName: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to subscribe.'});
        return;
    }
    setLoadingPlan(planCode);
    try {
        await createSubscriptionAction({ userId: user.uid, planCode, planName });
        toast({ title: 'Subscription Successful!', description: `You are now subscribed to the ${planName} plan.` });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Subscription Failed', description: error.message || 'An unexpected error occurred.' });
    } finally {
        setLoadingPlan(null);
    }
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">AI Subscription Plans</h1>
      </div>
      <p className="text-muted-foreground">
        Choose a plan to unlock the full power of our AI-driven features.
      </p>

      <div className="grid gap-6 md:grid-cols-3 mt-4">
        {plans.map(plan => {
            const isCurrentPlan = plan.name === currentUserPlan;
            const isLoading = loadingPlan === plan.planCode;
            const variant = isCurrentPlan ? 'secondary' : plan.name === 'AI Essentials' ? 'default' : 'outline';

            return (
                 <Card key={plan.name} className={`flex flex-col ${variant === 'default' ? 'border-primary shadow-lg' : ''}`}>
                    <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <p className="text-4xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <ul className="space-y-3">
                            {plan.features.map(feature => (
                            <li key={feature} className="flex items-center gap-2">
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span>{feature}</span>
                            </li>
                            ))}
                    </ul>
                    </CardContent>
                    <CardFooter>
                        {plan.planCode ? (
                             <Button 
                                className="w-full" 
                                variant={variant}
                                disabled={isLoading || isCurrentPlan}
                                onClick={() => handleSubscription(plan.planCode!, plan.name)}
                              >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isCurrentPlan ? 'Current Plan' : plan.cta}
                            </Button>
                        ) : (
                             <Button className="w-full" variant={variant} disabled={isCurrentPlan}>
                                {plan.cta}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )
        })}
      </div>
      <div className="text-center text-xs text-muted-foreground mt-4">
        Please replace the placeholder plan codes in `src/app/subscription/page.tsx` with your actual Paystack Plan Codes.
      </div>
    </main>
  );
}
