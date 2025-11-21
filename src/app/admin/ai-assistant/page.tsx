'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Users, Upload, Search, Lightbulb, Zap, MessageCircle } from 'lucide-react';
import { AIAdminAssistant } from '@/components/admin/ai-admin-assistant';

export default function AIAssistantPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elara - Your AI Admin Assistant</h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Meet Elara, your intelligent AI assistant for Code-X. I can help you create comprehensive courses, assign the perfect teachers, organize content intelligently, and optimize your platform—all through natural voice commands or simple clicks.
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI-Powered
        </Badge>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Course Creation</h3>
                <p className="text-sm text-muted-foreground">AI-generated content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Smart Assignment</h3>
                <p className="text-sm text-muted-foreground">Optimal teacher matching</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Upload className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">File Organization</h3>
                <p className="text-sm text-muted-foreground">Intelligent structuring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Search className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">Course Analysis</h3>
                <p className="text-sm text-muted-foreground">Quality assessment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Improvements</h3>
                <p className="text-sm text-muted-foreground">Optimization suggestions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Voice Control</h3>
                <p className="text-sm text-muted-foreground">Hands-free operation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Interface */}
      <AIAdminAssistant />

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            What I Can Do For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">🚀 Create Courses in Minutes</h4>
              <p className="text-sm text-muted-foreground">
                I'll build complete course structures with modules, lessons, and content—what used to take hours now takes minutes.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Find Perfect Teacher Matches</h4>
              <p className="text-sm text-muted-foreground">
                I analyze teacher expertise, availability, and teaching style to match them with the ideal courses.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📁 Organize Content Intelligently</h4>
              <p className="text-sm text-muted-foreground">
                Upload your materials and I'll organize them logically by module, lesson, or type for easy navigation.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔍 Evaluate Course Quality</h4>
              <p className="text-sm text-muted-foreground">
                I review courses for completeness, clarity, and educational value—helping you maintain high standards.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">💡 Suggest Smart Improvements</h4>
              <p className="text-sm text-muted-foreground">
                I provide actionable recommendations to boost course quality and keep students engaged.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">⚡ Work Hands-Free</h4>
              <p className="text-sm text-muted-foreground">
                Just talk to me! Use voice commands to manage everything without touching your keyboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 How to Get the Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Creating Courses</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Give me a clear, descriptive title and what you want students to learn</li>
                  <li>• Tell me the difficulty level and who the course is for</li>
                  <li>• List any prerequisites or required knowledge</li>
                  <li>• Turn on AI content generation for complete course structures</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Assigning Teachers</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Let me auto-assign for the best teacher match</li>
                  <li>• Mention any specific expertise you need</li>
                  <li>• I'll consider workload, availability, and teaching style</li>
                  <li>• Review my suggestions before confirming</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Organizing Files</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Upload related materials together for smart grouping</li>
                  <li>• Use descriptive file names so I know what they are</li>
                  <li>• Choose how you want them organized (by module, lesson, etc.)</li>
                  <li>• I'll create a logical structure students can easily follow</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Using Voice Commands</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Say "Hello Elara" to greet me and get started</li>
                  <li>• Use "Hey Google" mode for continuous hands-free control</li>
                  <li>• Ask me "What can you do?" to learn all my capabilities</li>
                  <li>• Just speak naturally—I'll understand and respond!</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
