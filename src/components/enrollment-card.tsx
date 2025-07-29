
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

interface EnrollmentCardProps {
    courseId: string;
    onEnrollmentSuccess: () => void;
}

// Mock valid access codes for demonstration
const VALID_CODES = ['BOOTCAMP-2024-S1', 'FREE-ACCESS-123'];

export default function EnrollmentCard({ courseId, onEnrollmentSuccess }: EnrollmentCardProps) {
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
    
    // Simulate API call to validate the access code
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (VALID_CODES.includes(accessCode)) {
        toast({
            title: 'Success!',
            description: 'Access code redeemed. You are now enrolled in the course.',
        });
        onEnrollmentSuccess();
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid Code',
            description: 'The access code you entered is not valid. Please try again.',
        });
    }

    setIsLoading(false);
  };
  
  const handlePurchase = () => {
    // In a real app, this would redirect to a checkout page (e.g., Stripe)
    toast({
        title: 'Redirecting to checkout...',
        description: 'This is where the payment flow would begin.',
    });
  }

  return (
    <Card className="w-full max-w-md shrink-0">
      <CardHeader>
        <CardTitle>Enroll in Course</CardTitle>
        <CardDescription>
          Redeem an access code or purchase the course to begin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="access-code">Access Code</Label>
            <div className="flex gap-2">
                <Input
                    id="access-code"
                    placeholder="Enter your code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    disabled={isLoading}
                />
                <Button onClick={handleRedeemCode} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            Purchase Course
        </Button>
      </CardContent>
    </Card>
  );
}
