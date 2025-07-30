
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Bell, Zap, AlertTriangle, BookOpenCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/auth-provider';

interface Notification {
  id: string;
  title: string;
  description: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  type: 'announcement' | 'grade' | 'reminder';
  target: {
      type: 'general' | 'course' | 'user';
      courseId?: string;
      courseTitle?: string;
      userId?: string;
  };
  read?: boolean;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'grade':
            return <BookOpenCheck />;
        case 'reminder':
            return <AlertTriangle />;
        case 'announcement':
        default:
            return <Bell />;
    }
}

const getNotificationVariant = (type: string) => {
    switch (type) {
        case 'grade':
            return 'default';
        case 'reminder':
            return 'destructive';
        case 'announcement':
        default:
            return 'default';
    }
}


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // In a real app, this would come from the user's profile in the database
  const userEnrolledCourseIds = ['web-dev-bootcamp']; 

   useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };
    
    // Query for notifications targeted at the user specifically, their courses, or everyone.
    const notificationsQuery = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // This is a simplified read status. A real app would store read status per user.
        read: false,
      })) as Notification[];
      
      // Filter notifications on the client-side
      const filteredNotifications = notificationsData.filter(notif => {
          if (notif.target.type === 'general') {
              return true; // Show all general announcements
          }
          if (notif.target.type === 'course' && notif.target.courseId) {
              // Show if user is enrolled in the target course
              return userEnrolledCourseIds.includes(notif.target.courseId);
          }
          if (notif.target.type === 'user' && notif.target.userId) {
              // Show if the notification is targeted at the current user
              return notif.target.userId === user.uid;
          }
          return false;
      })

      setNotifications(filteredNotifications);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Notifications</h1>
      </div>
       <p className="text-muted-foreground">
        Stay updated with the latest announcements, grades, and reminders.
      </p>

      <Card>
        <CardContent className="p-6">
         {loading ? (
             <ul className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <li key={i} className="flex items-start gap-4 p-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-4 w-3/4" />
                             <Skeleton className="h-3 w-1/2" />
                        </div>
                    </li>
                ))}
             </ul>
         ) : notifications.length > 0 ? (
            <ul className="space-y-4">
                {notifications.map((notification) => (
                <li
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                    !notification.read ? 'bg-accent/50' : ''
                    }`}
                >
                    <div
                    className={`p-2 rounded-full ${
                        getNotificationVariant(notification.type) === 'destructive'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-primary/20 text-primary'
                    }`}
                    >
                    {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && <Badge>New</Badge>}
                    </div>
                     {notification.target.type === 'course' && notification.target.courseTitle && (
                        <Badge variant="outline" className="mt-1">{notification.target.courseTitle}</Badge>
                     )}
                    <p className="text-sm text-muted-foreground mt-1">
                        {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                         {new Date(notification.createdAt.seconds * 1000).toLocaleString()}
                    </p>
                    </div>
                </li>
                ))}
            </ul>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    You have no new notifications.
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
