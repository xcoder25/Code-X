import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Bell, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const notifications = [
  {
    id: 1,
    icon: <Bell className="h-5 w-5" />,
    title: 'New Assignment Graded',
    description: 'Your "Component Lifecycle" assignment has been graded. You received an A-.',
    date: '2 days ago',
    read: false,
    variant: 'default',
  },
  {
    id: 2,
    icon: <Zap className="h-5 w-5" />,
    title: 'New Course Available',
    description: 'Check out the new "Advanced TypeScript" course in the catalog.',
    date: '3 days ago',
    read: true,
     variant: 'default',
  },
    {
    id: 3,
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'Upcoming Exam Reminder',
    description: 'Your "Mid-term Exam" for the Web Development Bootcamp is scheduled for Oct 30, 2024.',
    date: '5 days ago',
    read: false,
    variant: 'destructive',
  },
   {
    id: 4,
    icon: <Bell className="h-5 w-5" />,
    title: 'Profile Update',
    description: 'You have successfully updated your email address.',
    date: '1 week ago',
    read: true,
     variant: 'default',
  },
];

export default function NotificationsPage() {
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
                    notification.variant === 'destructive'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-primary/20 text-primary'
                  }`}
                >
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                     <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.read && <Badge>New</Badge>}
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}