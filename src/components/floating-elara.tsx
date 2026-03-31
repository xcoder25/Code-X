'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Bot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AiCoach from '@/components/ai-coach';
import { cn } from '@/lib/utils';

export default function FloatingElara() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
           initial={false}
           animate={isOpen ? "open" : "closed"}
        >
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-500",
                    isOpen 
                        ? "bg-slate-900 border border-slate-800 text-slate-400 rotate-90" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
                    </span>
                )}
            </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.9, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-950/80 backdrop-blur-2xl shadow-2xl"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
            <div className="flex flex-col h-full">
              {/* Custom Header for Floating Version */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Neural Coach</h3>
                        <p className="text-[10px] text-slate-500 font-bold italic">Elara Core Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Syncing</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <AiCoach hideHeader />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
