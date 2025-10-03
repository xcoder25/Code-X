'use client';

import { useState, useEffect } from 'react';
import { Setting } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CodeServerConfigProps {
  onUrlChange: (url: string) => void;
}

export default function CodeServerConfig({ onUrlChange }: CodeServerConfigProps) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Load saved URL from localStorage
    const savedUrl = localStorage.getItem('code-server-url') || 'https://code-x-dc8c.onrender.com';
    setUrl(savedUrl);
    onUrlChange(savedUrl);
  }, [onUrlChange]);

  const handleSave = () => {
    localStorage.setItem('code-server-url', url);
    onUrlChange(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Setting className="h-4 w-4 mr-2" />
          Configure Server
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Code-X Lab Server</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Code-Server URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://your-code-server-app.onrender.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter your deployed Code-Server URL from Render
            </p>
          </div>
          <div className="bg-muted p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Popular Deploy Platforms:</h4>
            <ul className="text-xs space-y-1">
              <li>• <strong>Render:</strong> https://your-app.onrender.com</li>
              <li>• <strong>Railway:</strong> https://your-app.railway.app</li>
              <li>• <strong>Heroku:</strong> https://your-app.herokuapp.com</li>
              <li>• <strong>Custom:</strong> https://your-domain.com</li>
            </ul>
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
