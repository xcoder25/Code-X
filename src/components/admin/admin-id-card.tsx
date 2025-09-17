
'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';

interface AdminIdCardProps {
  admin: User;
}

export default function AdminIdCard({ admin }: AdminIdCardProps) {

  const adminId = `ADMN-${admin.uid.substring(0, 6).toUpperCase()}`;
  const ceoName = "Jahsfreedman Moffat";

  return (
    <div className="relative max-w-lg w-full bg-gray-900 rounded-2xl shadow-2xl text-white font-sans overflow-hidden group">
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
      
      {/* Header */}
      <div className="relative p-6 flex justify-between items-center z-10 border-b border-amber-400/10">
        <div className="flex items-center gap-3">
          <Image src="/my logo.png" alt="Code-X Logo" width={32} height={32} />
          <h2 className="font-bold text-xl tracking-wider text-gray-100">CODE-X ACADEMY</h2>
        </div>
        <div className="relative h-12 w-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 rounded-full opacity-60 blur-lg group-hover:opacity-80 transition-opacity duration-300"></div>
            <p className="relative font-black text-sm text-black bg-yellow-400 px-2 py-1 rounded">CEO</p>
        </div>
      </div>

      {/* Body */}
      <div className="relative p-6 z-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border-4 border-amber-400/50 shrink-0 shadow-lg">
            <AvatarImage src={admin.photoURL || undefined} data-ai-hint="ceo person" />
            <AvatarFallback className="text-5xl text-gray-800 bg-gray-300">
              {ceoName?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left w-full space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">CEO / Founder</p>
              <h3 className="text-3xl font-bold tracking-tight text-gray-50">{ceoName}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">Admin ID</p>
                  <p className="font-mono text-lg text-gray-300">{adminId}</p>
                </div>
                 <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">Access Level</p>
                  <p className="font-mono text-lg text-gray-300">Level 10 / All Access</p>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative p-6 bg-black/30 z-10">
        <div className="flex justify-between items-end">
            <div className="w-2/3">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">Signature</p>
                <div className="mt-1 pr-4">
                    <p className="font-serif italic text-2xl text-gray-200">J.M. Moffat</p>
                    <div className="h-px bg-amber-400/30 w-full mt-1"></div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                 <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=codex-admin-${admin.uid}&bgcolor=111827&color=fde047&qzone=1`} width={60} height={60} alt="QR Code" className="rounded-md border-2 border-amber-400/20" />
                 <p className="text-[8px] text-amber-400/50 mt-1 font-mono">SCAN FOR VERIFICATION</p>
            </div>
        </div>
      </div>
       {/* Barcode */}
      <div className="relative px-6 py-3 bg-black/40 z-10">
        <div className="bg-white p-1 rounded-sm">
            <Image src="https://api.qrserver.com/v1/create-qr-code/?data=237894561239875&size=250x50&ecc=L&format=svg&qzone=0&margin=0&bgcolor=FFFFFF&color=000000&codetype=Code128" width={250} height={50} alt="Barcode" className="w-full h-8" />
        </div>
      </div>
    </div>
  );
}
