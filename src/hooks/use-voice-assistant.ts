'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import memoryInstance, { addUserMessage, addAssistantMessage, getConversationContext } from '@/lib/voice-assistant-memory';

interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  isWaitingForWakeWord: boolean;
  wakeWordDetected: boolean;
}

interface VoiceAssistantOptions {
  onTranscript?: (transcript: string) => void;
  onCommand?: (command: string) => void;
  onResponse?: (response: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  userId?: string;
}

export function useVoiceAssistant(options: VoiceAssistantOptions = {}) {
  const { toast } = useToast();
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    error: null,
    isWaitingForWakeWord: false,
    wakeWordDetected: false,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRestartRef = useRef(false);
  const wakeWordModeRef = useRef(false);
  const wakeWordTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition and memory
  useEffect(() => {
    // Initialize conversation session
    if (typeof window !== 'undefined') {
      memoryInstance.getCurrentSession(options.userId);
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const SpeechSynthesis = window.speechSynthesis;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        // Configure for "Hey Google" style interaction
        recognition.continuous = false; // Stop after user finishes speaking
        recognition.interimResults = true; // Show real-time transcription
        recognition.lang = options.language ?? 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setState(prev => ({ ...prev, isListening: true, error: null }));
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript || interimTranscript;
          setState(prev => ({ ...prev, transcript: fullTranscript }));

          // Process final transcript (when user stops speaking)
          if (finalTranscript) {
            const lowerTranscript = finalTranscript.toLowerCase().trim();

            // Check for wake word if in wake word mode
            if (wakeWordModeRef.current) {
              if (lowerTranscript.includes('hey elara') || lowerTranscript.includes('hi elara') || lowerTranscript.includes('hello elara')) {
                // Wake word detected!
                setState(prev => ({ ...prev, wakeWordDetected: true, transcript: '' }));
                speak("Yes? I'm listening!");
                
                // Wait for actual command (timeout after 15 seconds)
                if (wakeWordTimeout.current) {
                  clearTimeout(wakeWordTimeout.current);
                }
                wakeWordTimeout.current = setTimeout(() => {
                  setState(prev => ({ ...prev, wakeWordDetected: false }));
                  speak("I'm still here if you need me. Just say 'hey Elara' again!");
                }, 15000);
                
                return;
              }

              // If wake word was detected, process the command
              if (state.wakeWordDetected) {
                if (wakeWordTimeout.current) {
                  clearTimeout(wakeWordTimeout.current);
                }
                setState(prev => ({ ...prev, wakeWordDetected: false }));
                
                // Add to conversation memory
                addUserMessage(finalTranscript);
                
                options.onTranscript?.(finalTranscript);
                options.onCommand?.(finalTranscript);
                
                // Clear transcript after processing
                setTimeout(() => {
                  setState(prev => ({ ...prev, transcript: '' }));
                }, 3000);
                return;
              }

              // In wake word mode but no wake word detected, ignore
              return;
            }

            // Normal mode (no wake word required)
            // Add to conversation memory
            addUserMessage(finalTranscript);
            
            options.onTranscript?.(finalTranscript);
            options.onCommand?.(finalTranscript);
            
            // Clear transcript after processing
            setTimeout(() => {
              setState(prev => ({ ...prev, transcript: '' }));
            }, 3000);
          }
        };

        recognition.onerror = (event) => {
          // Ignore "no-speech" error - just means user didn't speak
          if (event.error === 'no-speech') {
            setState(prev => ({ ...prev, isListening: false, transcript: '' }));
            // Auto-restart listening if enabled
            if (autoRestartRef.current) {
              setTimeout(() => {
                if (recognitionRef.current && autoRestartRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (e) {
                    // Ignore if already started
                  }
                }
              }, 500);
            }
            return;
          }

          // Ignore "aborted" error - normal when stopping
          if (event.error === 'aborted') {
            setState(prev => ({ ...prev, isListening: false }));
            return;
          }

          // Only show real errors
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            const errorMessage = `Voice error: ${event.error}`;
            setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
            
            // Don't show toast for common errors
            if (event.error !== 'not-allowed') {
              toast({
                variant: 'destructive',
                title: 'Voice Recognition Error',
                description: errorMessage,
              });
            }
          }
        };

        recognition.onend = () => {
          setState(prev => ({ ...prev, isListening: false }));
          
          // Auto-restart if enabled (for continuous "Hey Google" style)
          if (autoRestartRef.current) {
            setTimeout(() => {
              if (recognitionRef.current && autoRestartRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  // Ignore if already started
                }
              }
            }, 100);
          }
        };
      }

