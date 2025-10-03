'use client';

import { useState } from 'react';
import { ExternalLink, Terminal, Code, Folder, Play, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CODE_SERVER_URL = 'https://code-x-dc8c.onrender.com';

export default function LabPage() {
  const [target, setTarget] = useState<'fullscreen' | 'redirect' | null>(null);

  const handleOpenFullscreen = () => {
    setTarget('fullscreen');
    window.open(CODE_SERVER_URL, '_blank');
    setTimeout(() => setTarget(null), 1000);
  };

  const handleRedirectToLab = () => {
    setTarget('redirect');
    window.location.href = CODE_SERVER_URL;
  };

  return (
    <main className="flex flex-1 flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <h1 className="font-semibold text-xl">Code-X Lab</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Terminal className="h-4 w-4" />
          <span>VS Code Online Environment</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Access Methods */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Monitor className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Access Your VS Code Environment</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Choose how you want to access your Code-Server instance
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleOpenFullscreen}
              disabled={target === 'fullscreen'}
              className="w-full justify-start"
              size="lg"
            >
              <ExternalLink className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Open in New Tab</div>
                <div className="text-sm opacity-80">Full VS Code experience</div>
              </div>
            </Button>

            <Button 
              onClick={handleRedirectToLab}
              variant="outline"
              disabled={target === 'redirect'}
              className="w-full justify-start"
              size="lg"
            >
              <Play className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Redirect to Lab</div>
                <div className="text-sm opacity-80">Navigate directly to Code-Server</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Features Available
            </CardTitle>
            <CardDescription>
              Full VS Code functionality running on your server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Full File System Access</div>
                  <div className="text-xs text-muted-foreground">Browse and edit any files</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Integrated Terminal</div>
                  <div className="text-xs text-muted-foreground">Run commands directly</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Extension Support</div>
                  <div className="text-xs text-muted-foreground">Install any VS Code extensions</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Git Integration</div>
                  <div className="text-xs text-muted-foreground">Version control ready</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">Multi-language Support</div>
                  <div className="text-xs text-muted-foreground">Syntax highlighting & IntelliSense</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">🚀 Ready to Code?</h3>
            <p className="text-sm text-muted-foreground">
              Your Code-Server is running at: <code className="bg-background px-2 py-1 rounded text-xs">{CODE_SERVER_URL}</code>
            </p>
          </div>
          <Button onClick={handleOpenFullscreen} size="sm">
            <Play className="h-4 w-4 mr-2" />
            Launch Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-center text-xs text-muted-foreground">
        <span>Powered by VS Code Server • Deployed on Render</span>
      </div>
    </main>
  );
}