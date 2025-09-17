
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
import { useAdminAuth } from '@/app/admin-auth-provider';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction, updateNotificationSettingsAction, claimAdminAction } from '@/app/actions';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function AdminSettingsPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingNotifications, setSubmittingNotifications] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
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
        } else {
            // Attempt to get from 'teachers' if not in 'users'
            const unsubTeacher = onSnapshot(doc(db, 'teachers', user.uid), (doc) => {
                 if (doc.exists()) {
                    const teacherData = doc.data();
                    setDbUser(teacherData);
                    profileForm.reset({
                        firstName: teacherData.firstName || '',
                        lastName: teacherData.lastName || '',
                        email: teacherData.email || '',
                    });
                 }
                 setLoading(false);
            });
            return () => unsubTeacher();
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
      // Admins are also users, so this action should be fine
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
        // Admins are also users, so this action should be fine
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
  
  const handleClaimAdmin = async () => {
      if (!user) return;
      setIsClaiming(true);
      try {
          const result = await claimAdminAction(user.uid);
          toast({ title: 'Success!', description: result.message });
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setIsClaiming(false);
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
        <h1 className="font-semibold text-3xl">Admin Settings</h1>
      </div>

      <div className="grid gap-6 mt-6">
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
                    <AvatarFallback>{dbUser?.displayName?.charAt(0) || 'A'}</AvatarFallback>
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
                  Receive system updates and important alerts.
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
                  Get alerts on your device.
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
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Perform administrative actions on your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    If this is the first time setting up the platform, click here to claim the primary admin role.
                    This can only be done once.
                </p>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button variant="destructive" onClick={handleClaimAdmin} disabled={isClaiming}>
                    {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Claim Super Admin Role
                </Button>
            </CardFooter>
        </Card>
      </div>
    </main>
  );
}


function SettingsPageSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex items-center">
                <h1 className="font-semibold text-3xl">Admin Settings</h1>
            </div>
             <div className="grid gap-6 mt-6">
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

    