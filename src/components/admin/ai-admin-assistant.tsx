'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Loader2, 
  PlusCircle, 
  Users, 
  Upload, 
  Search, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  FileText,
  Video,
  Code,
  Presentation,
  MessageCircle,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { VoiceControls } from './voice-controls';
import { 
  aiCreateCourseAction, 
  aiAssignCourseAction, 
  aiUploadCourseAction,
  aiAnalyzeCourseAction,
  aiSuggestImprovementsAction 
} from '@/lib/ai-course-actions';
import { ELARA_KNOWLEDGE, getElaraResponse } from '@/lib/elara-knowledge-base';
import { processVoiceCommand, quickQuery, getSmartSuggestions } from '@/lib/voice-assistant-actions';
import { processAutonomousCommand } from '@/lib/voice-assistant-autonomous';

interface AIAdminAssistantProps {
  className?: string;
}

export function AIAdminAssistant({ className }: AIAdminAssistantProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [showVoiceControls, setShowVoiceControls] = useState(false);

  // Voice assistant integration with full autonomous capabilities
  const voiceAssistant = useVoiceAssistant({
    onTranscript: async (transcript) => {
      // Process with autonomous AI - it will execute actions automatically
      await handleAutonomousCommand(transcript);
    },
    onResponse: (response) => {
      // Called whenever the assistant speaks
      console.log('Assistant response:', response);
    },
  });

  // Course Creation State
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: '',
    prerequisites: [] as string[],
    learningObjectives: [] as string[],
    tags: [] as string[],
    generateContent: true,
  });

  // Course Assignment State
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    teacherId: '',
    autoAssign: false,
    specialization: '',
  });

  // Course Upload State
  const [uploadForm, setUploadForm] = useState({
    courseId: '',
    files: [] as File[],
    organizeBy: 'module' as 'module' | 'lesson' | 'type' | 'chronological',
  });

  // Analysis State
  const [analysisForm, setAnalysisForm] = useState({
    courseId: '',
  });

  // Improvements State
  const [improvementsForm, setImprovementsForm] = useState({
    context: '',
  });

  // Autonomous Command Handler - Executes actions automatically
  const handleAutonomousCommand = async (transcript: string) => {
    try {
      setIsLoading(true);
      
      // Get conversation history
      const conversationHistory = voiceAssistant.getHistory().map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Process with autonomous AI - it will execute actions
      const autonomousResponse = await processAutonomousCommand({
        userMessage: transcript,
        conversationHistory,
        autoExecute: true, // Automatically execute non-destructive actions
      });

      // Set response
      setResponse({
        message: autonomousResponse.message,
        actionExecuted: autonomousResponse.actionExecuted,
        executionResult: autonomousResponse.executionResult,
      });

      // Speak the response
      voiceAssistant.speak(autonomousResponse.message);

      // Show toast based on action execution
      if (autonomousResponse.actionExecuted && autonomousResponse.executionResult) {
        toast({
          title: autonomousResponse.executionResult.success ? 'Action Completed' : 'Action Failed',
          description: autonomousResponse.executionResult.message,
          variant: autonomousResponse.executionResult.success ? 'default' : 'destructive',
        });
      } else {
        toast({
          title: 'Elara',
          description: autonomousResponse.message.substring(0, 100) + (autonomousResponse.message.length > 100 ? '...' : ''),
        });
      }
    } catch (error) {
      console.error('Error processing autonomous command:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input handler with comprehensive knowledge
  const handleVoiceInput = (transcript: string) => {
    const command = transcript.toLowerCase().trim();
    
    // Voice commands for tab navigation
    if (command.includes('create course') || command.includes('new course') || command.includes('make a course')) {
      setActiveTab('create');
      voiceAssistant.speak("Perfect! I've opened the course creation section. I can help you build a comprehensive course with modules, lessons, and AI-generated content. Just tell me the course title and what you'd like students to learn.");
      return;
    }
    
    if (command.includes('assign course') || command.includes('assign teacher') || command.includes('assign a teacher')) {
      setActiveTab('assign');
      voiceAssistant.speak("Great! I've opened the teacher assignment tool. I'll help you find the perfect teacher for your course based on their expertise and availability. Just provide the course ID.");
      return;
    }
    
    if (command.includes('upload files') || command.includes('organize files') || command.includes('add files')) {
      setActiveTab('upload');
      voiceAssistant.speak("I've opened the file organization tool. I can intelligently organize your course materials by module, lesson, type, or chronologically. Select your course and upload the files.");
      return;
    }
    
    if (command.includes('analyze course') || command.includes('course analysis') || command.includes('check course')) {
      setActiveTab('analyze');
      voiceAssistant.speak("I've opened the course analysis tool. I'll evaluate the course for quality, completeness, and educational effectiveness. Just give me the course ID to analyze.");
      return;
    }
    
    if (command.includes('suggest improvements') || command.includes('improve course') || command.includes('how to improve')) {
      setActiveTab('improve');
      voiceAssistant.speak("I've opened the improvement suggestions section. Tell me what aspect you'd like to improve, and I'll provide personalized recommendations.");
      return;
    }
    
    // Voice commands for form actions
    if (command.includes('create course now') || command.includes('submit course') || command.includes('create it')) {
      if (activeTab === 'create') {
        handleCreateCourse();
      }
      return;
    }
    
    if (command.includes('assign course now') || command.includes('submit assignment') || command.includes('assign it')) {
      if (activeTab === 'assign') {
        handleAssignCourse();
      }
      return;
    }
    
    // Check knowledge base for responses
    const knowledgeResponse = getElaraResponse(command);
    if (knowledgeResponse) {
      voiceAssistant.speak(knowledgeResponse);
      return;
    }
    
    // Help command
    if (command.includes('help') || command.includes('what can you do')) {
      voiceAssistant.speak(ELARA_KNOWLEDGE.responses.help);
      return;
    }
    
    // Greeting
    if (command.includes('hello') || command.includes('hi elara') || command.includes('hey elara')) {
      voiceAssistant.speak(ELARA_KNOWLEDGE.responses.greeting);
      return;
    }

    // Thank you
    if (command.includes('thank you') || command.includes('thanks')) {
      voiceAssistant.speak("You're very welcome! I'm always here to help. Is there anything else you'd like me to do?");
      return;
    }

    // Didn't understand
    voiceAssistant.speak("I'm not sure I understood that. You can ask me about Code-X features, say commands like 'create course', 'assign teacher', or 'help' to see what I can do.");
  };

  // Enhanced response handling with voice feedback
  const handleResponseWithVoice = (result: any, successMessage: string) => {
    setResponse(result);
    toast({
      title: 'Success!',
      description: result.message,
    });
    
    // Provide voice feedback
    if (result.message) {
      voiceAssistant.speak(`Great! ${result.message}`);
    } else {
      voiceAssistant.speak(successMessage);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.title || !courseForm.description) {
      const errorMessage = 'Please fill in all required fields.';
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: errorMessage,
      });
      voiceAssistant.speak("I'd love to create this course, but I need both a title and description first. Could you fill those in for me?");
      return;
    }

    setIsLoading(true);
    voiceAssistant.speak("Excellent! I'm creating your course now. This will just take a moment.");
    try {
      const result = await aiCreateCourseAction(courseForm);
      handleResponseWithVoice(result, "Perfect! Your course has been created successfully with a complete structure and content.");
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      voiceAssistant.speak(`I'm sorry, but I encountered a problem: ${error.message}. Let's try that again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCourse = async () => {
    if (!assignmentForm.courseId) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a course ID.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiAssignCourseAction({
        courseId: assignmentForm.courseId,
        teacherId: assignmentForm.teacherId || undefined,
        autoAssign: assignmentForm.autoAssign,
        criteria: assignmentForm.specialization ? {
          specialization: assignmentForm.specialization,
        } : undefined,
      });
      setResponse(result);
      toast({
        title: 'Success!',
        description: result.message,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadCourse = async () => {
    if (!uploadForm.courseId || uploadForm.files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a course and upload files.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const filesData = uploadForm.files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));

      const result = await aiUploadCourseAction({
        courseId: uploadForm.courseId,
        files: filesData,
        organizeBy: uploadForm.organizeBy,
      });
      setResponse(result);
      toast({
        title: 'Success!',
        description: result.message,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCourse = async () => {
    if (!analysisForm.courseId) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a course ID.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiAnalyzeCourseAction(analysisForm.courseId);
      setResponse(result);
      toast({
        title: 'Success!',
        description: result.message,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestImprovements = async () => {
    if (!improvementsForm.context) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide context for improvements.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiSuggestImprovementsAction(improvementsForm.context);
      setResponse(result);
      toast({
        title: 'Success!',
        description: result.message,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addArrayItem = (field: string, value: string, formState: any, setFormState: any) => {
    if (value.trim()) {
      setFormState({
        ...formState,
        [field]: [...formState[field], value.trim()],
      });
    }
  };

  const removeArrayItem = (field: string, index: number, formState: any, setFormState: any) => {
    setFormState({
      ...formState,
      [field]: formState[field].filter((_: any, i: number) => i !== index),
    });
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Elara - AI Admin Assistant
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceControls(!showVoiceControls)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {showVoiceControls ? 'Hide Voice' : 'Show Voice'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Voice Controls */}
          {showVoiceControls && (
            <div className="mb-6">
              <VoiceControls
                onCommand={(command) => {
                  if (command.type === 'create_course') {
                    setActiveTab('create');
                  } else if (command.type === 'assign_course') {
                    setActiveTab('assign');
                  } else if (command.type === 'upload_files') {
                    setActiveTab('upload');
                  } else if (command.type === 'analyze_course') {
                    setActiveTab('analyze');
                  } else if (command.type === 'suggest_improvements') {
                    setActiveTab('improve');
                  }
                }}
                onTranscript={handleVoiceInput}
              />
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="assign" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assign
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="improve" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Improve
              </TabsTrigger>
            </TabsList>

            {/* Course Creation Tab */}
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g., Introduction to React"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      placeholder="Describe what students will learn..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={courseForm.difficulty}
                      onValueChange={(value: any) => setCourseForm({ ...courseForm, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                      placeholder="e.g., 4 weeks, 20 hours"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Prerequisites</Label>
                    <div className="space-y-2">
                      {courseForm.prerequisites.map((prereq, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="secondary">{prereq}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeArrayItem('prerequisites', index, courseForm, setCourseForm)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Input
                        placeholder="Add prerequisite..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('prerequisites', e.currentTarget.value, courseForm, setCourseForm);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Learning Objectives</Label>
                    <div className="space-y-2">
                      {courseForm.learningObjectives.map((objective, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">{objective}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeArrayItem('learningObjectives', index, courseForm, setCourseForm)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Input
                        placeholder="Add learning objective..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem('learningObjectives', e.currentTarget.value, courseForm, setCourseForm);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateContent"
                      checked={courseForm.generateContent}
                      onCheckedChange={(checked) => setCourseForm({ ...courseForm, generateContent: !!checked })}
                    />
                    <Label htmlFor="generateContent">Generate course content with AI</Label>
                  </div>
                </div>
              </div>
              <Button onClick={handleCreateCourse} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Create Course with AI
              </Button>
            </TabsContent>

            {/* Course Assignment Tab */}
            <TabsContent value="assign" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseId">Course ID *</Label>
                  <Input
                    id="courseId"
                    value={assignmentForm.courseId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                    placeholder="Enter course ID"
                  />
                </div>
                <div>
                  <Label htmlFor="teacherId">Teacher ID (Optional)</Label>
                  <Input
                    id="teacherId"
                    value={assignmentForm.teacherId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, teacherId: e.target.value })}
                    placeholder="Enter teacher ID"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={assignmentForm.specialization}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, specialization: e.target.value })}
                    placeholder="e.g., React, Python, Data Science"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoAssign"
                    checked={assignmentForm.autoAssign}
                    onCheckedChange={(checked) => setAssignmentForm({ ...assignmentForm, autoAssign: !!checked })}
                  />
                  <Label htmlFor="autoAssign">Auto-assign best teacher</Label>
                </div>
              </div>
              <Button onClick={handleAssignCourse} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                Assign Course with AI
              </Button>
            </TabsContent>

            {/* Course Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="uploadCourseId">Course ID *</Label>
                  <Input
                    id="uploadCourseId"
                    value={uploadForm.courseId}
                    onChange={(e) => setUploadForm({ ...uploadForm, courseId: e.target.value })}
                    placeholder="Enter course ID"
                  />
                </div>
                <div>
                  <Label htmlFor="organizeBy">Organization Method</Label>
                  <Select
                    value={uploadForm.organizeBy}
                    onValueChange={(value: any) => setUploadForm({ ...uploadForm, organizeBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="module">By Module</SelectItem>
                      <SelectItem value="lesson">By Lesson</SelectItem>
                      <SelectItem value="type">By File Type</SelectItem>
                      <SelectItem value="chronological">Chronological</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="files">Upload Files</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    onChange={(e) => setUploadForm({ ...uploadForm, files: Array.from(e.target.files || []) })}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  {uploadForm.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {uploadForm.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          {file.type.startsWith('video/') && <Video className="h-4 w-4" />}
                          {file.type.startsWith('text/') && <FileText className="h-4 w-4" />}
                          {file.type.includes('code') && <Code className="h-4 w-4" />}
                          {file.type.includes('presentation') && <Presentation className="h-4 w-4" />}
                          <span>{file.name}</span>
                          <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleUploadCourse} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload & Organize with AI
              </Button>
            </TabsContent>

            {/* Course Analysis Tab */}
            <TabsContent value="analyze" className="space-y-4">
              <div>
                <Label htmlFor="analyzeCourseId">Course ID *</Label>
                <Input
                  id="analyzeCourseId"
                  value={analysisForm.courseId}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, courseId: e.target.value })}
                  placeholder="Enter course ID to analyze"
                />
              </div>
              <Button onClick={handleAnalyzeCourse} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Analyze Course with AI
              </Button>
            </TabsContent>

            {/* Improvements Tab */}
            <TabsContent value="improve" className="space-y-4">
              <div>
                <Label htmlFor="improvementsContext">Context for Improvements</Label>
                <Textarea
                  id="improvementsContext"
                  value={improvementsForm.context}
                  onChange={(e) => setImprovementsForm({ ...improvementsForm, context: e.target.value })}
                  placeholder="Describe what you'd like to improve about the course management system..."
                  rows={4}
                />
              </div>
              <Button onClick={handleSuggestImprovements} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Get AI Suggestions
              </Button>
            </TabsContent>
          </Tabs>

          {/* Response Display */}
          {response && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  AI Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {response.message && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">{response.message}</p>
                    </div>
                  )}
                  
                  {response.suggestions && response.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions:</h4>
                      <ul className="space-y-1">
                        {response.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.nextSteps && response.nextSteps.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Next Steps:</h4>
                      <ul className="space-y-1">
                        {response.nextSteps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.courseStructure && (
                    <div>
                      <h4 className="font-medium mb-2">Generated Course Structure:</h4>
                      <div className="space-y-2">
                        {response.courseStructure.modules.map((module: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <h5 className="font-medium">{module.title}</h5>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                            <div className="mt-2 space-y-1">
                              {module.lessons.map((lesson: any, lessonIndex: number) => (
                                <div key={lessonIndex} className="text-sm">
                                  <span className="font-medium">{lesson.title}</span>
                                  <span className="text-muted-foreground ml-2">({lesson.duration})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {response.assignmentSuggestions && (
                    <div>
                      <h4 className="font-medium mb-2">Teacher Assignment Suggestions:</h4>
                      <div className="space-y-2">
                        {response.assignmentSuggestions.map((suggestion: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{suggestion.teacherName}</span>
                              <Badge variant="outline">{suggestion.compatibility}% match</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
