'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, PlusCircle } from 'lucide-react';

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For individuals getting started with coding.",
        features: [
            "Access to introductory courses",
            "Basic coding challenges",
            "Community support",
        ],
        cta: "Edit Plan",
        variant: 'outline' as const
    },
    {
        name: "Pro",
        price: "$29",
        description: "For serious learners who want to go pro.",
        features: [
            "Access to all courses and bootcamps",
            "Advanced coding challenges",
            "AI-powered learning path generator",
            "Priority support",
            "Discord community access"
        ],
        cta: "Edit Plan",
        variant: 'outline' as const
    },
     {
        name: "Team",
        price: "$99",
        description: "For organizations that want to upskill their team.",
        features: [
            "All features in Pro",
            "Team management dashboard",
            "Custom bootcamps",
            "Dedicated account manager",
            "Centralized billing"
        ],
        cta: "Edit Plan",
        variant: 'outline' as const
    }
]

export default function AdminSubscriptionPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Manage Subscriptions</h1>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Plan
        </Button>
      </div>
      <p className="text-muted-foreground">
        Create, edit, and manage subscription plans for your users.
      </p>

      <div className="grid gap-6 md:grid-cols-3 mt-4">
        {plans.map(plan => (
            <Card key={plan.name} className="flex flex-col">
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
                    <Button className="w-full" variant={plan.variant}>{plan.cta}</Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </main>
  );
}
