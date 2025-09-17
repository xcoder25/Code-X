'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/app/auth-provider';
import { db } from '@/lib/firebase';
import UserCard, { UserCardSkeleton } from './user-card';
import type { Friend } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { UserPlus } from 'lucide-react';

interface FriendsListProps {
  type: 'friends' | 'requests';
}

export default function FriendsList({ type }: FriendsListProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Simplified query to fetch all friend documents for the user
    const friendsQuery = query(
      collection(db, 'users', user.uid, 'friends'),
      orderBy('since', 'desc')
    );

    const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
      const allFriendData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Friend));
      
      // Filter the results on the client-side based on the 'type' prop
      const friendsData = allFriendData.filter(friend => 
        friend.status === (type === 'friends' ? 'accepted' : 'received')
      );
      
      setFriends(friendsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching friends:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, type]);

  const title = type === 'friends' ? 'My Friends' : 'Friend Requests';
  const description = type === 'friends'
    ? 'Users you have connected with.'
    : 'Users who want to connect with you.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <UserCardSkeleton key={i} />)}
          </div>
        ) : friends.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <UserCard key={friend.id} friend={friend} type={type} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <UserPlus className="mx-auto h-12 w-12" />
            <p className="mt-4">
              {type === 'friends'
                ? "You haven't added any friends yet. Go to the Discover tab to find classmates!"
                : 'You have no pending friend requests.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