      if (SpeechSynthesis) {
        synthesisRef.current = SpeechSynthesis;
      }
    }

    return () => {
      // Cleanup
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [options, toast]);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        autoRestartRef.current = false; // One-time listening
        recognitionRef.current.start();
      } catch (error) {
        // Ignore if already started
        if (error instanceof Error && !error.message.includes('already started')) {
          const errorMessage = 'Failed to start voice recognition. Please allow microphone access.';
          setState(prev => ({ ...prev, error: errorMessage }));
          toast({
            variant: 'destructive',
            title: 'Voice Recognition Error',
            description: errorMessage,
          });
        }
      }
    }
  }, [state.isListening, toast]);

  // Start continuous listening (Hey Google style)
  const startContinuousListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        autoRestartRef.current = true; // Keep listening
        recognitionRef.current.start();
      } catch (error) {
        if (error instanceof Error && !error.message.includes('already started')) {
          const errorMessage = 'Failed to start voice recognition. Please allow microphone access.';
          setState(prev => ({ ...prev, error: errorMessage }));
          toast({
            variant: 'destructive',
            title: 'Voice Recognition Error',
            description: errorMessage,
          });
        }
      }
    }
  }, [state.isListening, toast]);

  // Start wake word listening (always listening for "hey elara")
  const startWakeWordListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        wakeWordModeRef.current = true;
        autoRestartRef.current = true; // Keep listening
        setState(prev => ({ ...prev, isWaitingForWakeWord: true, wakeWordDetected: false }));
        recognitionRef.current.start();
      } catch (error) {
        if (error instanceof Error && !error.message.includes('already started')) {
          const errorMessage = 'Failed to start voice recognition. Please allow microphone access.';
          setState(prev => ({ ...prev, error: errorMessage }));
          toast({
            variant: 'destructive',
            title: 'Voice Recognition Error',
            description: errorMessage,
          });
        }
      }
    }
  }, [state.isListening, toast]);

  // Stop listening
  const stopListening = useCallback(() => {
    autoRestartRef.current = false; // Disable auto-restart
    wakeWordModeRef.current = false; // Disable wake word mode
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    }
    if (wakeWordTimeout.current) {
      clearTimeout(wakeWordTimeout.current);
    }
    setState(prev => ({ ...prev, isListening: false, isWaitingForWakeWord: false, wakeWordDetected: false }));
  }, []);

  // Speak text with natural, human-like voice
  const speak = useCallback((text: string, speechOptions?: { rate?: number; pitch?: number; volume?: number }) => {
    if (synthesisRef.current) {
      // Add to conversation memory
      addAssistantMessage(text);
      
      // Notify parent component
      options.onResponse?.(text);

      // Stop any current speech
      synthesisRef.current.cancel();

      // Break text into natural chunks for more human-like speech
      const chunks = breakIntoNaturalChunks(text);
      let currentChunkIndex = 0;

      const speakChunk = (chunk: string) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        
        // Select the most natural-sounding voice
        const voices = synthesisRef.current!.getVoices();
        
        // Priority order for most natural voices
        const preferredVoices = [
          'Google US English',
          'Google UK English Female',
          'Microsoft Aria Online (Natural) - English (United States)',
          'Microsoft Jenny Online (Natural) - English (United States)',
          'Samantha',
          'Alex',
          'Victoria',
          'Microsoft Zira Desktop',
          'Google UK English Male',
        ];
        
        let selectedVoice = null;
        for (const preferred of preferredVoices) {
          selectedVoice = voices.find(voice => voice.name.includes(preferred));
          if (selectedVoice) break;
        }
        
        // Fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.toLowerCase().includes('natural') || 
             voice.name.toLowerCase().includes('online') ||
             voice.name.toLowerCase().includes('female'))
          ) || voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Natural speech parameters
        utterance.rate = speechOptions?.rate ?? 1.05; // Slightly faster for natural conversation
        utterance.pitch = speechOptions?.pitch ?? 1.0; // Natural pitch
        utterance.volume = speechOptions?.volume ?? 1;
        utterance.lang = 'en-US';

        utterance.onstart = () => {
          setState(prev => ({ ...prev, isSpeaking: true }));
        };

        utterance.onend = () => {
          currentChunkIndex++;
          if (currentChunkIndex < chunks.length) {
            // Small pause between chunks for natural flow
            setTimeout(() => speakChunk(chunks[currentChunkIndex]), 150);
          } else {
            setState(prev => ({ ...prev, isSpeaking: false }));
          }
        };

        utterance.onerror = (event) => {
          const errorMessage = `Speech synthesis error: ${event.error}`;
          setState(prev => ({ ...prev, error: errorMessage, isSpeaking: false }));
          toast({
            variant: 'destructive',
            title: 'Voice Synthesis Error',
            description: errorMessage,
          });
        };

        utteranceRef.current = utterance;
        synthesisRef.current!.speak(utterance);
      };

      // Start speaking the first chunk
      if (chunks.length > 0) {
        speakChunk(chunks[0]);
      }
    }
  }, [toast]);

  // Helper function to break text into natural chunks
  const breakIntoNaturalChunks = (text: string): string[] => {
    // Split by sentences or natural pauses
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    
    for (const sentence of sentences) {
      // If sentence is too long, split by commas or conjunctions
      if (sentence.length > 120) {
        const subChunks = sentence.split(/,|\sand\s|\sbut\s|\sor\s/);
        chunks.push(...subChunks.map(s => s.trim()).filter(s => s.length > 0));
      } else {
        chunks.push(sentence.trim());
      }
    }
    
    return chunks.filter(chunk => chunk.length > 0);
  };

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  // Check if voice features are supported
  const isSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition) && 
    window.speechSynthesis;

  // Get conversation context
  const getContext = useCallback(() => {
    return getConversationContext();
  }, []);

  // Get conversation history
  const getHistory = useCallback(() => {
    return memoryInstance.getHistory();
  }, []);

  // Clear conversation memory
  const clearMemory = useCallback(() => {
    memoryInstance.clearSession();
  }, []);

  return {
    ...state,
    startListening,
    startContinuousListening,
    startWakeWordListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleListening,
    clearTranscript,
    isSupported,
    getContext,
    getHistory,
    clearMemory,
  };
}

