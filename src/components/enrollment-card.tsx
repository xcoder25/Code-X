
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
import { Loader2, UploadCloud, Copy, CheckCircle } from 'lucide-react';
import { redeemAccessCodeAction, enrollWithReceiptAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '@/app/auth-provider';

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
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Paystack Configuration
  const paystackConfig = {
      reference: (new Date()).getTime().toString(),
      email: user?.email || "",
      amount: 500000, // Amount in kobo (e.g., 5000 NGN)
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const onPaystackSuccess = (reference: any) => {
    // In a real app, you would make an API call to your backend to verify the transaction
    // and then generate an access code or directly enroll the user.
    toast({
        title: "Payment Successful!",
        description: `Your payment was successful. Reference: ${reference.reference}. Please wait for enrollment confirmation.`,
    });
    // For now, we'll simulate giving an access code after successful payment
    // This part should be handled by your backend in production
    onEnrollmentSuccess(); 
  };

  const onPaystackClose = () => {
    toast({
        variant: 'destructive',
        title: "Payment Cancelled",
        description: "You have cancelled the payment process.",
    });
  };

  const initializePayment = usePaystackPayment(paystackConfig);


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
            const result = await enrollWithReceiptAction({
                courseId,
                userId,
                receiptDataUrl: base64DataUrl,
                receiptFileName: receiptFile.name,
            });

            if (result.success) {
                setGeneratedCode(result.accessCode);
                 toast({
                    title: 'Receipt Submitted!',
                    description: 'Your unique access code has been generated.',
                });
            }
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
    if (!user?.email) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to make a purchase.',
      });
      return;
    }
     initializePayment({
      onSuccess: onPaystackSuccess,
      onClose: onPaystackClose,
    });
  }

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    toast({
        title: "Code Copied!",
        description: `${generatedCode} has been copied to your clipboard.`,
    });
  }
  
  if (generatedCode) {
    return (
        <Card className="w-full max-w-md shrink-0">
             <CardHeader>
                <CardTitle>Code Generated!</CardTitle>
                <CardDescription>
                    Your receipt has been submitted. Use the code below to enroll.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 !text-green-600" />
                    <AlertTitle>Your Access Code</AlertTitle>
                    <AlertDescription>
                        Copy this code and paste it into the "Redeem Access Code" field on this page to complete your enrollment.
                    </AlertDescription>
                </Alert>
                <div className="flex items-center space-x-2 mt-4">
                    <Input value={generatedCode} readOnly className="font-mono text-center"/>
                    <Button variant="outline" size="icon" onClick={copyCode}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={() => setGeneratedCode(null)}>Use a different method</Button>
            </CardFooter>
        </Card>
    );
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
