
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/auth-provider';

export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const messagesQuery = query(
      collection(db, 'notifications'),
      or(
        where('targetType', '==', 'general'),
        where('userIds', 'array-contains', user.uid)
      )
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const count = snapshot.docs.filter((doc) => {
          const data = doc.data();
          return !data.readBy || !data.readBy.includes(user.uid);
        }).length;
        setUnreadCount(count);
      },
      (error) => {
        console.error('Error fetching unread count:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { unreadCount };
}
