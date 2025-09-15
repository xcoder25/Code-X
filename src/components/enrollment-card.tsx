
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Ticket } from 'lucide-react';
import { redeemAccessCodeAction } from '@/app/actions';
import { useAuth } from '@/app/auth-provider';
import { Separator } from './ui/separator';


interface EnrollmentCardProps {
    courseId: string;
    userId: string;
    onEnrollmentSuccess: () => void;
}

export default function EnrollmentCard({ courseId, userId, onEnrollmentSuccess }: EnrollmentCardProps) {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleRedeemCode = async () => {
    if (!accessCode) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please enter an access code.',
        });
        return;
    }
    
    setIsLoading(true);
    
    try {
        await redeemAccessCodeAction({
            accessCode,
            courseId,
            userId
        });
        toast({
            title: 'Success!',
            description: 'Access code redeemed. You are now enrolled in the course.',
        });
        onEnrollmentSuccess();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Enrollment Failed',
            description: error.message || 'The access code you entered is not valid. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handlePayment = () => {
      toast({
          title: 'Payment processing...',
          description: 'This is a mock payment flow. You will be enrolled shortly.'
      });
      setIsLoading(true);
       setTimeout(() => {
            // In a real app, you would handle Stripe checkout and a webhook to confirm enrollment
            onEnrollmentSuccess();
            setIsLoading(false);
            toast({
                title: 'Payment Successful!',
                description: 'You are now enrolled in the course.',
            });
       }, 2000);
  }

  return (
    <Card className="w-full max-w-md shrink-0">
      <CardHeader>
        <CardTitle>Enroll in Course</CardTitle>
        <CardDescription>
          Choose an option below to get access to this course.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <Label htmlFor="access-code" className="flex items-center gap-2 mb-2">
                <Ticket className="h-5 w-5" />
                <span>Use an Access Code</span>
            </Label>
            <div className="flex gap-2 mt-1">
                <Input
                    id="access-code"
                    placeholder="Enter your code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    disabled={isLoading}
                />
                 <Button onClick={handleRedeemCode} disabled={isLoading || !accessCode} className="shrink-0">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Redeem
                </Button>
            </div>
        </div>

        <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-sm text-muted-foreground">OR</span>
        </div>

        <div>
             <Label className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5" />
                <span>Pay to Unlock</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-4">Get immediate lifetime access to this course.</p>
            <Button onClick={handlePayment} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay to Unlock
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
