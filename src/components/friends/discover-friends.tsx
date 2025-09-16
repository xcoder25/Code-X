
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
  const pythonCourseId = 'intro-to-python'; // Hardcode a single course ID to simplify the query

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchClassmates() {
      setLoading(true);
      try {
        // Simplified Query: Find all enrollments for just one course.
        // This avoids the complex `in` query that requires a composite index.
        const enrollmentsQuery = query(collectionGroup(db, 'enrollments'), where('courseId', '==', pythonCourseId));
        const enrollmentsSnap = await getDocs(enrollmentsQuery);
        
        const userIds = new Set(enrollmentsSnap.docs.map(doc => doc.ref.parent.parent!.id));

        if (userIds.size === 0) {
            setClassmates([]);
            setLoading(false);
            return;
        }

        // Fetch user data for all classmates (excluding self)
        const usersData: User[] = [];
        const userDocsQuery = query(collection(db, 'users'));
        const userDocsSnap = await getDocs(userDocsQuery);

        userDocsSnap.forEach(doc => {
            if (userIds.has(doc.id) && doc.id !== user.uid) {
                usersData.push({ id: doc.id, ...doc.data() } as User);
            }
        });
        
        setClassmates(usersData);
      } catch(error) {
        console.error("Error fetching classmates: ", error);
      }
      finally {
        setLoading(false);
      }
    }

    fetchClassmates();

    // Listen to friend statuses in real-time
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
        <CardDescription>Find and connect with other students enrolled in the "Introduction to Python" course.</CardDescription>
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
              No other students found in the Python course.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
