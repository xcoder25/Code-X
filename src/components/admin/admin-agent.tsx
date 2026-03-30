'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Bot, Loader2, Send, Sparkles, User, 
    FileQuestion, ClipboardCheck, Bell, Zap,
    Trash2, BookOpen, KeyRound, CheckCircle2,
    AlertTriangle, PlusCircle, BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { chatWithAdminAgentAction, executeAdminAction } from '@/app/admin/agent-actions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/app/admin-auth-provider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/badge';

// ─── Action type map ────────────────────────────────────────────────────────
type ActionType = 
  | 'CREATE_EXAM' | 'DELETE_EXAM'
  | 'CREATE_ASSIGNMENT' | 'DELETE_ASSIGNMENT'
  | 'GRADE_SUBMISSION' | 'SEND_NOTIFICATION'
  | 'CREATE_COURSE' | 'DELETE_COURSE'
  | 'GENERATE_ACCESS_CODES' | 'NONE';

const ACTION_META: Record<ActionType, { icon: React.ReactNode; label: string; color: string; bgColor: string; danger?: boolean }> = {
  CREATE_EXAM:           { icon: <FileQuestion className="h-5 w-5" />, label: 'Create Exam',           color: 'text-blue-400',    bgColor: 'bg-blue-500/10 border-blue-500/20' },
  DELETE_EXAM:           { icon: <Trash2 className="h-5 w-5" />,       label: 'Delete Exam',           color: 'text-red-400',     bgColor: 'bg-red-500/10 border-red-500/20',   danger: true },
  CREATE_ASSIGNMENT:     { icon: <PlusCircle className="h-5 w-5" />,   label: 'Create Assignment',     color: 'text-teal-400',    bgColor: 'bg-teal-500/10 border-teal-500/20' },
  DELETE_ASSIGNMENT:     { icon: <Trash2 className="h-5 w-5" />,       label: 'Delete Assignment',     color: 'text-red-400',     bgColor: 'bg-red-500/10 border-red-500/20',   danger: true },
  GRADE_SUBMISSION:      { icon: <ClipboardCheck className="h-5 w-5" />, label: 'Grade Submission',   color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  SEND_NOTIFICATION:     { icon: <Bell className="h-5 w-5" />,          label: 'Send Notification',    color: 'text-orange-400',  bgColor: 'bg-orange-500/10 border-orange-500/20' },
  CREATE_COURSE:         { icon: <BookOpen className="h-5 w-5" />,      label: 'Create Course',        color: 'text-purple-400',  bgColor: 'bg-purple-500/10 border-purple-500/20' },
  DELETE_COURSE:         { icon: <Trash2 className="h-5 w-5" />,        label: 'Delete Course',        color: 'text-red-400',     bgColor: 'bg-red-500/10 border-red-500/20',   danger: true },
  GENERATE_ACCESS_CODES: { icon: <KeyRound className="h-5 w-5" />,      label: 'Generate Access Codes',color: 'text-yellow-400',  bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
  NONE:                  { icon: null, label: '', color: '', bgColor: '' },
};

interface Message {
  role: 'user' | 'model';
  content: string;
  suggestedAction?: {
    type: ActionType;
    data: any;
    status?: 'Pending' | 'Completed' | 'Failed';
  };
}

// ─── Quick Shortcuts ────────────────────────────────────────────────────────
const QUICK_COMMANDS = [
  { label: 'Platform Status', cmd: 'Give me a full status report of the platform', icon: <BarChart3 className="h-3 w-3" />, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10' },
  { label: 'Audit Submissions', cmd: 'Check for pending student submissions', icon: <ClipboardCheck className="h-3 w-3" />, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' },
  { label: 'Draft Exam', cmd: 'Create a new exam for the top course', icon: <FileQuestion className="h-3 w-3" />, color: 'text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10' },
  { label: 'New Assignment', cmd: 'Create a new assignment for students', icon: <PlusCircle className="h-3 w-3" />, color: 'text-teal-400 border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10' },
  { label: 'Announcement', cmd: 'Send a broadcast announcement to all students', icon: <Bell className="h-3 w-3" />, color: 'text-orange-400 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10' },
  { label: 'Generate Codes', cmd: 'Generate 10 enrollment access codes', icon: <KeyRound className="h-3 w-3" />, color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10' },
];

// ─── Component ──────────────────────────────────────────────────────────────
export default function AdminAgent() {
  const { user } = useAdminAuth();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'model',
    content: `Hello Commander ${user?.displayName?.split(' ')[0] || ''}. NEXUS is online with full platform privileges.\n\nI have complete knowledge of every course, student, exam, assignment, and submission on Code-X — and owner-level authority to make any change. What shall we do?`
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const text = overrideInput ?? input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAdminAgentAction({
        adminName: user?.displayName || 'Admin',
        message: text,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      });

      setMessages(prev => [...prev, {
        role: 'model',
        content: response.reply,
        suggestedAction: response.suggestedAction?.type !== 'NONE' && response.suggestedAction ? {
          ...response.suggestedAction,
          status: 'Pending'
        } : undefined
      }]);
    } catch {
      toast({ variant: 'destructive', title: 'Neural Link Failure', description: 'Could not reach NEXUS. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const deployAction = async (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg.suggestedAction || msg.suggestedAction.status !== 'Pending') return;

    setIsExecuting(msg.suggestedAction.type);
    try {
      const result = await executeAdminAction({ type: msg.suggestedAction.type, data: msg.suggestedAction.data });
      toast({ title: '✅ Protocol Deployed', description: result.message });
      setMessages(prev => prev.map((m, i) => i !== msgIndex ? m : {
        ...m,
        suggestedAction: m.suggestedAction ? { ...m.suggestedAction, status: 'Completed' } : undefined
      }));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Deployment Failure', description: err.message });
      setMessages(prev => prev.map((m, i) => i !== msgIndex ? m : {
        ...m,
        suggestedAction: m.suggestedAction ? { ...m.suggestedAction, status: 'Failed' } : undefined
      }));
    } finally {
      setIsExecuting(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">NEXUS</h3>
            <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">Platform Owner Agent · Full Authority</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[10px] font-mono uppercase text-slate-500">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />All Systems Nominal</div>
          <div>Owner Privileges Active</div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 min-h-0" viewportRef={viewportRef}>
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex items-start gap-4', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <Avatar className={cn('h-9 w-9 shrink-0 border-2', message.role === 'model' ? 'border-purple-500/40' : 'border-slate-700')}>
                  {message.role === 'model' ? (
                    <AvatarFallback className="bg-purple-900/80 text-purple-100"><Bot className="h-4 w-4" /></AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={user?.photoURL || ''} alt="Admin" />
                      <AvatarFallback className="bg-slate-800 text-slate-300"><User className="h-4 w-4" /></AvatarFallback>
                    </>
                  )}
                </Avatar>

                {/* Content Block */}
                <div className={cn('flex flex-col gap-3 min-w-0', message.role === 'user' ? 'items-end max-w-[80%]' : 'items-start max-w-[85%]')}>
                  {/* Bubble */}
                  <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Action Card */}
                  {message.role === 'model' && message.suggestedAction && message.suggestedAction.type !== 'NONE' && (() => {
                    const meta = ACTION_META[message.suggestedAction.type];
                    const isDanger = meta.danger;
                    const status = message.suggestedAction.status;
                    return (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
                        <Card className={cn('overflow-hidden border', meta.bgColor, 'bg-slate-900/70 backdrop-blur-sm')}>
                          <CardHeader className={cn('py-3 px-4 border-b', meta.bgColor)}>
                            <div className="flex items-center justify-between">
                              <CardTitle className={cn('text-[10px] font-bold uppercase tracking-widest flex items-center gap-2', meta.color)}>
                                <Sparkles className="h-3 w-3" />
                                Staging: {meta.label}
                              </CardTitle>
                              {status === 'Completed' && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">Deployed</Badge>}
                              {status === 'Failed' && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">Failed</Badge>}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn('p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0 mt-0.5', meta.color)}>
                                {meta.icon}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-100">
                                  {message.suggestedAction.data?.title || message.suggestedAction.data?.assignmentTitle || meta.label}
                                </p>
                                {message.suggestedAction.data?.userName && (
                                  <p className="text-xs text-slate-400">Student: <span className="font-semibold text-slate-200">{message.suggestedAction.data.userName}</span></p>
                                )}
                                {message.suggestedAction.data?.courseId && !message.suggestedAction.data?.userName && (
                                  <p className="text-[10px] text-slate-500 font-mono truncate">Course ID: {message.suggestedAction.data.courseId}</p>
                                )}
                                {message.suggestedAction.data?.grade && (
                                  <p className="text-xs text-slate-400 flex items-center gap-2">
                                    Grade: <span className="font-bold text-emerald-400 text-base">{message.suggestedAction.data.grade}</span>
                                  </p>
                                )}
                                {message.suggestedAction.data?.colabLink && (
                                  <a
                                    href={message.suggestedAction.data.colabLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[10px] font-mono text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors mt-0.5"
                                  >
                                    <span>📎 View Colab Submission</span>
                                  </a>
                                )}
                                {message.suggestedAction.data?.quantity && (
                                  <p className="text-xs text-slate-400">Quantity: {message.suggestedAction.data.quantity} codes</p>
                                )}
                                {message.suggestedAction.data?.questions && (
                                  <p className="text-xs text-slate-400">{message.suggestedAction.data.questions.length} questions · {message.suggestedAction.data.duration}min</p>
                                )}
                              </div>
                            </div>
                            {isDanger && status === 'Pending' && (
                              <div className="mt-3 flex items-center gap-2 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                This action is permanent and cannot be undone.
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="p-2 bg-slate-950/50 flex gap-2">
                            <Button variant="ghost" size="sm" className="flex-1 text-xs hover:bg-slate-800 text-slate-400"
                              disabled={status !== 'Pending' || isExecuting !== null}>
                              Edit
                            </Button>
                            <Button size="sm"
                              className={cn(
                                'flex-1 text-xs text-white shadow-lg',
                                isDanger ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
                              )}
                              onClick={() => deployAction(index)}
                              disabled={status !== 'Pending' || isExecuting !== null}
                            >
                              {isExecuting === message.suggestedAction.type ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                               : status === 'Completed' ? <CheckCircle2 className="h-3 w-3 mr-1.5" />
                               : <Zap className="h-3 w-3 mr-1.5 animate-pulse" />}
                              {status === 'Completed' ? 'Deployed' : status === 'Failed' ? 'Retry' : isDanger ? 'Confirm & Delete' : 'Deploy Protocol'}
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <Avatar className="h-9 w-9 border-2 border-purple-500/40">
                <AvatarFallback className="bg-purple-900/80 text-purple-100"><Bot className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Querying platform data...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/70 backdrop-blur-xl p-4 space-y-3">
        <div className="max-w-4xl mx-auto">
          {/* Quick Commands */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {QUICK_COMMANDS.map(cmd => (
              <button
                key={cmd.label}
                disabled={isLoading}
                onClick={() => handleSubmit(undefined, cmd.cmd)}
                className={cn(
                  'flex items-center gap-1.5 text-[10px] font-mono uppercase border rounded-full px-3 py-1.5 transition-colors disabled:opacity-40',
                  cmd.color
                )}
              >
                {cmd.icon}
                {cmd.label}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Issue a command — e.g. Create an exam for Python Basics..."
                className="w-full bg-slate-950 border-slate-800 focus:border-purple-500/50 rounded-full pl-11 pr-4 h-12 text-sm placeholder:text-slate-600"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" size="icon" className="rounded-full h-12 w-12 bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 shrink-0" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
