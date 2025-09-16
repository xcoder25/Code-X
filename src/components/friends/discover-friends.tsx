'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  collectionGroup,
  getDocs,
  query,
  where,
  onSnapshot,
  documentId,
} from 'firebase/firestore';
import { useAuth } from '@/app/auth-provider';
import { db } from '@/lib/firebase';
import UserCard, { UserCardSkeleton } from './user-card';
import type { User, Friend } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Users } from 'lucide-react';

// Define the component's props
interface DiscoverFriendsProps {
  courseId: string;
  courseName: string;
}

export default function DiscoverFriends({
  courseId,
  courseName,
}: DiscoverFriendsProps) {
  const { user } = useAuth();
  const [classmates, setClassmates] = useState<User[]>([]);
  const [friendStatuses, setFriendStatuses] = useState<Map<string, Friend>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchClassmates() {
      setLoading(true);
      try {
        // 1. Find all enrollments for the specific courseId
        const enrollmentsQuery = query(
          collectionGroup(db, 'enrollments'),
          where('courseId', '==', courseId)
        );
        const enrollmentsSnap = await getDocs(enrollmentsQuery);

        // 2. Get all unique user IDs from enrollments
        const userIdsSet = new Set(
          enrollmentsSnap.docs.map((doc) => doc.ref.parent.parent!.id)
        );

        // 3. Remove the current user from the set
        userIdsSet.delete(user.uid);

        if (userIdsSet.size === 0) {
          setClassmates([]);
          setLoading(false);
          return;
        }

        // 4. Efficiently fetch user data using chunked 'in' queries
        const userIds = Array.from(userIdsSet);
        const usersData: User[] = [];
        const usersRef = collection(db, 'users');
        
        // Firestore 'in' queries are limited (currently to 30 items)
        const CHUNK_SIZE = 30;
        const chunks: string[][] = [];
        for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
          chunks.push(userIds.slice(i, i + CHUNK_SIZE));
        }

        // Create an array of query promises
        const queryPromises = chunks.map((chunk) => {
          const usersQuery = query(usersRef, where(documentId(), 'in', chunk));
          return getDocs(usersQuery);
        });

        // Execute all queries in parallel
        const querySnapshots = await Promise.all(queryPromises);

        // Process all results
        querySnapshots.forEach((snapshot) => {
          snapshot.forEach((doc) => {
            usersData.push({ id: doc.id, ...doc.data() } as User);
          });
        });

        setClassmates(usersData);
      } catch (error) {
        console.error('Error fetching classmates: ', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClassmates();

    // Listen to friend statuses in real-time
    const friendsQuery = query(collection(db, 'users', user.uid, 'friends'));
    const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
      const statuses = new Map<string, Friend>();
      snapshot.forEach((doc) => {
        statuses.set(doc.id, { id: doc.id, ...doc.data() } as Friend);
      });
      setFriendStatuses(statuses);
    });

    return () => unsubscribe();
  }, [user, courseId]); // Add courseId to dependency array

  // Merge classmate data with their friend status
  const usersWithStatus: User[] = classmates.map((c) => ({
    ...c,
    status: friendStatuses.get(c.id)?.status || null,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discover Classmates</CardTitle>
        <CardDescription>
          Find and connect with other students enrolled in the "{courseName}"
          course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : usersWithStatus.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {usersWithStatus.map((classmate) => (
              <UserCard key={classmate.id} friend={classmate} type="discover" />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12" />
            <p className="mt-4">
              No other students found in the {courseName} course.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}