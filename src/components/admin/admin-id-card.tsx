
'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'firebase/auth';

interface AdminIdCardProps {
  admin: User;
}

export default function AdminIdCard({ admin }: AdminIdCardProps) {

  const adminId = `ADMN-${admin.uid.substring(0, 6).toUpperCase()}`;

  return (
    <div className="relative max-w-lg w-full bg-gray-900 rounded-2xl shadow-2xl text-white font-sans overflow-hidden group">
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
      
      {/* Header */}
      <div className="relative p-6 flex justify-between items-center z-10">
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
              {admin.displayName?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left w-full">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">CEO / Founder</p>
            <h3 className="text-3xl font-bold tracking-tight text-gray-50">{admin.displayName}</h3>
            
            <div className="mt-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">Admin ID</p>
                <p className="font-mono text-lg text-gray-300">{adminId}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative p-6 bg-black/30 flex items-center justify-between z-10">
         <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=codex-admin-${admin.uid}&bgcolor=111827&color=fde047&qzone=1`} width={60} height={60} alt="QR Code" className="rounded-md border-2 border-amber-400/20" />
         <div className="text-right">
            <p className="text-xs text-gray-400">Issued: {new Date().getFullYear()}</p>
            <p className="text-xs font-semibold text-gray-300">OFFICIAL EXECUTIVE IDENTIFICATION</p>
         </div>
      </div>
    </div>
  );
}

