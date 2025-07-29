import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-primary p-3 text-primary-foreground">
            <Shield className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-2xl">Admin Panel</CardTitle>
          <CardDescription>Welcome to the secret admin page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            More admin features coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
