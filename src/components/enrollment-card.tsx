
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { redeemAccessCodeAction } from '@/app/actions';
import { useAuth } from '@/app/auth-provider';
import PaystackPop from '@paystack/inline-js'


interface EnrollmentCardProps {
    courseId: string;
    userId: string;
    onEnrollmentSuccess: () => void;
}

export default function EnrollmentCard({ courseId, userId, onEnrollmentSuccess }: EnrollmentCardProps) {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'redeem' | 'purchase' | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handlePurchase = async () => {
    if (!user?.email) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to make a purchase.',
      });
      return;
    }

    setLoadingAction('purchase');
    setIsLoading(true);

    try {
        // Step 1: Call your own backend to initialize the transaction
        const response = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                amount: '500000', // Amount in kobo (e.g., 5000 NGN)
            }),
        });

        const { data } = await response.json();

        if (!response.ok || !data.access_code) {
             throw new Error(data.message || 'Failed to initialize payment.');
        }

        const accessCode = data.access_code;
        
        // Step 2: Use access_code to pop up Paystack modal
        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            email: user.email,
            amount: 500000,
            access_code: accessCode, 
            onSuccess: (transaction) => {
                // In a real app, you would make another API call to your backend to verify the transaction
                // and then enroll the user.
                toast({
                    title: "Payment Successful!",
                    description: `Your payment was successful. Reference: ${transaction.reference}. Please wait for enrollment confirmation.`,
                });
                onEnrollmentSuccess(); 
            },
            onCancel: () => {
                 toast({
                    variant: 'destructive',
                    title: "Payment Cancelled",
                    description: "You have cancelled the payment process.",
                });
            }
        });
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsLoading(false);
        setLoadingAction(null);
    }
  }


  const handleRedeemCode = async () => {
    if (!accessCode) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please enter an access code.',
        });
        return;
    }
    
    setLoadingAction('redeem');
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
        setLoadingAction(null);
    }
  };

  return (
    <Card className="w-full max-w-md shrink-0">
      <CardHeader>
        <CardTitle>Enroll in Course</CardTitle>
        <CardDescription>
          Choose an enrollment method to begin learning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <Label htmlFor="access-code">Redeem Access Code</Label>
            <div className="flex gap-2 mt-1">
                <Input
                    id="access-code"
                    placeholder="Enter your code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    disabled={isLoading}
                />
                <Button onClick={handleRedeemCode} disabled={isLoading || loadingAction === 'purchase'}>
                    {isLoading && loadingAction === 'redeem' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Redeem
                </Button>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
        </div>
        
        <Button onClick={handlePurchase} className="w-full" size="lg" disabled={isLoading}>
            {isLoading && loadingAction === 'purchase' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Purchase Course
        </Button>
      </CardContent>
    </Card>
  );
}
