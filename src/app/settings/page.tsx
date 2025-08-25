
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '../auth-provider';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction, updateNotificationSettingsAction } from '../actions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 0 0-10 10c0 4.93 3.58 9 8 9.85V14.5h-2.5V12H8V9.5C8 7.03 9.53 5.5 11.86 5.5c1.1 0 2.08.08 2.36.12v2.1h-1.25c-1.2 0-1.41.57-1.41 1.38V12h2.47l-.4 2.5h-2.07v7.35A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingNotifications, setSubmittingNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setDbUser(userData);
          profileForm.reset({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
          });
        }
        setLoading(false);
      });
      return () => unsub();
    } else {
        setLoading(false);
    }
  }, [user, profileForm]);
  
  const handleProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setSubmittingProfile(true);
    try {
      await updateUserProfileAction({ ...data, userId: user.uid });
      toast({ title: 'Success', description: 'Your profile has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleNotificationsSubmit = async () => {
    if (!user || !dbUser) return;
    setSubmittingNotifications(true);
    try {
        await updateNotificationSettingsAction({
            userId: user.uid,
            emailNotifications: dbUser.settings?.notifications?.email || false,
            pushNotifications: dbUser.settings?.notifications?.push || false,
        });
        toast({ title: 'Success', description: 'Notification settings saved.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setSubmittingNotifications(false);
    }
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setSubmittingProfile(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
            await updateUserProfileAction({
                userId: user.uid,
                firstName: profileForm.getValues('firstName'),
                lastName: profileForm.getValues('lastName'),
                email: profileForm.getValues('email'),
                photoDataUrl: dataUrl,
            });
            toast({ title: 'Success', description: 'Profile photo updated.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload photo.' });
        } finally {
            setSubmittingProfile(false);
        }
    }
  }
  
  if (loading) {
      return <SettingsPageSkeleton />;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Settings</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your account settings, preferences, and integrations.
      </p>

      <div className="grid gap-6">
        <Card>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={dbUser?.photoURL || user?.photoURL} data-ai-hint="profile picture" />
                    <AvatarFallback>{dbUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                   <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={submittingProfile}>
                        Change Photo
                   </Button>
                   <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={submittingProfile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                           <Input {...field} disabled={submittingProfile} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled />
                      </FormControl>
                       <FormDescription>Email address cannot be changed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={submittingProfile}>
                    {submittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="flex flex-col gap-1">
                <span>Email Notifications</span>
                <span className="font-normal text-muted-foreground">
                  Receive updates about courses and grades via email.
                </span>
              </Label>
              <Switch 
                id="emailNotifications" 
                checked={dbUser?.settings?.notifications?.email || false}
                onCheckedChange={(checked) => setDbUser({...dbUser, settings: {...dbUser?.settings, notifications: {...dbUser?.settings?.notifications, email: checked}}})}
                disabled={submittingNotifications}
              />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications" className="flex flex-col gap-1">
                <span>Push Notifications</span>
                 <span className="font-normal text-muted-foreground">
                  Get reminders and alerts on your device.
                </span>
              </Label>
              <Switch 
                id="pushNotifications" 
                checked={dbUser?.settings?.notifications?.push || false}
                onCheckedChange={(checked) => setDbUser({...dbUser, settings: {...dbUser?.settings, notifications: {...dbUser?.settings?.notifications, push: checked}}})}
                disabled={submittingNotifications}
              />
            </div>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleNotificationsSubmit} disabled={submittingNotifications}>
                {submittingNotifications && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
            </Button>
          </CardFooter>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect your other accounts to Code-X.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                    <DiscordIcon className="h-6 w-6 text-[#5865F2]" />
                    <div>
                        <p className="font-semibold">Discord</p>
                        <p className="text-sm text-muted-foreground">Get notified and join community discussions.</p>
                    </div>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


function SettingsPageSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center">
                <h1 className="font-semibold text-3xl">Settings</h1>
            </div>
            <p className="text-muted-foreground">
                Manage your account settings, preferences, and integrations.
            </p>
             <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <Skeleton className="h-10 w-28" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        </div>
                        <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-10 w-full" /></div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4"><Skeleton className="h-10 w-24" /></CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Choose how you want to be notified.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center justify-between"><div className="space-y-1"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-64" /></div><Skeleton className="h-6 w-11" /></div>
                         <div className="flex items-center justify-between"><div className="space-y-1"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-52" /></div><Skeleton className="h-6 w-11" /></div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4"><Skeleton className="h-10 w-32" /></CardFooter>
                </Card>
            </div>
        </main>
    )
}
