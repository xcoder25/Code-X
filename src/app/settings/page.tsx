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


export default function SettingsPage() {
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
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="profile picture" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@email.com" />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Changes</Button>
          </CardFooter>
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
              <Switch id="emailNotifications" defaultChecked />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications" className="flex flex-col gap-1">
                <span>Push Notifications</span>
                 <span className="font-normal text-muted-foreground">
                  Get reminders and alerts on your device.
                </span>
              </Label>
              <Switch id="pushNotifications" />
            </div>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button>Save Preferences</Button>
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