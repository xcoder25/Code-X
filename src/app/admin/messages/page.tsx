'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendMessageAction } from '@/app/actions';
import { sendMessageFormSchema } from '@/app/schema';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem,
} from '@/components/ui/command';
import {
  MessageSquare, Send, Loader2, Users, User, Bell,
  Megaphone, ChevronDown, Check, Sparkles, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserEntry {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface RecentMessage {
  id: string;
  title: string;
  body: string;
  targetType: 'general' | 'direct';
  createdAt?: { seconds: number };
}

export default function AdminMessagesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sendMessageFormSchema>>({
    resolver: zodResolver(sendMessageFormSchema),
    defaultValues: { title: '', body: '', targetType: 'general', userId: '' },
  });

  const targetType = form.watch('targetType');
  const selectedUserId = form.watch('userId');
  const selectedUser = users.find(u => u.uid === selectedUserId);

  // Load users when switching to direct
  useEffect(() => {
    if (targetType === 'direct' && users.length === 0) {
      getDocs(query(collection(db, 'users'), orderBy('displayName')))
        .then(snap => setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserEntry))));
    }
  }, [targetType]);

  // Recent messages listener
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    // Limit on client side
    return onSnapshot(q, snap => {
      setRecentMessages(snap.docs.slice(0, 8).map(d => ({ id: d.id, ...d.data() } as RecentMessage)));
      setMessagesLoading(false);
    }, () => setMessagesLoading(false));
  }, []);

  const onSubmit = async (values: z.infer<typeof sendMessageFormSchema>) => {
    setIsLoading(true);
    try {
      await sendMessageAction(values);
      toast({
        title: '✅ Message Sent',
        description: targetType === 'general'
          ? 'Announcement broadcast to all students.'
          : `Direct message delivered to ${selectedUser?.displayName || 'student'}.`,
      });
      form.reset();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to Send', description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" /> Messages
        </h1>
        <p className="text-muted-foreground mt-1">Send platform-wide announcements or direct messages to students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Message Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'general', label: 'Broadcast', desc: 'All students', icon: <Megaphone className="h-5 w-5" /> },
                  { value: 'direct',  label: 'Direct',    desc: 'One student',  icon: <User className="h-5 w-5" /> },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => form.setValue('targetType', opt.value as 'general' | 'direct')}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                      targetType === opt.value
                        ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
                        : 'bg-card border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', targetType === opt.value ? 'bg-primary/20' : 'bg-muted')}>{opt.icon}</div>
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs opacity-70">{opt.desc}</p>
                    </div>
                    {targetType === opt.value && <Check className="h-4 w-4 ml-auto" />}
                  </button>
                ))}
              </div>

              {/* Recipient Picker (direct only) */}
              <AnimatePresence>
                {targetType === 'direct' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <FormField control={form.control} name="userId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" role="combobox" className={cn('w-full justify-between h-12', !field.value && 'text-muted-foreground')}>
                                {selectedUser ? (
                                  <div className="flex items-center gap-2.5">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={selectedUser.photoURL} />
                                      <AvatarFallback className="text-[10px]">{selectedUser.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{selectedUser.displayName}</span>
                                  </div>
                                ) : 'Select a student…'}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search students…" />
                              <CommandEmpty>No student found.</CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-y-auto">
                                {users.map(u => (
                                  <CommandItem key={u.uid} value={u.displayName} onSelect={() => { form.setValue('userId', u.uid); setPopoverOpen(false); }}>
                                    <div className="flex items-center gap-2.5 flex-1">
                                      <Avatar className="h-7 w-7">
                                        <AvatarImage src={u.photoURL} />
                                        <AvatarFallback className="text-xs">{u.displayName?.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{u.displayName}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                      </div>
                                    </div>
                                    <Check className={cn('h-4 w-4 ml-auto', u.uid === field.value ? 'opacity-100 text-primary' : 'opacity-0')} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. New Course Available, System Update…" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Body */}
              <FormField control={form.control} name="body" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your message to students here…" className="min-h-[140px] resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Preview + Send */}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1 gap-2 h-11">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isLoading ? 'Sending…' : targetType === 'general' ? 'Broadcast to All Students' : 'Send Direct Message'}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Recent Messages Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Recent Notifications</h3>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </Badge>
          </div>
          <div className="space-y-3">
            {messagesLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : recentMessages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages sent yet.</p>
              </div>
            ) : recentMessages.map((msg, i) => (
              <motion.div key={msg.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={cn(
                  'p-3.5 rounded-xl border bg-card',
                  msg.targetType === 'general' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-purple-500'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn('p-1.5 rounded-lg shrink-0', msg.targetType === 'general' ? 'bg-blue-500/10' : 'bg-purple-500/10')}>
                      {msg.targetType === 'general' ? <Megaphone className="h-3.5 w-3.5 text-blue-400" /> : <User className="h-3.5 w-3.5 text-purple-400" />}
                    </div>
                    <p className="text-sm font-semibold truncate">{msg.title}</p>
                  </div>
                  <Badge variant="outline" className={cn('text-[9px] shrink-0', msg.targetType === 'general' ? 'text-blue-400 border-blue-500/20' : 'text-purple-400 border-purple-500/20')}>
                    {msg.targetType === 'general' ? 'All' : 'Direct'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 pl-8">{msg.body}</p>
                {msg.createdAt && (
                  <p className="text-[10px] text-muted-foreground/50 mt-1.5 pl-8 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(msg.createdAt.seconds * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
