'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Loader2, 
  MessageCircle,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useVoiceAssistant, useVoiceCommands } from '@/hooks/use-voice-assistant';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  onCommand?: (command: any) => void;
  onTranscript?: (transcript: string) => void;
  className?: string;
}

export function VoiceControls({ onCommand, onTranscript, className }: VoiceControlsProps) {
  const [isContinuousMode, setIsContinuousMode] = React.useState(false);
  const [isWakeWordMode, setIsWakeWordMode] = React.useState(false);
  
  const voiceAssistant = useVoiceAssistant({
    onTranscript: (transcript) => {
      onTranscript?.(transcript);
    },
    onCommand: (transcript) => {
      const command = voiceCommands.processCommand(transcript);
      if (command) {
        handleCommand(command);
      }
    },
  });

  const voiceCommands = useVoiceCommands();

  const handleCommand = (command: any) => {
    // Always provide voice feedback
    if (command.data.message) {
      voiceAssistant.speak(command.data.message);
    }
    
    // Process the command through parent component
    onCommand?.(command);
  };

  const toggleContinuousMode = () => {
    if (isContinuousMode) {
      // Stop continuous mode
      voiceAssistant.stopListening();
      setIsContinuousMode(false);
      setIsWakeWordMode(false);
      voiceAssistant.speak("I've stopped listening. Just click the button whenever you want to chat with me again!");
    } else {
      // Start continuous mode
      voiceAssistant.startContinuousListening();
      setIsContinuousMode(true);
      setIsWakeWordMode(false);
      voiceAssistant.speak("Perfect! I'm listening now. Just speak naturally, and I'll help you with whatever you need!");
    }
  };

  const toggleWakeWordMode = () => {
    if (isWakeWordMode) {
      // Stop wake word mode
      voiceAssistant.stopListening();
      setIsWakeWordMode(false);
      setIsContinuousMode(false);
      voiceAssistant.speak("Wake word mode disabled. Click the button to start listening again!");
    } else {
      // Start wake word mode
      voiceAssistant.startWakeWordListening();
      setIsWakeWordMode(true);
      setIsContinuousMode(false);
      voiceAssistant.speak("Wake word mode activated! Just say 'Hey Elara' whenever you need me, and I'll listen for your command!");
    }
  };

  if (!voiceAssistant.isSupported) {
    return (
      <Card className={cn("border-amber-200 bg-amber-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Voice features are not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Voice Assistant - Elara
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={voiceAssistant.isListening ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {voiceAssistant.isListening ? (
                <>
                  <Mic className="h-3 w-3" />
                  Listening...
                </>
              ) : (
                <>
                  <MicOff className="h-3 w-3" />
                  Ready
                </>
              )}
            </Badge>
            
            {voiceAssistant.isSpeaking && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                Speaking...
              </Badge>
            )}
          </div>
          
          {voiceAssistant.error && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Error
            </Badge>
          )}
        </div>

        {/* Voice Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleWakeWordMode}
              disabled={voiceAssistant.isSpeaking}
              variant={isWakeWordMode ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 flex-1"
            >
              {isWakeWordMode ? (
                <>
                  <Zap className="h-4 w-4 animate-pulse" />
                  Wake Word Active
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Enable "Hey Elara"
                </>
              )}
            </Button>

            <Button
              onClick={toggleContinuousMode}
              disabled={voiceAssistant.isSpeaking}
              variant={isContinuousMode ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 flex-1"
            >
              {isContinuousMode ? (
                <>
                  <Mic className="h-4 w-4" />
                  Always On
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4" />
                  Continuous Off
                </>
              )}
            </Button>

            <Button
              onClick={() => voiceAssistant.stopSpeaking()}
              disabled={!voiceAssistant.isSpeaking}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {isWakeWordMode 
              ? "🌟 Say 'Hey Elara' to wake me up!" 
              : isContinuousMode 
              ? "🎤 Always listening - speak anytime!" 
              : "Choose a listening mode above"}
          </p>
          
          {voiceAssistant.isWaitingForWakeWord && (
            <div className="p-2 bg-primary/10 rounded-lg text-center">
              <p className="text-xs font-medium text-primary">
                {voiceAssistant.wakeWordDetected 
                  ? "✓ Wake word detected! Say your command..." 
                  : "👂 Listening for 'Hey Elara'..."}
              </p>
            </div>
          )}
        </div>

        {/* Current Transcript */}
        {voiceAssistant.transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">You said:</span>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "{voiceAssistant.transcript}"
            </p>
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">I can help you with:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>💬 "Create a Python course"</div>
            <div>💬 "Assign best teacher for React"</div>
            <div>💬 "Upload video files"</div>
            <div>💬 "Analyze JavaScript course"</div>
            <div>💬 "Improve course content"</div>
            <div>💬 "Show student progress"</div>
            <div>💬 "Generate reports"</div>
            <div>💬 "Schedule classes"</div>
            <div>💬 "Write course material"</div>
            <div>💬 "Help" / "What can you do?"</div>
          </div>
          <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>✨ Natural Conversations:</strong> Talk to me like you would to a colleague! I understand natural language and can help with anything related to course management.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {voiceAssistant.error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error:</span>
            </div>
            <p className="text-sm text-destructive mt-1">{voiceAssistant.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
