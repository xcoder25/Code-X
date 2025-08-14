
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
import { Loader2, UploadCloud } from 'lucide-react';
import { redeemAccessCodeAction, enrollWithReceiptAction } from '@/app/actions';

interface EnrollmentCardProps {
    courseId: string;
    userId: string;
    onEnrollmentSuccess: () => void;
}

export default function EnrollmentCard({ courseId, userId, onEnrollmentSuccess }: EnrollmentCardProps) {
  const [accessCode, setAccessCode] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'redeem' | 'purchase' | 'receipt' | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Basic validation for image files
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', description: "Please upload a valid image file." });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a receipt file to upload.',
        });
        return;
    }

    setIsLoading(true);
    setLoadingAction('receipt');

    const reader = new FileReader();
    reader.readAsDataURL(receiptFile);
    reader.onload = async () => {
        try {
            const base64DataUrl = reader.result as string;
            await enrollWithReceiptAction({
                courseId,
                userId,
                receiptDataUrl: base64DataUrl,
                receiptFileName: receiptFile.name,
            });
            toast({
                title: 'Receipt Submitted!',
                description: 'Your enrollment is being processed. You are now enrolled.',
            });
            onEnrollmentSuccess();
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Enrollment Failed',
                description: error.message || 'Could not process your receipt. Please try again.',
            });
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', description: 'Could not read file. Please try again.' });
        setIsLoading(false);
        setLoadingAction(null);
    }
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
                <Button onClick={handleRedeemCode} disabled={isLoading}>
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

        <div>
            <Label htmlFor="receipt-upload">Upload Receipt</Label>
            <div className="flex items-center justify-center border-2 border-dashed rounded-md h-32 cursor-pointer hover:border-primary transition mt-1 relative">
                <div className="text-center">
                    <UploadCloud className="mx-auto text-muted-foreground w-8 h-8" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {receiptFile ? receiptFile.name : "Click to upload receipt"}
                    </p>
                </div>
                <Input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isLoading}
                />
            </div>
            {receiptFile && (
                <Button onClick={handleReceiptUpload} className="w-full mt-2" disabled={isLoading}>
                    {isLoading && loadingAction === 'receipt' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Receipt
                </Button>
            )}
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