// Voice command processor for admin tasks - Enhanced with AI-powered understanding
export function useVoiceCommands() {
  const processCommand = useCallback((transcript: string) => {
    const command = transcript.toLowerCase().trim();
    
    // Natural language patterns for course creation
    if (
      command.includes('create') && (command.includes('course') || command.includes('class') || command.includes('lesson')) ||
      command.includes('new course') || command.includes('make a course') ||
      command.includes('build a course') || command.includes('design course') ||
      command.includes('set up course') || command.includes('add course')
    ) {
      return { 
        type: 'create_course', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I'd be happy to help you create a course! Could you tell me what topic you'd like to cover?" 
        } 
      };
    }
    
    // Natural language patterns for course assignment
    if (
      command.includes('assign') && (command.includes('course') || command.includes('teacher') || command.includes('instructor')) ||
      command.includes('match teacher') || command.includes('find teacher') ||
      command.includes('who should teach') || command.includes('best teacher for')
    ) {
      return { 
        type: 'assign_course', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I can help you find the perfect teacher for your course. What subject or course are we assigning?" 
        } 
      };
    }
    
    // Natural language patterns for file operations
    if (
      command.includes('upload') || command.includes('organize') || 
      command.includes('manage files') || command.includes('add files') ||
      command.includes('import') || command.includes('arrange files')
    ) {
      return { 
        type: 'upload_files', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I'll help you organize and upload your files. What type of content are you working with?" 
        } 
      };
    }
    
    // Natural language patterns for analysis
    if (
      command.includes('analyze') || command.includes('analysis') || 
      command.includes('review course') || command.includes('evaluate') ||
      command.includes('assess') || command.includes('examine course')
    ) {
      return { 
        type: 'analyze_course', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I can analyze your course and provide detailed insights. Which course would you like me to review?" 
        } 
      };
    }
    
    // Natural language patterns for improvements
    if (
      command.includes('improve') || command.includes('enhancement') || 
      command.includes('better') || command.includes('optimize') ||
      command.includes('suggestions') || command.includes('recommendations')
    ) {
      return { 
        type: 'suggest_improvements', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I'd love to help improve your course! Which aspect would you like to enhance?" 
        } 
      };
    }
    
    // Student management
    if (
      command.includes('student') || command.includes('learner') || 
      command.includes('enrollment') || command.includes('progress')
    ) {
      return { 
        type: 'manage_students', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I can help you with student management. What would you like to know or do?" 
        } 
      };
    }
    
    // Reporting and analytics
    if (
      command.includes('report') || command.includes('statistics') || 
      command.includes('analytics') || command.includes('metrics') ||
      command.includes('performance')
    ) {
      return { 
        type: 'reports', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I can generate reports and show you analytics. What information are you looking for?" 
        } 
      };
    }
    
    // Scheduling and planning
    if (
      command.includes('schedule') || command.includes('calendar') || 
      command.includes('plan') || command.includes('timeline')
    ) {
      return { 
        type: 'scheduling', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I can help you plan and schedule courses. What would you like to organize?" 
        } 
      };
    }
    
    // Content creation
    if (
      command.includes('write') || command.includes('generate') || 
      command.includes('content') || command.includes('material')
    ) {
      return { 
        type: 'content_creation', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I can help you create engaging course content. What would you like me to help you write?" 
        } 
      };
    }
    
    // Help commands
    if (
      command.includes('help') || command.includes('what can you do') ||
      command.includes('capabilities') || command.includes('how do you work')
    ) {
      return { 
        type: 'help', 
        data: { 
          message: "Hi! I'm Elara, your AI-powered admin assistant. I can help you with anything related to course management! Here's what I can do: create and design courses, assign the best teachers, organize and upload files, analyze course quality, suggest improvements, manage students, generate reports, schedule classes, and create engaging content. Just tell me naturally what you need, and I'll take care of it!" 
        } 
      };
    }
    
    // Greeting commands
    if (
      command.includes('hello') || command.includes('hi') ||
      command.includes('hey') || command.includes('greetings')
    ) {
      return { 
        type: 'greeting', 
        data: { 
          message: "Hello there! I'm Elara, your intelligent AI admin assistant. I'm here to help you with absolutely anything you need for course management. What can I do for you today?" 
        } 
      };
    }
    
    // Thank you / acknowledgment
    if (
      command.includes('thank') || command.includes('thanks') ||
      command.includes('appreciate')
    ) {
      return { 
        type: 'acknowledgment', 
        data: { 
          message: "You're very welcome! I'm always here to help. Is there anything else I can do for you?" 
        } 
      };
    }
    
    // General query - AI will handle anything else
    if (command.length > 5) {
      return { 
        type: 'general_query', 
        data: { 
          action: 'ai_assist',
          transcript: transcript,
          message: "I understand you'd like help with something. Let me assist you with that!" 
        } 
      };
    }
    
    // Fallback for unclear commands
    return { 
      type: 'unknown', 
      data: { 
        message: "I'm not quite sure what you need, but I'm here to help! Could you rephrase that or tell me what you'd like to do?" 
      } 
    };
  }, []);

  return { processCommand };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
