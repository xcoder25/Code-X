'use client';

import { useState } from 'react';
import { useRouter as useAppRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CreditCard, Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { processRegistration } from '@/app/bootcamp/actions';
import { registrationSchema, type RegistrationData } from '@/app/bootcamp/schema';

// Dynamic Paystack import wrapper to prevent SSR issues
const getPaystackPop = async () => {
  const PaystackPop = (await import('@paystack/inline-js')).default;
  return PaystackPop;
};

export default function BootcampForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStage, setPaymentStage] = useState<'form' | 'payment' | 'processing'>('form');
  const { toast } = useToast();
  const router = useAppRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      numberOfChildren: 1,
      preferredSession: 'morning',
      howDidYouHear: '',
    },
  });

  const watchEmail = watch('email');
  const watchNumChildren = watch('numberOfChildren') || 1;
  const watchParentName = watch('parentName');

  // Pricing Logic:
  // 1 child: ₦35,000
  // 2 children: ₦50,000 (Family Offer)
  // 3 children: ₦85,000 (₦50k + ₦35k)
  // 4 children: ₦100,000 (2x ₦50k)
  // Generic formula:
  const calculatePrice = (count: number) => {
    const pairs = Math.floor(count / 2);
    const remainder = count % 2;
    return (pairs * 50000) + (remainder * 35000);
  };

  const amountNgn = calculatePrice(watchNumChildren);
  const amountKobo = amountNgn * 100;

  // Check if public key is available
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

  const onSubmit = async (formData: RegistrationData) => {
    if (!paystackPublicKey) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Payment system is not properly configured. Please contact support.',
      });
      return;
    }

    setIsLoading(true);
    setPaymentStage('payment');

    try {
      // Real Paystack Flow
      // Step 1: Initialize transaction with backend
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          amount: amountKobo.toString(),
        }),
      });

      const initResult = await response.json();

      if (!response.ok || !initResult.status || !initResult.data?.access_code) {
        throw new Error(initResult.message || 'Failed to initialize payment transaction.');
      }

      const accessCode = initResult.data.access_code;
      setPaymentStage('processing');

      // Step 2: Load Paystack Pop and trigger modal
      const PaystackPop = await getPaystackPop();
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: paystackPublicKey,
        email: formData.email,
        amount: amountKobo,
        access_code: accessCode,
        onSuccess: async (transaction: any) => {
          setIsLoading(true);
          try {
            // Save to Database via Server Action
            const result = await processRegistration({
              formData,
              amount: amountKobo,
              paymentReference: transaction.reference,
            });

            if (result.success) {
              toast({
                title: 'Payment Confirmed!',
                description: `Registration completed. ID: ${result.registrationId}`,
              });
              router.push(`/bootcamp/thank-you?regId=${result.registrationId}&name=${encodeURIComponent(formData.parentName)}&child=${encodeURIComponent(formData.childName)}&amount=${amountNgn}&ref=${transaction.reference}&age=${formData.childAge}&session=${formData.preferredSession}`);
            }
          } catch (err: any) {
            console.error('Error saving registration:', err);
            toast({
              variant: 'destructive',
              title: 'Database Save Error',
              description: err.message || 'Payment succeeded but registration failed to save. Please contact support.',
            });
          } finally {
            setIsLoading(false);
          }
        },
        onCancel: () => {
          setIsLoading(false);
          setPaymentStage('form');
          toast({
            variant: 'destructive',
            title: 'Payment Cancelled',
            description: 'You closed the payment window.',
          });
        },
      } as any);
    } catch (error: any) {
      console.error('Registration/Payment Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
      setPaymentStage('form');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-zinc-900 border-zinc-800 text-white shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400"></div>
      
      <CardHeader className="space-y-1 pb-6 pt-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-orange-500 mb-1">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase">Secure Enrollment</span>
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">Register for Bootcamp</CardTitle>
        <CardDescription className="text-zinc-400">
          Enter details below to secure your child's spot in our virtual AI cohort.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {paymentStage === 'form' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="parentName" className="text-zinc-300 text-sm font-medium">Parent Name</Label>
                <Input
                  id="parentName"
                  placeholder="e.g. John Doe"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-600 rounded-xl"
                  {...register('parentName')}
                  disabled={isLoading}
                />
                {errors.parentName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.parentName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-600 rounded-xl"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-zinc-300 text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. +234 80 1234 5678"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-600 rounded-xl"
                  {...register('phone')}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="schoolName" className="text-zinc-300 text-sm font-medium">School Name</Label>
                <Input
                  id="schoolName"
                  placeholder="e.g. Greenwood Academy"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-600 rounded-xl"
                  {...register('schoolName')}
                  disabled={isLoading}
                />
                {errors.schoolName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.schoolName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="childName" className="text-zinc-300 text-sm font-medium">Child's Name</Label>
                <Input
                  id="childName"
                  placeholder="e.g. Alex Doe"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-600 rounded-xl"
                  {...register('childName')}
                  disabled={isLoading}
                />
                {errors.childName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.childName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="childAge" className="text-zinc-300 text-sm font-medium">Child's Age</Label>
                <Input
                  id="childAge"
                  type="number"
                  placeholder="e.g. 10"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-600 rounded-xl"
                  {...register('childAge')}
                  disabled={isLoading}
                />
                {errors.childAge && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.childAge.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="numberOfChildren" className="text-zinc-300 text-sm font-medium">Number of Children</Label>
                <Select
                  defaultValue="1"
                  onValueChange={(val) => setValue('numberOfChildren', parseInt(val))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white rounded-xl focus:ring-orange-500">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="1">1 Child</SelectItem>
                    <SelectItem value="2">2 Children (Family Offer)</SelectItem>
                    <SelectItem value="3">3 Children</SelectItem>
                    <SelectItem value="4">4 Children (2x Family Offer)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.numberOfChildren && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.numberOfChildren.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="preferredSession" className="text-zinc-300 text-sm font-medium">Preferred Session</Label>
                <Select
                  defaultValue="morning"
                  onValueChange={(val: 'morning' | 'afternoon') => setValue('preferredSession', val)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white rounded-xl focus:ring-orange-500">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="morning">Morning (10:00 AM - 12:00 PM WAT)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (2:00 PM - 4:00 PM WAT)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.preferredSession && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.preferredSession.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="howDidYouHear" className="text-zinc-300 text-sm font-medium">How did you hear about us?</Label>
                <Input
                  id="howDidYouHear"
                  placeholder="e.g. Instagram, Referral, Google"
                  className="bg-zinc-950 border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-600 rounded-xl"
                  {...register('howDidYouHear')}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Dynamic Price Preview */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Total Enrollment Fee</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-orange-500">₦{amountNgn.toLocaleString()}</span>
                  {watchNumChildren === 2 && (
                    <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      Family Discount Applied (Save ₦20,000)
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 h-auto rounded-xl shadow-lg shadow-orange-500/20 active:scale-98 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Register & Pay Now
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                {paymentStage === 'payment' ? 'Initializing Secure Payment...' : 'Processing Transaction...'}
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                {paymentStage === 'payment'
                  ? 'We are setting up your payment session with Paystack. Please do not close this window.'
                  : 'Please complete the payment in the pop-up window to confirm registration.'}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-zinc-950/50 border-t border-zinc-800/40 py-4 flex flex-col sm:flex-row justify-between gap-3 text-xs text-zinc-500 text-center sm:text-left">
        <p>🔒 Secured by Paystack. Your transaction is fully encrypted.</p>
        <p>Need help? Contact support via WhatsApp.</p>
      </CardFooter>
    </Card>
  );
}
