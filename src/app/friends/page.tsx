'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendsList from '@/components/friends/friends-list';
import DiscoverFriends from '@/components/friends/discover-friends';

export default function FriendsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">Friends</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your connections and find new friends.
      </p>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">My Friends</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>
        <TabsContent value="friends">
          <FriendsList type="friends" />
        </TabsContent>
        <TabsContent value="requests">
          <FriendsList type="requests" />
        </TabsContent>
        <TabsContent value="discover">
          <DiscoverFriends courseId="intro-to-python" courseName="Introduction to Python" />
        </TabsContent>
      </Tabs>
    </main>
  );
}
