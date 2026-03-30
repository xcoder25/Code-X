'use client';

import AdminAgent from '@/components/admin/admin-agent';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AdminAgentPage() {
  return (
    <main className="flex flex-1 flex-col p-4 md:p-8 h-[calc(100vh-theme(spacing.16))] bg-background/50">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                Code-X Admin Agent
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Your autonomous assistant for platform management, grading, and curation.
            </p>
        </div>
      </motion.div>

      <div className="flex-1 min-h-0 bg-background rounded-3xl border shadow-2xl overflow-hidden">
        <AdminAgent />
      </div>
    </main>
  );
}
