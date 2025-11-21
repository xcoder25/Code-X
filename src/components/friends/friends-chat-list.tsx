'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { Friend } from '@/types';

interface FriendsChatListProps {
  onSelectUser: (user: User) => void;
}

export default function FriendsChatList({ onSelectUser }: FriendsChatListProps) {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const friendsRef = collection(db, `users/${auth.currentUser.uid}/friends`);
    const friendsQuery = query(friendsRef, where('status', '==', 'accepted'));

    const unsubscribe = onSnapshot(friendsQuery, async (snapshot) => {
      try {
        const friendsData = snapshot.docs.map(doc => doc.data() as Friend);
        
        if (friendsData.length === 0) {
          setFriends([]);
          setLoading(false);
          return;
        }

        // Get user details for each friend
        const usersRef = collection(db, 'users');
        const userIds = snapshot.docs.map(doc => doc.id);

        // Fetch user data for friends
        const userPromises = userIds.map(async (userId) => {
          const userDoc = await getDocs(query(usersRef, where('__name__', '==', userId)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            return {
              id: userId,
              displayName: userData.displayName,
              email: userData.email,
              photoURL: userData.photoURL,
            } as User;
          }
          return null;
        });

        const usersData = await Promise.all(userPromises);
        const validUsers = usersData.filter(user => user !== null) as User[];
        
        setFriends(validUsers);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error in friends snapshot:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-2 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">No friends yet</p>
        <p className="text-xs mt-1">Add friends to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {friends.map((friend) => (
        <Button
          key={friend.id}
          variant="ghost"
          className="w-full justify-start h-14 p-2"
          onClick={() => onSelectUser(friend)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={friend.photoURL || undefined} />
            <AvatarFallback>
              {friend.displayName?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start flex-1">
            <span className="font-medium text-sm">{friend.displayName}</span>
            <Badge variant="secondary" className="text-xs">
              Friend
            </Badge>
          </div>
        </Button>
      ))}
    </div>
  );
}
