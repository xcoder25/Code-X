
'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Chip } from 'lucide-react';

interface AdminIdCardProps {
  admin: User;
}

export default function AdminIdCard({ admin }: AdminIdCardProps) {

  const adminId = `ADMN-${admin.uid.substring(0, 6).toUpperCase()}`;
  const ceoName = "Jahsfreedman Moffat";
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  }

  return (
    <div 
        className="w-full max-w-lg cursor-pointer" 
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-[280px] font-sans"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front of the Card */}
        <div className="absolute w-full h-full rounded-2xl shadow-2xl bg-slate-900 text-white overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Image src="/my logo.png" alt="Code-X Logo" width={24} height={24} />
                        <h2 className="font-bold text-md tracking-wider text-gray-200">CODE-X ACADEMY</h2>
                    </div>
                    <p className="font-black text-sm text-yellow-900 bg-yellow-400 px-2 py-0.5 rounded">CEO</p>
                </div>

                <div className="flex-grow flex items-center gap-6 mt-4">
                     <div className="flex flex-col items-center gap-4 text-center">
                        <div className="relative p-1 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600">
                             <Avatar className="h-28 w-28 border-4 border-slate-900">
                                <AvatarImage src={admin.photoURL || undefined} data-ai-hint="ceo person" />
                                <AvatarFallback className="text-5xl text-gray-800 bg-gray-300">
                                {ceoName?.charAt(0) || 'A'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-gray-50">{ceoName}</h3>
                            <p className="text-sm font-mono text-amber-400/80">{adminId}</p>
                        </div>
                    </div>
                </div>

                 <div className="flex justify-start items-center gap-3">
                    <Chip className="h-10 w-10 text-amber-400" />
                    <p className="text-[8px] font-mono text-gray-400 max-w-24">AUTHORIZED PERSONNEL IDENTIFICATION CX-10</p>
                </div>
            </div>
        </div>

        {/* Back of the Card */}
        <div 
            className="absolute w-full h-full rounded-2xl shadow-2xl bg-slate-900 text-white overflow-hidden" 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
             <div className="absolute top-6 w-full h-12 bg-black"></div>
             <div className="p-6 flex flex-col h-full justify-between">
                <div className="pt-20">
                    <div className="bg-slate-800 p-3 rounded-lg text-xs space-y-2">
                        <p className="font-semibold text-gray-300">Authorization Statement</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed">
                            This card grants the bearer full administrative access to all Code-X Academy systems. Misuse is strictly prohibited. If found, please return to Code-X HQ.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-end gap-4">
                     <div className="flex-1">
                        <p className="text-[8px] font-semibold uppercase tracking-widest text-amber-400/80">Signature</p>
                        <div className="mt-1 pr-4 h-10 flex items-center border-b border-gray-600">
                            <p className="font-serif italic text-xl text-gray-200">J.M. Moffat</p>
                        </div>
                    </div>
                     <div className="flex flex-col items-center">
                        <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=codex-admin-${admin.uid}&bgcolor=1e293b&color=fde047&qzone=1`} width={60} height={60} alt="QR Code" className="rounded-md border-2 border-amber-400/20" />
                        <p className="text-[8px] text-amber-400/50 mt-1 font-mono">VERIFICATION</p>
                    </div>
                </div>
             </div>
        </div>
      </motion.div>
    </div>
  );
}
