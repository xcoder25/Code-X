
'use client';

import { useState, useEffect } from 'react';
import { collection, collectionGroup, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/app/auth-provider';
import { db } from '@/lib/firebase';
import UserCard, { UserCardSkeleton } from './user-card';
import type { User, Friend } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users } from 'lucide-react';

export default function DiscoverFriends() {
  const { user } = useAuth();
  const [classmates, setClassmates] = useState<User[]>([]);
  const [friendStatuses, setFriendStatuses] = useState<Map<string, Friend>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchClassmates() {
      // 1. Find all courses the current user is enrolled in
      const enrollmentSnap = await getDocs(collection(db, 'users', user!.uid, 'enrollments'));
      const courseIds = enrollmentSnap.docs.map(doc => doc.id);
      
      if (courseIds.length === 0) {
        setLoading(false);
        return;
      }
      
      // 2. Find all enrollments for those courses
      const enrollmentsQuery = query(collectionGroup(db, 'enrollments'), where('courseId', 'in', courseIds));
      const enrollmentsSnap = await getDocs(enrollmentsQuery);
      const userIds = new Set(enrollmentsSnap.docs.map(doc => doc.ref.parent.parent!.id));

      // 3. Fetch user data for all classmates (excluding self)
      const usersData: User[] = [];
      const userDocsQuery = query(collection(db, 'users'), where('uid', 'in', Array.from(userIds)));
      const userDocsSnap = await getDocs(userDocsQuery);

      userDocsSnap.forEach(doc => {
          if (user && doc.id !== user.uid) {
              usersData.push({ id: doc.id, ...doc.data() } as User);
          }
      });
      
      setClassmates(usersData);
      setLoading(false);
    }

    fetchClassmates();

    // 4. Listen to friend statuses in real-time
    const friendsQuery = query(collection(db, 'users', user.uid, 'friends'));
    const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
        const statuses = new Map<string, Friend>();
        snapshot.forEach(doc => {
            statuses.set(doc.id, { id: doc.id, ...doc.data() } as Friend);
        });
        setFriendStatuses(statuses);
    });

    return () => unsubscribe();
  }, [user]);

  const usersWithStatus: User[] = classmates.map(c => ({
      ...c,
      status: friendStatuses.get(c.id)?.status || null
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discover Classmates</CardTitle>
        <CardDescription>Find and connect with other students enrolled in your courses.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <UserCardSkeleton key={i} />)}
          </div>
        ) : usersWithStatus.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {usersWithStatus.map((classmate) => (
              <UserCard key={classmate.id} friend={classmate} type="discover" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="mx-auto h-12 w-12" />
            <p className="mt-4">
              No other students found in your courses. Enroll in a course to find classmates!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
