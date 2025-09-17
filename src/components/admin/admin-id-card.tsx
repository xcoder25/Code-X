
'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu } from 'lucide-react';

interface AdminIdCardProps {
  admin: User;
}

export default function AdminIdCard({ admin }: AdminIdCardProps) {
  const adminId = `ADMN-${admin.uid.substring(0, 6).toUpperCase()}`;
  const ceoName = 'Jahsfreedman Moffat';
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="w-full max-w-sm cursor-pointer font-sans"
      onClick={handleFlip}
      style={{ perspective: '1200px' }}
    >
      <motion.div
        className="relative w-full h-[520px]"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front of the Card */}
        <div
          className="absolute w-full h-full rounded-2xl shadow-2xl bg-slate-900 text-white overflow-hidden border border-slate-700/50"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.1))] opacity-20"></div>
          <div className="p-6 flex flex-col h-full items-center text-center">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/my logo.png"
                alt="Code-X Logo"
                width={32}
                height={32}
              />
              <h2 className="font-bold text-xl tracking-wider text-gray-200">
                CODE-X
              </h2>
            </div>

            <div className="my-4 relative">
              <Avatar className="h-40 w-40 border-4 border-amber-400/50">
                <AvatarImage
                  src={admin.photoURL || undefined}
                  data-ai-hint="ceo person"
                />
                <AvatarFallback className="text-6xl text-gray-800 bg-gray-300">
                  {ceoName?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center opacity-80">
                <ShieldCheck className="text-white/70 h-8 w-8" />
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-center">
              <h3 className="text-3xl font-bold tracking-tight text-gray-50">
                {ceoName}
              </h3>
              <p className="text-md text-amber-400/90 mt-1">
                CEO
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 text-left mt-6 text-xs">
              <div>
                <p className="uppercase font-semibold text-slate-400">
                  Employee ID
                </p>
                <p className="font-mono text-base text-slate-200">{adminId}</p>
              </div>
               <div>
                <p className="uppercase font-semibold text-slate-400">
                  Department
                </p>
                <p className="font-mono text-base text-slate-200">Executive</p>
              </div>
              <div>
                <p className="uppercase font-semibold text-slate-400">
                  Country
                </p>
                <p className="font-mono text-base text-slate-200">Nigeria</p>
              </div>
               <div>
                <p className="uppercase font-semibold text-slate-400">
                  Access Level
                </p>
                <p className="font-mono text-base text-slate-200">Level X</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back of the Card */}
        <div
          className="absolute w-full h-full rounded-2xl shadow-2xl bg-slate-900 text-white overflow-hidden border border-slate-700/50 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-12 bg-black mt-8"></div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4 text-center">
                <Image src="https://barcode.tec-it.com/barcode.ashx?data=CODE-X-CEO-001&code=Code128&translate-esc=true&bgcolor=1e293b&color=ffffff" width={280} height={50} alt="Barcode" className="mx-auto" />
                <div className="font-mono text-xs text-slate-400 space-y-1">
                    <p>www.codex.com</p>
                    <p>ceo@codex.com</p>
                    <p>+234-XXX-XXX-XXXX</p>
                </div>
            </div>
            
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Signature
              </p>
              <div className="mt-1 pr-4 h-12 flex items-center border-b-2 border-slate-600">
                <p className="font-serif italic text-2xl text-slate-200">
                  J.M. Moffat
                </p>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500">
              <p>
                If found, please return to Code-X Academy headquarters.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
