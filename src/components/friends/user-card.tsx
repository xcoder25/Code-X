
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/auth-provider';
import type { Friend } from '@/types';
import { acceptFriendRequestAction, declineFriendRequestAction, sendFriendRequestAction } from '@/app/actions';
import { Check, Loader2, UserPlus, X } from 'lucide-react';
import type { User } from '@/types';

interface UserCardProps {
  friend: Friend | User;
  type: 'friends' | 'requests' | 'discover';
}

export default function UserCard({ friend, type }: UserCardProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<'accept' | 'decline' | 'add' | null>(null);

  const handleSendRequest = async () => {
    if (!currentUser) return;
    setLoadingAction('add');
    try {
      await sendFriendRequestAction({ currentUserId: currentUser.uid, targetUserId: friend.id });
      toast({
        title: 'Friend Request Sent!',
        description: `Your request to ${friend.displayName} has been sent.`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };
  
  const handleAcceptRequest = async () => {
    if (!currentUser) return;
    setLoadingAction('accept');
    try {
      await acceptFriendRequestAction({ currentUserId: currentUser.uid, targetUserId: friend.id });
      toast({
        title: 'Friend Accepted!',
        description: `You are now friends with ${friend.displayName}.`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeclineRequest = async () => {
    if (!currentUser) return;
    setLoadingAction('decline');
    try {
      await declineFriendRequestAction({ currentUserId: currentUser.uid, targetUserId: friend.id });
      toast({
        title: 'Request Declined',
        description: `You have declined the friend request from ${friend.displayName}.`,
      });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const isLoading = loadingAction !== null;
  const friendStatus = 'status' in friend ? friend.status : null;

  return (
    <Card className="p-4 flex flex-col items-center text-center gap-3">
      <Avatar className="h-20 w-20">
        <AvatarImage src={friend.photoURL || undefined} data-ai-hint="avatar person" />
        <AvatarFallback>{friend.displayName?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="font-semibold">{friend.displayName}</p>
        {'course' in friend && <p className="text-xs text-muted-foreground">{friend.course}</p>}
      </div>
      <div className="flex gap-2 w-full">
        {type === 'discover' && friendStatus === null && (
          <Button className="w-full" onClick={handleSendRequest} disabled={isLoading}>
            {loadingAction === 'add' ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Add Friend
          </Button>
        )}
        {type === 'discover' && friendStatus === 'sent' && (
            <Button className="w-full" variant="outline" disabled>
                <Check /> Request Sent
            </Button>
        )}
         {type === 'discover' && friendStatus === 'accepted' && (
            <Button className="w-full" variant="outline" disabled>
                <Check /> Friends
            </Button>
        )}
        {type === 'requests' && (
          <>
            <Button className="w-full" onClick={handleAcceptRequest} disabled={isLoading}>
                {loadingAction === 'accept' ? <Loader2 className="animate-spin" /> : <Check />}
                Accept
            </Button>
            <Button className="w-full" variant="outline" onClick={handleDeclineRequest} disabled={isLoading}>
                {loadingAction === 'decline' ? <Loader2 className="animate-spin" /> : <X />}
                Decline
            </Button>
          </>
        )}
        {type === 'friends' && (
          <Button variant="outline" className="w-full">
            Message
          </Button>
        )}
      </div>
    </Card>
  );
}

export function UserCardSkeleton() {
  return (
    <Card className="p-4 flex flex-col items-center text-center gap-3">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-3 w-1/2 mx-auto" />
      </div>
      <Skeleton className="h-10 w-full mt-2" />
    </Card>
  );
}
