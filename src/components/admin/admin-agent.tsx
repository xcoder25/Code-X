'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Bot, 
    Loader2, 
    Send, 
    Sparkles, 
    User, 
    FileQuestion, 
    ClipboardCheck, 
    Bell, 
    Zap,
    X,
    CheckCircle2
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

interface Message {
  role: 'user' | 'model';
  content: string;
  suggestedAction?: {
    type: 'CREATE_EXAM' | 'GRADE_SUBMISSION' | 'SEND_NOTIFICATION' | 'NONE';
    data: any;
    status?: 'Pending' | 'Completed' | 'Failed';
  };
}

export default function AdminAgent() {
  const { user } = useAdminAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Hello Commander ${user?.displayName?.split(' ')[0] || ''}. Systems are online. I am ready to assist with exam creation, student grading, and platform orchestration. How shall we proceed?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollDiv = scrollAreaRef.current?.querySelector('div');
    if (scrollDiv) {
      scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAdminAgentAction({
        adminName: user?.displayName || 'Admin',
        message: currentInput,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      });

      const agentMessage: Message = { 
        role: 'model', 
        content: response.reply,
        suggestedAction: response.suggestedAction ? {
            ...response.suggestedAction,
            status: 'Pending'
        } : undefined
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Neural Link Failure',
        description: 'Failed to synchronize with the Admin Agent. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (msgIndex: number) => {
    const message = messages[msgIndex];
    if (!message.suggestedAction || message.suggestedAction.status !== 'Pending') return;

    setIsExecuting(message.suggestedAction.type);
    
    try {
        const result = await executeAdminAction({
            type: message.suggestedAction.type,
            data: message.suggestedAction.data
        });

        if (result.success) {
            toast({
                title: "Protocol Successful",
                description: result.message,
            });
            
            // Update message status
            setMessages(prev => prev.map((m, i) => 
                i === msgIndex ? {
                    ...m,
                    suggestedAction: m.suggestedAction ? { ...m.suggestedAction, status: 'Completed' } : undefined
                } : m
            ));
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Deployment Failure",
            description: error.message,
        });
    } finally {
        setIsExecuting(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Zap className="h-5 w-5 text-purple-400 fill-purple-400" />
            </div>
            <div>
                <h3 className="text-lg font-bold tracking-tight">Agent Nexus</h3>
                <p className="text-xs text-purple-400 font-mono uppercase tracking-widest">Protocol Override Active</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-500 uppercase">System Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    NOMINAL
                </span>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6" viewportRef={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-8">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex items-start gap-4',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className={cn(
                    "h-10 w-10 border-2",
                    message.role === 'model' ? "border-purple-500/50" : "border-slate-700"
                )}>
                   {message.role === 'model' ? (
                        <AvatarFallback className="bg-purple-900 text-purple-100">
                            <Bot className="h-5 w-5" />
                        </AvatarFallback>
                   ) : (
                        <AvatarImage src={user?.photoURL || ""} alt="User" />
                   )}
                   <AvatarFallback className="bg-slate-800 text-slate-300">
                        <User className="h-5 w-5" />
                   </AvatarFallback>
                </Avatar>

                <div className={cn('flex flex-col gap-2 max-w-[85%]', message.role === 'user' ? "items-end" : "items-start")}>
                    <div
                        className={cn(
                        'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
                        message.role === 'user'
                            ? 'bg-purple-600 text-white font-medium'
                            : 'bg-slate-900 border border-slate-800 text-slate-200'
                        )}
                    >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Suggested Actions */}
                    {message.role === 'model' && message.suggestedAction && message.suggestedAction.type !== 'NONE' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-2 w-full max-w-sm"
                        >
                            <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="py-3 px-4 bg-purple-500/10 border-b border-purple-500/20">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Proposed Action
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                     <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                                            {message.suggestedAction.type === 'CREATE_EXAM' && <FileQuestion className="h-5 w-5 text-blue-400" />}
                                            {message.suggestedAction.type === 'GRADE_SUBMISSION' && <ClipboardCheck className="h-5 w-5 text-emerald-400" />}
                                            {message.suggestedAction.type === 'SEND_NOTIFICATION' && <Bell className="h-5 w-5 text-orange-400" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-100">
                                                {message.suggestedAction.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate max-w-[200px]">
                                                {JSON.stringify(message.suggestedAction.data)}
                                            </p>
                                        </div>
                                     </div>
                                </CardContent>
                                <CardFooter className="p-2 bg-slate-950/50 flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="flex-1 text-xs hover:bg-slate-800"
                                        disabled={message.suggestedAction?.status !== 'Pending' || isExecuting !== null}
                                    >
                                        Override
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="flex-1 text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                        onClick={() => executeAction(index)}
                                        disabled={message.suggestedAction?.status !== 'Pending' || isExecuting !== null}
                                    >
                                        {isExecuting === message.suggestedAction.type ? (
                                             <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                        ) : message.suggestedAction.status === 'Completed' ? (
                                             <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                        ) : (
                                             <Zap className="h-3 w-3 mr-1.5 animate-pulse" />
                                        )}
                                        {message.suggestedAction.status === 'Completed' ? 'Deployed' : 'Deploy Protocol'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
             <div className="flex items-start gap-4">
                 <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                    <AvatarFallback className="bg-purple-900 text-purple-100">
                        <Bot className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center">
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
             <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isLoading}
                    className="text-[10px] font-mono uppercase bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
                    onClick={() => setInput("Identify students with failing grades in 'Intro to React'")}
                >
                    <ClipboardCheck className="h-3 w-3 mr-1.5 text-emerald-400" />
                    Audit Grades
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isLoading}
                    className="text-[10px] font-mono uppercase bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
                    onClick={() => setInput("Draft a 5-question exam for the 'Advanced Node.js' course")}
                >
                    <FileQuestion className="h-3 w-3 mr-1.5 text-blue-400" />
                    Draft Exam
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isLoading}
                    className="text-[10px] font-mono uppercase bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800"
                    onClick={() => setInput("Broadcast a welcome notification to all new students")}
                >
                    <Bell className="h-3 w-3 mr-1.5 text-orange-400" />
                    Platform Broadcast
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Authorize administrative commands..."
                        className="w-full bg-slate-950 border-slate-800 focus:border-purple-500/50 rounded-full pl-11 pr-4 h-12 transition-all"
                        disabled={isLoading}
                    />
                </div>
                <Button 
                    type="submit" 
                    size="icon" 
                    className="rounded-full h-12 w-12 bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/20" 
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    <span className="sr-only">Authorize</span>
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
