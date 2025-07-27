import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Bell, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const notifications: any[] = [];

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
         {notifications.length > 0 ? (
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
