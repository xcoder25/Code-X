
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectClassroomDialogProps {
  onConnected: () => void;
  isConnected: boolean;
}

export function ConnectClassroomDialog({ onConnected, isConnected }: ConnectClassroomDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [classCode, setClassCode] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!classCode) {
      toast({
        variant: 'destructive',
        title: 'Please enter a class code.',
      });
      return;
    }
    setIsLoading(true);

    // In a real app, you would make an API call here to your backend
    // to verify the code with the Google Classroom API.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demonstration, we'll assume the code is valid.
    toast({
      title: 'Classroom Connected!',
      description: 'You have successfully linked your Google Classroom.',
    });
    
    onConnected();
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isConnected}>
          {isConnected && <Check className="mr-2 h-4 w-4" />}
          {isConnected ? 'Classroom Connected' : 'Connect to Google Classroom'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to Google Classroom</DialogTitle>
          <DialogDescription>
            Enter the class code provided by your teacher to link your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class-code" className="text-right">
              Class Code
            </Label>
            <Input
              id="class-code"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="col-span-3"
              placeholder="e.g., a1b2c3d"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
