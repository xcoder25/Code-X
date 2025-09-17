
'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

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
        className="w-full max-w-sm cursor-pointer font-sans" 
        onClick={handleFlip}
        style={{ perspective: '1200px' }}
    >
      <motion.div
        className="relative w-full h-[480px]"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of the Card */}
        <div className="absolute w-full h-full rounded-2xl shadow-2xl bg-[#1A1A1A] text-white overflow-hidden border border-gray-700/50" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.1))] opacity-20"></div>
            <div className="p-8 flex flex-col h-full items-center text-center">
                <div className="flex items-center gap-3">
                    <Image src="/my logo.png" alt="Code-X Logo" width={32} height={32} />
                    <h2 className="font-bold text-xl tracking-wider text-gray-200">CODE-X</h2>
                </div>
                
                <div className="my-8">
                     <Avatar className="h-40 w-40 border-4 border-amber-400/50">
                        <AvatarImage src={admin.photoURL || undefined} data-ai-hint="ceo person" />
                        <AvatarFallback className="text-6xl text-gray-800 bg-gray-300">
                        {ceoName?.charAt(0) || 'A'}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-3xl font-bold tracking-tight text-gray-50">{ceoName}</h3>
                    <p className="text-md text-amber-400/90 mt-1">Chief Executive Officer</p>
                </div>

                 <div className="w-full text-center mt-auto">
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="font-mono text-lg text-gray-300 tracking-widest">{adminId}</p>
                </div>
            </div>
        </div>

        {/* Back of the Card */}
        <div 
            className="absolute w-full h-full rounded-2xl shadow-2xl bg-[#1A1A1A] text-white overflow-hidden border border-gray-700/50" 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
            <div className="absolute top-8 w-full h-16 bg-black"></div>
            <div className="p-8 flex flex-col h-full justify-between">
                <div className="text-center pt-24">
                     <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=codex-admin-${admin.uid}&bgcolor=1a1a1a&color=ffffff&qzone=1`} width={120} height={120} alt="QR Code" className="rounded-lg mx-auto border-2 border-gray-700" />
                </div>
                
                <div>
                     <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Signature</p>
                    <div className="mt-2 pr-4 h-12 flex items-center border-b-2 border-gray-600">
                        <p className="font-serif italic text-2xl text-gray-200">J.M. Moffat</p>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-500">
                   <p>This card is the property of Code-X Academy.</p>
                   <p>If found, please return to our headquarters.</p>
                </div>
             </div>
        </div>
      </motion.div>
    </div>
  );
}
