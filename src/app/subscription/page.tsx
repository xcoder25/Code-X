import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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
        cta: "Current Plan",
        variant: 'secondary' as const
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
        cta: "Upgrade to Essentials",
        variant: 'default' as const
    },
     {
        name: "AI Pro",
        price: "$5",
        description: "For power users who rely heavily on AI.",
        features: [
            "All AI Essentials features",
            "Unlimited AI Coach messages",
            "Unlimited Code Analyses",
            "Discord community access"
        ],
        cta: "Upgrade to Pro",
        variant: 'outline' as const
    }
]

export default function SubscriptionPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">AI Subscription Plans</h1>
      </div>
      <p className="text-muted-foreground">
        Choose a plan to unlock the full power of our AI-driven features.
      </p>

      <div className="grid gap-6 md:grid-cols-3 mt-4">
        {plans.map(plan => (
            <Card key={plan.name} className={`flex flex-col ${plan.variant === 'default' ? 'border-primary shadow-lg' : ''}`}>
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
                    <Button className="w-full" variant={plan.variant} disabled={plan.cta === 'Current Plan'}>{plan.cta}</Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </main>
  );
}
