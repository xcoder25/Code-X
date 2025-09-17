
'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';
import { Badge } from './ui/badge';

interface StudentIdCardProps {
  user: User;
}

export default function StudentIdCard({ user }: StudentIdCardProps) {

  // Generate a unique student ID from the UID
  const studentId = `CDX-${user.uid.substring(0, 8).toUpperCase()}`;

  return (
    <div className="max-w-lg w-full bg-gradient-to-br from-primary/80 to-primary/60 rounded-xl shadow-lg p-6 text-primary-foreground font-sans">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
            <Image src="/my logo.png" alt="Code-X Logo" width={28} height={28} />
            <h2 className="font-bold text-xl">Code-X Academy</h2>
        </div>
        <Badge variant="secondary">Student ID</Badge>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mt-6">
        <Avatar className="h-28 w-28 border-4 border-primary-foreground/50">
          <AvatarImage src={user.photoURL || undefined} data-ai-hint="person student" />
          <AvatarFallback className="text-4xl text-primary bg-primary-foreground">
            {user.displayName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="text-center md:text-left">
          <h3 className="text-3xl font-bold tracking-tight">{user.displayName}</h3>
          <p className="text-primary-foreground/80">{user.email}</p>
          <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
            <p className="font-mono bg-black/20 px-2 py-1 rounded-md text-sm">{studentId}</p>
            {user.plan && <Badge variant={user.plan === 'Free' ? 'outline' : 'default'} className="bg-white/90 text-primary">{user.plan} Plan</Badge>}
          </div>
        </div>
      </div>
       <div className="mt-6 flex justify-end">
            <Image src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=codex-user-${user.uid}" width={80} height={80} alt="QR Code" className="rounded-md bg-white p-1" />
      </div>
    </div>
  );
}
