'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Zap, Code, MessageSquare, Users, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { formatPrice } from '@/lib/subscription-config';

interface SubscriptionManagerProps {
  className?: string;
}

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  const { 
    subscription, 
    plan, 
    isLoading, 
    hasFeature, 
    canUseFeature, 
    getUsage, 
    getLimit,
    daysUntilExpiry 
  } = useSubscription();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !plan) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You're currently on the free plan. Upgrade to unlock more features.
          </p>
          <Button asChild>
            <a href="/subscription">View Plans</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usageItems = [
    {
      id: 'ai_coach_unlimited',
      name: 'AI Coach Messages',
      icon: <MessageSquare className="h-4 w-4" />,
      usage: getUsage('ai_coach_unlimited'),
      limit: getLimit('ai_coach_unlimited'),
      hasAccess: hasFeature('ai_coach_unlimited'),
    },
    {
      id: 'code_analysis_unlimited',
      name: 'Code Analyses',
      icon: <Code className="h-4 w-4" />,
      usage: getUsage('code_analysis_unlimited'),
      limit: getLimit('code_analysis_unlimited'),
      hasAccess: hasFeature('code_analysis_unlimited'),
    },
    {
      id: 'interview_prep',
      name: 'Interview Prep Sessions',
      icon: <Zap className="h-4 w-4" />,
      usage: getUsage('interview_prep'),
      limit: getLimit('interview_prep'),
      hasAccess: hasFeature('interview_prep'),
    },
  ];

  return (
    <div className={className}>
      {/* Current Plan Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Plan
            </span>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Price</p>
                <p className="text-lg font-semibold">
                  {formatPrice(plan.price, plan.currency)}/{plan.interval}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {daysUntilExpiry !== null ? 'Days Remaining' : 'Next Billing'}
                </p>
                <p className="text-lg font-semibold">
                  {daysUntilExpiry !== null 
                    ? `${daysUntilExpiry} days`
                    : subscription.nextBillingDate 
                      ? subscription.nextBillingDate.toDate().toLocaleDateString()
                      : 'N/A'
                  }
                </p>
              </div>
            </div>

            {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⚠️ Your subscription expires in {daysUntilExpiry} days. 
                  <a href="/subscription" className="underline ml-1">Renew now</a>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {usageItems.map(item => {
              if (!item.hasAccess) return null;

              const percentage = item.limit 
                ? Math.min((item.usage / item.limit) * 100, 100)
                : 0;

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.usage} / {item.limit === null ? '∞' : item.limit}
                    </span>
                  </div>
                  
                  {item.limit !== null && (
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  )}
                  
                  {item.limit !== null && percentage >= 90 && (
                    <p className="text-xs text-amber-600">
                      ⚠️ You're approaching your limit
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.features.map(feature => (
              <div key={feature.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.unlimited ? 'Unlimited' : feature.limit ? `${feature.limit} per month` : 'Included'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button asChild className="flex-1">
          <a href="/subscription">Upgrade Plan</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/settings">Manage Subscription</a>
        </Button>
      </div>
    </div>
  );
}
