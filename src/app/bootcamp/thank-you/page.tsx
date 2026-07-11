'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Video, 
  Mail, 
  Phone,
  Bookmark,
  Receipt,
  User,
  Child,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  
  const regId = searchParams.get('regId') || 'CX-2607-XXXX';
  const parentName = searchParams.get('name') || 'Parent';
  const childName = searchParams.get('child') || 'Student';
  const amount = searchParams.get('amount') || '35,000';
  const ageString = searchParams.get('age');
  const reference = searchParams.get('ref') || 'SIMULATED';

  // Determine age group if age is provided
  let ageGroup = '';
  if (ageString) {
    const age = parseInt(ageString, 10);
    if (!isNaN(age)) {
      ageGroup = age >= 12 ? 'Senior Builders (12-17 years)' : 'Junior Builders (5-11 years)';
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="px-4 lg:px-8 h-16 flex items-center bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <Link href="/" className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Image
            src="/my logo.png"
            alt="Code-X Logo"
            width={32}
            height={32}
            className="text-primary"
          />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Code-X</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          
          {/* Success Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 bg-green-500/10 border border-green-500/25 rounded-full text-green-400 mb-2">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Registration Confirmed!</h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
              Thank you, <span className="text-white font-semibold">{parentName}</span>. Your payment was verified and child's enrollment is complete.
            </p>
          </div>

          {/* Receipt & Details Card */}
          <Card className="bg-zinc-950 border-zinc-900 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-300"></div>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-orange-500" /> Enrollment Summary
              </CardTitle>
              <CardDescription className="text-zinc-500">
                A confirmation copy has been logged and sent to your email.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              
              {/* Registration ID Banner */}
              <div className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Registration ID</span>
                  <p className="text-lg font-black text-orange-500 tracking-wider mt-0.5">{regId}</p>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Status</span>
                  <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Paid & Secured
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 flex items-center gap-2"><User className="h-4 w-4 text-zinc-400" /> Student Name</span>
                  <span className="font-bold text-zinc-200">{childName}</span>
                </div>
                {ageGroup && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500 flex items-center gap-2"><Bookmark className="h-4 w-4 text-zinc-400" /> Age Group</span>
                    <span className="font-bold text-zinc-200">{ageGroup}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 flex items-center gap-2"><Calendar className="h-4 w-4 text-zinc-400" /> Start Date</span>
                  <span className="font-bold text-zinc-200">Saturday, 27th July 2026</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 flex items-center gap-2"><Video className="h-4 w-4 text-zinc-400" /> Format</span>
                  <span className="font-bold text-zinc-200">100% Virtual (Zoom)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-500 flex items-center gap-2"><Tag className="h-4 w-4 text-zinc-400" /> Reference</span>
                  <span className="font-mono text-xs text-zinc-400 truncate max-w-[200px] sm:max-w-xs">{reference}</span>
                </div>
                <Separator className="bg-zinc-900 my-2" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-400 font-bold">Total Paid</span>
                  <span className="text-xl font-extrabold text-white">₦{Number(amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Action details */}
              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> What Happens Next?
                </h4>
                <ol className="list-decimal pl-4 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
                  <li>We have logged an automated onboarding confirmation mail. Check your inbox (or spam folder) for details.</li>
                  <li>On **Saturday, 20th July 2026** (one week before class), we will send the onboarding packages containing Zoom class links, Google Classroom invites, and coding editor setups.</li>
                  <li>If you need instant assistance or registered multiple kids and want details, please contact us immediately.</li>
                </ol>
              </div>

            </CardContent>

            <CardFooter className="bg-zinc-900/20 border-t border-zinc-900/60 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Phone className="h-4 w-4 text-zinc-400" /> Support: info@codextech.com
              </div>
              <Button asChild className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-6">
                <Link href="/" className="flex items-center gap-2">
                  Done & Go Home <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-700">
        <p>© 2026 CODE-X Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}
