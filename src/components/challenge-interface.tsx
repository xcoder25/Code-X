import { useState, useEffect, useRef } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Card,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Code, Loader2, Sparkles, Eye, Play } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { analyzeCodeAction } from '@/app/actions';
import type { AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  defaultCode: string;
}

interface ChallengeInterfaceProps {
  challenge: Challenge;
}

export default function ChallengeInterface({
  challenge,
}: ChallengeInterfaceProps) {
  const [code, setCode] = useState(challenge.defaultCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeCodeOutput | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
      toast({
        title: 'Success!',
        description: 'Your solution was correct.',
      });
    }, 1500);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeCodeAction({ code });
      setAnalysis(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to analyze code. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
        refreshPreview();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [code]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1 rounded-xl border-2 border-primary/10 h-full overflow-hidden shadow-2xl bg-background"
    >
      {/* Instructions Panel */}
      <ResizablePanel defaultSize={30} minSize={20}>
        <div className="flex h-full flex-col p-4 overflow-y-auto bg-muted/20">
          <CardHeader className="p-0 mb-6">
            <div className="flex items-center justify-between mb-2">
                <Badge
                    variant={
                    challenge.difficulty === 'Easy'
                        ? 'secondary'
                        : challenge.difficulty === 'Medium'
                        ? 'default'
                        : challenge.difficulty === 'Sandbox'
                        ? 'outline'
                        : 'destructive'
                    }
                    className="rounded-full px-4 py-1"
                >
                    {challenge.difficulty}
                </Badge>
                {isCompleted && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                    </Badge>
                )}
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">{challenge.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
             <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                    {challenge.description}
                </p>
             </div>

            {(isAnalyzing || analysis) && (
              <Card className="mt-8 border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-primary/10 py-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-primary">
                    <Sparkles className="h-4 w-4" />
                    ELARA INSIGHTS
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  {isAnalyzing ? (
                     <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                     </div>
                  ) : analysis ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Architecture</h4>
                            <p className="text-sm leading-relaxed">{analysis.explanation}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Coach Feedback</h4>
                            <p className="text-sm leading-relaxed italic">"{analysis.feedback}"</p>
                        </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-primary/10 hover:bg-primary/30 transition-colors w-1" />
      
      {/* Editor & Preview Panels */}
      <ResizablePanel defaultSize={70}>
        <ResizablePanelGroup direction="vertical">
          {/* Code Editor */}
          <ResizablePanel defaultSize={60}>
            <div className="flex flex-col h-full bg-card">
              <div className="px-4 py-2 border-b bg-muted/40 flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Code size={16} className="text-primary" /> 
                  <span className="opacity-70">editor.html</span>
                </h3>
                <div className="flex items-center gap-2">
                    <Button onClick={handleAnalyze} size="sm" variant="ghost" className="h-8 text-xs hover:bg-primary/10 hover:text-primary" disabled={isAnalyzing}>
                        {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                        AI Review
                    </Button>
                </div>
              </div>
              <div className="flex-1 relative bg-[#1e1e1e] text-white">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="<!-- Write your HTML/CSS/JS here -->"
                  className="absolute inset-0 w-full h-full resize-none rounded-none border-none font-mono text-sm bg-transparent p-4 focus-visible:ring-0"
                />
              </div>
              <div className="p-3 border-t bg-muted/20 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    {challenge.difficulty !== 'Sandbox' && (
                        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || isCompleted} className="shadow-lg">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-3 w-3 mr-2 fill-current" />}
                            Run Tests
                        </Button>
                    )}
                 </div>
                 <div className="flex items-center text-xs text-muted-foreground font-mono">
                    UTF-8 | HTML5
                 </div>
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-primary/10 hover:bg-primary/30 transition-colors h-1" />
          
          {/* Live Preview */}
          <ResizablePanel defaultSize={40}>
            <div className="flex flex-col h-full bg-white">
                <div className="px-4 py-2 border-b bg-muted/40 flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Eye size={16} className="text-blue-500" />
                        Live Preview
                    </h3>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={refreshPreview}>
                        <Play className="h-3 w-3" />
                    </Button>
                </div>
                <div className="flex-1 bg-white relative">
                    <iframe
                        key={previewKey}
                        srcDoc={code}
                        title="Live Preview"
                        className="w-full h-full border-none"
                        sandbox="allow-scripts"
                    />
                </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

