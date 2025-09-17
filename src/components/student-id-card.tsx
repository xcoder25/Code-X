
'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

interface StudentIdCardProps {
  user: User;
}

export default function StudentIdCard({ user }: StudentIdCardProps) {

  // Generate a unique student ID from the UID
  const studentId = `CDX-${user.uid.substring(0, 8).toUpperCase()}`;
  
  const issuedDate = new Date();
  const expiryDate = new Date();
  expiryDate.setMonth(issuedDate.getMonth() + 6);


  return (
    <div className="max-w-lg w-full bg-slate-900 rounded-xl shadow-lg text-white font-sans overflow-hidden group">
      {/* Header */}
      <div className="p-6 bg-black/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image src="/my logo.png" alt="Code-X Logo" width={32} height={32} />
          <h2 className="font-bold text-xl tracking-wider">CODE-X ACADEMY</h2>
        </div>
        <div className="relative h-12 w-12">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-50 blur-md group-hover:opacity-70 transition-opacity duration-300"></div>
            <Image src="/my logo.png" alt="Hologram" width={48} height={48} className="relative opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-32 w-32 border-4 border-slate-700/80 shrink-0">
            <AvatarImage src={user.photoURL || undefined} data-ai-hint="person student" />
            <AvatarFallback className="text-5xl text-slate-800 bg-slate-300">
              {user.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left w-full">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Student Name</p>
            <h3 className="text-3xl font-bold tracking-tight">{user.displayName}</h3>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-left">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Student ID</p>
                    <p className="font-mono text-lg">{studentId}</p>
                </div>
                 <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Plan</p>
                    <p className="font-semibold text-lg">{user.plan || 'Free'}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Validity</p>
                    <p className="font-mono text-sm">Issued: {format(issuedDate, 'MM/yyyy')} | Expires: {format(expiryDate, 'MM/yyyy')}</p>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 bg-black/20 flex items-center justify-between">
         <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=codex-user-${user.uid}&bgcolor=1e293b&color=ffffff&qzone=1`} width={60} height={60} alt="QR Code" className="rounded-md" />
         <div className="text-right">
            <p className="text-xs text-slate-400">Issued: {new Date().getFullYear()}</p>
            <p className="text-xs text-slate-400 font-semibold">Official Student Identification</p>
         </div>
      </div>
    </div>
  );
}
