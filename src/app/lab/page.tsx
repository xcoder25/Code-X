'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Terminal, Code, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CodeServerConfig from '@/components/code-server-config';

export default function LabPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [codeServerUrl, setCodeServerUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set your Render Code-Server URL here
    setCodeServerUrl('https://code-x-dc8c.onrender.com');
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-theme(spacing.14))]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Code-X Lab...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col h-[calc(100vh-theme(spacing.14))]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-xl">Code-X Lab</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Terminal className="h-4 w-4" />
            <span>VS Code Online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <CodeServerConfig onUrlChange={setCodeServerUrl} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => isClient && window.open(codeServerUrl, '_blank')}
            disabled={!isClient || !codeServerUrl}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => isClient && window.location.reload()}
            disabled={!isClient}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* VS Code Embed */}
      <div className="flex-1 relative">
        {isClient && codeServerUrl ? (
          <iframe
            src={codeServerUrl}
            className="w-full h-full border-0"
            style={{
              background: 'var(--background)',
            }}
            title="Code-X Lab - VS Code Online"
            allow="clipboard-read; clipboard-write; web-share"
            loading="lazyload"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Loading VS Code environment...</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between p-3 border-t bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            Full File System Access
          </span>
          <span className="flex items-center gap-1">
            <Terminal className="h-3 w-3" />
            Terminal Available
          </span>
          <span className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Extension Support
          </span>
        </div>
        <div>
          Powered by VS Code Server
        </div>
      </div>
    </main>
  );
}
