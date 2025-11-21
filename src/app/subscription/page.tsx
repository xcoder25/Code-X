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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Loader2, Sparkles, Star, Bot, Crown, Building, Calendar, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../auth-provider';
import { createSubscriptionAction } from '@/lib/subscription-actions';
import { useState } from 'react';
import { useEffect } from 'react';
import { 
  SUBSCRIPTION_PLANS, 
  YEARLY_PLANS, 
  formatPrice, 
  calculateYearlyDiscount,
  type SubscriptionPlan 
} from '@/lib/subscription-config';
import { useSubscription } from '@/hooks/use-subscription';

const planIcons = {
  free: <Star className="h-5 w-5" />,
  essentials: <Sparkles className="h-5 w-5" />,
  pro: <Bot className="h-5 w-5" />,
  enterprise: <Building className="h-5 w-5" />,
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription, plan: currentPlan, isLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly');

  const plans = selectedInterval === 'yearly' ? YEARLY_PLANS : SUBSCRIPTION_PLANS;

  const handleSubscription = async (planId: string, planName: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to subscribe.'});
        return;
    }
    
    setLoadingPlan(planId);
    try {
        await createSubscriptionAction({ 
          userId: user.uid, 
          planId, 
          interval: selectedInterval 
        });
        toast({ 
          title: 'Subscription Successful!', 
          description: `You are now subscribed to the ${planName} plan.` 
        });
    } catch (error: any) {
        toast({ 
          variant: 'destructive', 
          title: 'Subscription Failed', 
          description: error.message || 'An unexpected error occurred.' 
        });
    } finally {
        setLoadingPlan(null);
    }
  };

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-3xl">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Choose a plan to unlock the full power of our AI-driven features.
          </p>
        </div>
        {currentPlan && (
          <Badge variant="outline" className="text-sm">
            Current: {currentPlan.name}
          </Badge>
        )}
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <Tabs value={selectedInterval} onValueChange={(value) => setSelectedInterval(value as 'monthly' | 'yearly')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="relative">
              Yearly
              {selectedInterval === 'yearly' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 20%
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {plans.map(plan => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const isLoading = loadingPlan === plan.id;
          const isPopular = plan.isPopular;
          const icon = planIcons[plan.id as keyof typeof planIcons] || <Star className="h-5 w-5" />;
          
          const variant = isCurrentPlan ? 'secondary' : isPopular ? 'default' : 'outline';

          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="items-center text-center pb-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary w-fit">
                  {icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <p className="text-4xl font-bold">
                    {formatPrice(plan.price, plan.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    per {plan.interval === 'yearly' ? 'year' : 'month'}
                  </p>
                  {plan.interval === 'yearly' && (
                    <p className="text-xs text-green-600 font-medium">
                      Save {calculateYearlyDiscount(SUBSCRIPTION_PLANS.find(p => p.id === plan.id)?.price || 0)}%
                    </p>
                  )}
                </div>
                <CardDescription className="text-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow px-6">
                <ul className="space-y-3">
                  {plan.features.map(feature => (
                    <li key={feature.id} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium">{feature.name}</span>
                        {feature.limit && !feature.unlimited && (
                          <span className="text-muted-foreground ml-1">
                            ({feature.limit} per month)
                          </span>
                        )}
                        {feature.unlimited && (
                          <span className="text-muted-foreground ml-1">(Unlimited)</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-4">
                {plan.isFree ? (
                  <Button className="w-full" variant="secondary" disabled>
                    {isCurrentPlan ? 'Current Plan' : 'Free Plan'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={variant}
                    disabled={isCurrentPlan || isLoading}
                    onClick={() => handleSubscription(plan.id, plan.name)}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isCurrentPlan ? 'Current Plan' : isLoading ? 'Processing...' : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Current Subscription Details */}
      {subscription && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{subscription.planName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                <p className="text-lg font-semibold">
                  {subscription.nextBillingDate 
                    ? subscription.nextBillingDate.toDate().toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}