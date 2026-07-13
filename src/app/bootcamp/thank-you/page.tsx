'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useEffect, useRef, useState } from 'react';
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
  Tag,
  Printer,
  CalendarPlus,
  Share2,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function ThankYouPageContent() {
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const regId = searchParams.get('regId') || 'CX-2607-XXXX';
  const parentName = searchParams.get('name') || 'Parent';
  const childName = searchParams.get('child') || 'Student';
  const amountRaw = searchParams.get('amount') || '35000';
  const ageString = searchParams.get('age');
  const reference = searchParams.get('ref') || 'N/A';
  const sessionVal = searchParams.get('session') || 'morning';

  // Safely parse amount
  const amountNum = parseFloat(amountRaw.replace(/,/g, '')) || 35000;

  // Dynamically compute subtotal and discounts based on the program pricing formulas
  let subtotal = amountNum;
  let discount = 0;
  if (amountNum === 50000) {
    subtotal = 70000;
    discount = 20000;
  } else if (amountNum === 85000) {
    subtotal = 105000;
    discount = 20000;
  } else if (amountNum === 100000) {
    subtotal = 140000;
    discount = 40000;
  }

  // Determine age group
  let ageGroup = 'Junior Builders (5-11 years)';
  if (ageString) {
    const age = parseInt(ageString, 10);
    if (!isNaN(age)) {
      ageGroup = age >= 12 ? 'Senior Builders (12-17 years)' : 'Junior Builders (5-11 years)';
    }
  }

  // Session formatted name
  const sessionName = sessionVal === 'afternoon' 
    ? 'Afternoon Batch (2:00 PM - 4:00 PM WAT)' 
    : 'Morning Batch (10:00 AM - 12:00 PM WAT)';

  // 1. Confetti Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#f97316', '#fb923c', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];
    const confettiCount = 120;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Initialize particles shooting upward
    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 60,
        y: height + 20,
        size: Math.random() * 6 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 16,
        speedY: -Math.random() * 12 - 12,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.22; // gravity
        p.speedX *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;

        if (p.y < height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Barcode Generator
  const drawBarcode = () => {
    const hash = regId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bars = [];
    let currentX = 0;
    const pattern = [2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 2, 1, 3, 1];
    
    for (let i = 0; i < pattern.length; i++) {
      const width = pattern[i];
      const isBlack = i % 2 === 0;
      if (isBlack) {
        bars.push(
          <rect 
            key={i} 
            x={currentX} 
            y={0} 
            width={width} 
            height={36} 
            fill="currentColor"
          />
        );
      }
      currentX += width;
    }
    return { bars, totalWidth: currentX };
  };

  const { bars: barcodeBars, totalWidth: barcodeWidth } = drawBarcode();

  // 3. QR Code Generator
  const drawMiniQRCode = () => {
    const size = 15;
    const elements = [];
    
    // Finder pattern: Top-Left
    elements.push(<rect key="tl-out" x={0} y={0} width={4} height={4} fill="currentColor" />);
    elements.push(<rect key="tl-in" x={0.8} y={0.8} width={2.4} height={2.4} fill="black" />);
    elements.push(<rect key="tl-dot" x={1.4} y={1.4} width={1.2} height={1.2} fill="currentColor" />);
    
    // Finder pattern: Top-Right
    elements.push(<rect key="tr-out" x={11} y={0} width={4} height={4} fill="currentColor" />);
    elements.push(<rect key="tr-in" x={11.8} y={0.8} width={2.4} height={2.4} fill="black" />);
    elements.push(<rect key="tr-dot" x={12.4} y={1.4} width={1.2} height={1.2} fill="currentColor" />);
    
    // Finder pattern: Bottom-Left
    elements.push(<rect key="bl-out" x={0} y={11} width={4} height={4} fill="currentColor" />);
    elements.push(<rect key="bl-in" x={0.8} y={11.8} width={2.4} height={2.4} fill="black" />);
    elements.push(<rect key="bl-dot" x={1.4} y={12.4} width={1.2} height={1.2} fill="currentColor" />);
    
    // Randomized payload blocks
    const hash = regId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (r < 5 && c < 5) continue;
        if (r < 5 && c > 9) continue;
        if (r > 9 && c < 5) continue;
        
        const filled = ((hash * (r + 4) * (c + 7)) % 9) > 4;
        if (filled) {
          elements.push(
            <rect 
              key={`dot-${r}-${c}`} 
              x={c} 
              y={r} 
              width={1} 
              height={1} 
              fill="currentColor" 
            />
          );
        }
      }
    }
    return elements;
  };

  // 4. Generate ICS file contents for Calendar download
  const generateIcsHref = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Code-X Tech//Bootcamp Onboarding//EN',
      'BEGIN:VEVENT',
      'UID:uid_bootcamp_20260727_codextech@codextech.com',
      'DTSTAMP:20260713T090000Z',
      'DTSTART;TZID=Africa/Lagos:20260727T100000',
      'DTEND;TZID=Africa/Lagos:20260727T120000',
      'SUMMARY:Code-X AI & Coding Holiday Bootcamp Starts! 🚀',
      `DESCRIPTION:Hello ${parentName}! Get ready for your child ${childName}'s first day of virtual AI class!\\n\\nRegistration ID: ${regId}\\nSession: ${sessionName}\\nClass Link: Zoom details will be sent to ${searchParams.get('email') || 'your email'}.`,
      'LOCATION:Virtual (Zoom Classroom Link to follow)',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'DESCRIPTION:Code-X Bootcamp starts tomorrow!',
      'ACTION:DISPLAY',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
  };

  // Google Calendar Web Link Generator
  const generateGoogleCalendarUrl = () => {
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const text = encodeURIComponent('Code-X AI & Coding Holiday Bootcamp Starts! 🚀');
    const dates = '20260727T100000/20260727T120000';
    const details = encodeURIComponent(
      `Hi ${parentName}! Your child ${childName} is registered for the Code-X AI Bootcamp.\n\nRegistration ID: ${regId}\nSession: ${sessionName}\nVenue: Virtual (Zoom Classroom links to follow).`
    );
    const location = encodeURIComponent('Virtual (Zoom Classroom)');
    return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}&ctz=Africa/Lagos`;
  };

  // 5. Social Share Actions
  const shareText = `My child is registered for the CODE-X AI Holiday Bootcamp starting July 27th! 🚀 Empowering young innovators with AI and coding. Check it out at www.codextech.com`;
  const shareOnWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const shareOnTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden font-body">
      {/* Background glowing mesh effects */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-orange-500/10 via-[#0e0c15]/0 to-[#060608] pointer-events-none z-0"></div>
      <div className="absolute top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-orange-600/15 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none z-0"></div>

      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full z-50 animate-in fade-in duration-300" />

      {/* Custom Global CSS rules for printing */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: 2px solid #e4e4e7 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
          }
          .print-card * {
            color: black !important;
          }
          .print-badge {
            background-color: #f4f4f5 !important;
            border: 1px solid #e4e4e7 !important;
            color: black !important;
          }
          .print-highlight {
            color: #f97316 !important;
            font-weight: 800 !important;
          }
          .print-tear-line {
            border-top: 2px dashed #a1a1aa !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center bg-zinc-950/40 backdrop-blur-md border-b border-zinc-900/60 z-10 no-print">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center justify-center gap-3 hover:opacity-90 transition-all duration-300">
            <Image
              src="/my logo.png"
              alt="Code-X Logo"
              width={38}
              height={38}
              className="text-primary rounded-full ring-2 ring-orange-500/30"
            />
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">CODE-X</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-full">
            <Lock className="h-3.5 w-3.5 text-green-500" /> Secure SSL Connection
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20 z-10">
        <div className="w-full max-w-2xl space-y-8 animate-fade-slide-up">
          
          {/* Success Banner */}
          <div className="text-center space-y-4 no-print">
            <div className="inline-flex items-center justify-center p-3.5 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 mb-1 shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-pulse">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">Payment Received!</h1>
              <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Thank you, <span className="text-white font-bold">{parentName}</span>. Your seat is confirmed for the bootcamp. We have logged your transaction reference.
              </p>
            </div>
          </div>

          {/* Premium Branded Ticket Card */}
          <Card className="print-card bg-zinc-950/70 border-zinc-900 shadow-2xl relative overflow-hidden backdrop-blur-xl rounded-3xl">
            {/* Top Glowing Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400"></div>
            
            {/* Background design accents */}
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-orange-500/5 blur-2xl pointer-events-none"></div>

            <CardHeader className="pb-6 pt-8 px-6 sm:px-10 border-b border-zinc-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500/10 border border-orange-500/20 text-orange-400 print-badge">
                      Virtual Cohort
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-500/10 border border-green-500/20 text-green-400 print-badge">
                      Paid
                    </span>
                  </div>
                  <CardTitle className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                    BOOTCAMP PASS
                  </CardTitle>
                </div>
                <div className="text-left sm:text-right space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Registration Date</span>
                  <p className="text-sm font-semibold text-zinc-300">July 13, 2026</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 relative">
              {/* Notched Circle Cutouts - Left and Right */}
              <div className="absolute -left-3.5 top-[155px] w-7 h-7 bg-[#060608] rounded-full border-r border-zinc-900 z-10 no-print"></div>
              <div className="absolute -right-3.5 top-[155px] w-7 h-7 bg-[#060608] rounded-full border-l border-zinc-900 z-10 no-print"></div>

              {/* Top half: Ticket Admission Pass Info */}
              <div className="px-6 sm:px-10 pt-8 pb-8 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-3 space-y-5">
                  
                  {/* Parent Name / Reg ID */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">Admission Pass ID</span>
                    <p className="text-xl font-black text-orange-500 print-highlight tracking-widest mt-0.5">{regId}</p>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Student</span>
                      <span className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 mt-0.5">
                        <User className="h-3.5 w-3.5 text-zinc-500" /> {childName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Age Group</span>
                      <span className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 mt-0.5">
                        <Bookmark className="h-3.5 w-3.5 text-zinc-500" /> {ageGroup.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Start Date</span>
                      <span className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" /> July 27, 2026
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Class Venue</span>
                      <span className="text-sm font-semibold text-zinc-300 flex items-center gap-1.5 mt-0.5">
                        <Video className="h-3.5 w-3.5 text-zinc-500" /> Zoom Classroom
                      </span>
                    </div>
                  </div>

                  {/* Preferred Batch Session */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Allocated Batch Session</span>
                    <span className="text-xs font-semibold text-zinc-300 block mt-0.5">
                      {sessionName}
                    </span>
                  </div>

                </div>

                {/* Right side: High-fidelity QR Code + Barcode wrapper */}
                <div className="md:col-span-2 flex flex-col items-center justify-center bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-inner max-w-[200px] mx-auto md:mr-0">
                  <div className="w-28 h-28 text-white bg-black p-2 rounded-lg flex items-center justify-center border border-zinc-800">
                    <svg viewBox="0 0 15 15" className="w-full h-full text-zinc-100">
                      {drawMiniQRCode()}
                    </svg>
                  </div>
                  <div className="w-full text-center space-y-1.5">
                    <svg 
                      viewBox={`0 0 ${barcodeWidth} 36`} 
                      className="w-full h-8 text-zinc-400"
                      preserveAspectRatio="none"
                    >
                      {barcodeBars}
                    </svg>
                    <span className="text-[9px] font-mono text-zinc-500 tracking-wider uppercase block">verify admission pass</span>
                  </div>
                </div>
              </div>

              {/* Dashed Tear-Line Separator */}
              <div className="relative py-4 no-print">
                <div className="print-tear-line absolute inset-x-0 top-1/2 border-t border-dashed border-zinc-900 h-0 w-full"></div>
              </div>

              {/* Bottom half: Branded Invoice / Receipt breakdown */}
              <div className="px-6 sm:px-10 pb-8 pt-4 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                    <Receipt className="h-4 w-4 text-orange-500" /> OFFICIAL PAYMENT RECEIPT
                  </h3>
                  
                  {/* Detailed calculations table */}
                  <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-5 space-y-3 text-sm">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Bootcamp Admission Fee Base</span>
                      <span className="font-semibold text-zinc-300">₦{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 font-medium">
                        <span>Family Offer Discount</span>
                        <span>-₦{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Processing VAT & Platform Fees</span>
                      <span className="font-semibold text-zinc-300">₦0.00</span>
                    </div>

                    <Separator className="bg-zinc-900/80 my-2" />

                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-white">Total Amount Paid</span>
                      <span className="text-xl font-black text-orange-500 print-highlight">
                        ₦{amountNum.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="text-zinc-500 block">Gateway Reference</span>
                    <span className="font-mono text-zinc-300 select-all block break-all">{reference}</span>
                  </div>
                  <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-3 space-y-1">
                    <span className="text-zinc-500 block">Payment Method</span>
                    <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      Paystack Secure Card Checkout
                    </span>
                  </div>
                </div>

                {/* Onboarding steps list */}
                <div className="bg-zinc-900/20 border border-zinc-900/50 rounded-2xl p-5 space-y-3 no-print">
                  <h4 className="text-xs font-black uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> ONBOARDING NEXT STEPS
                  </h4>
                  <ul className="text-xs text-zinc-400 space-y-3 pl-1">
                    <li className="flex gap-2">
                      <span className="text-orange-500 font-bold">01.</span>
                      <span>An automated payment confirmation invoice copy has been sent to your registered email address.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500 font-bold">02.</span>
                      <span>On <strong>Saturday, 20th July 2026</strong> (one week prior to program start), we will email your child's onboarding package. This includes Zoom link credentials, Slack channel access, and setup guidelines.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500 font-bold">03.</span>
                      <span>Class begins on <strong>Saturday, 27th July 2026</strong> at 10:00 AM WAT.</span>
                    </li>
                  </ul>
                </div>

              </div>
            </CardContent>

            <CardFooter className="bg-zinc-950 border-t border-zinc-900/60 p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Phone className="h-4 w-4 text-zinc-400" /> Urgent queries: info@codextech.com
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => window.print()}
                  variant="outline" 
                  className="w-full sm:w-auto border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Action Toolbar Below Ticket (no-print) */}
          <div className="space-y-4 no-print">
            
            {/* Add to Calendar Section */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-orange-500" /> SYNC SESSION TO CALENDAR
              </h3>
              <p className="text-xs text-zinc-400">
                Download the program schedule directly to your Google Calendar, Apple, Outlook, or smartphone calendar.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  asChild
                  variant="outline" 
                  className="flex-1 border-zinc-800 hover:bg-zinc-900 text-zinc-300 rounded-xl py-5"
                >
                  <a href={generateGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs font-bold">
                    Add to Google Calendar <ExternalLink className="h-3.5 w-3.5 opacity-65" />
                  </a>
                </Button>
                
                <Button 
                  asChild
                  variant="outline" 
                  className="flex-1 border-zinc-800 hover:bg-zinc-900 text-zinc-300 rounded-xl py-5"
                >
                  <a href={generateIcsHref()} download="codex-bootcamp.ics" className="flex items-center justify-center gap-2 text-xs font-bold">
                    Download iCal (.ics) Event
                  </a>
                </Button>
              </div>
            </div>

            {/* Share / Social seat referral */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-orange-500" /> SPREAD THE WORD
              </h3>
              <p className="text-xs text-zinc-400">
                Let your friends and network know your child is preparing to build with AI!
              </p>
              <div className="flex gap-2">
                <Button 
                  asChild
                  variant="outline" 
                  className="flex-1 border-zinc-800 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-emerald-400 rounded-xl py-5"
                >
                  <a href={shareOnWhatsApp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs font-bold">
                    Share on WhatsApp
                  </a>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="flex-1 border-zinc-800 hover:bg-blue-500/10 hover:border-blue-500/20 text-blue-400 rounded-xl py-5"
                >
                  <a href={shareOnTwitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs font-bold">
                    Share on X (Twitter)
                  </a>
                </Button>
              </div>
            </div>

            {/* Back Home CTA Button */}
            <div className="text-center pt-2">
              <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-6 rounded-xl shadow-lg shadow-orange-500/10">
                <Link href="/" className="flex items-center justify-center gap-2 text-sm tracking-wide">
                  Done & Go to Dashboard <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/40 py-6 text-center text-xs text-zinc-700 no-print z-10">
        <p>© 2026 CODE-X Tech. All rights reserved. Secure payment logs.</p>
      </footer>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse space-y-3 text-center">
          <div className="w-10 h-10 border-4 border-t-orange-500 border-r-transparent border-zinc-800 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-orange-500 font-bold">Verifying Registration...</p>
          <p className="text-zinc-500 text-xs">Please hold on, loading your confirmation summary.</p>
        </div>
      </div>
    }>
      <ThankYouPageContent />
    </Suspense>
  );
}
