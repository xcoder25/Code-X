'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { z } from 'zod';
import { adminAssistantFlow, type AdminAssistantInput } from '@/ai/flows/admin-assistant-flow';
import { createCourseAction } from '@/app/actions';

// Schema for AI course creation
const aiCreateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  generateContent: z.boolean().default(true),
});

// Schema for AI course assignment
const aiAssignCourseSchema = z.object({
  courseId: z.string(),
  teacherId: z.string().optional(),
  autoAssign: z.boolean().default(false),
  criteria: z.object({
    specialization: z.string().optional(),
    experience: z.string().optional(),
    availability: z.boolean().optional(),
  }).optional(),
});

// Schema for AI course upload
const aiUploadCourseSchema = z.object({
  courseId: z.string(),
  files: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    content: z.string().optional(),
  })),
  organizeBy: z.enum(['module', 'lesson', 'type', 'chronological']).default('module'),
});

export async function aiCreateCourseAction(input: z.infer<typeof aiCreateCourseSchema>) {
  const {
    title,
    description,
    difficulty,
    duration,
    prerequisites,
    learningObjectives,
    tags,
    generateContent,
  } = aiCreateCourseSchema.parse(input);

  try {
    let courseStructure = null;
    let suggestions: string[] = [];
    let nextSteps: string[] = [];

    if (generateContent) {
      // Use AI to generate course structure
      const aiResponse = await adminAssistantFlow({
        task: 'create_course',
        context: `Create a comprehensive ${difficulty} level course titled "${title}" with description: ${description}`,
        courseData: {
          title,
          description,
          difficulty,
          duration,
          prerequisites,
          learningObjectives,
          tags,
        },
      });

      courseStructure = aiResponse.generatedContent?.courseStructure;
      suggestions = aiResponse.suggestions || [];
      nextSteps = aiResponse.nextSteps || [];
    }

    // Create the course using existing action
    const courseData = {
      title,
      description,
      tags: tags?.join(',') || '',
      modules: courseStructure?.modules || [],
      price: 0, // Default to free, can be updated later
    };

    const result = await createCourseAction(courseData);

    // Update course with AI-generated metadata
    if (courseStructure) {
      await updateDoc(doc(db, 'courses', result.id), {
        difficulty,
        duration,
        prerequisites,
        learningObjectives,
        aiGenerated: true,
        aiSuggestions: suggestions,
        nextSteps,
        createdAt: serverTimestamp(),
      });
    }

    return {
      success: true,
      courseId: result.id,
      courseStructure,
      suggestions,
      nextSteps,
      message: `Course "${title}" has been created successfully with AI assistance.`,
    };
  } catch (error) {
    console.error('Error in aiCreateCourseAction:', error);
    throw new Error(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function aiAssignCourseAction(input: z.infer<typeof aiAssignCourseSchema>) {
  const { courseId, teacherId, autoAssign, criteria } = aiAssignCourseSchema.parse(input);

  try {
    // Get course details
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (!courseDoc.exists()) {
      throw new Error('Course not found');
    }

    const courseData = courseDoc.data();

    let assignmentSuggestions = null;
    let selectedTeacher = teacherId;

    if (autoAssign || !teacherId) {
      // Use AI to suggest optimal teacher assignment
      const aiResponse = await adminAssistantFlow({
        task: 'assign_course',
        context: `Assign the course "${courseData.title}" to the most suitable teacher`,
        courseData: {
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty,
          tags: courseData.tags,
        },
        teacherInfo: criteria ? {
          specialization: criteria.specialization,
        } : undefined,
      });

      assignmentSuggestions = aiResponse.generatedContent?.assignmentSuggestions;

      // Get available teachers
      const teachersQuery = query(collection(db, 'teachers'));
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachers = teachersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Find best match based on AI suggestions
      if (assignmentSuggestions && assignmentSuggestions.length > 0) {
        const bestMatch = assignmentSuggestions[0];
        const teacher = teachers.find(t => t.id === bestMatch.teacherId);
        if (teacher) {
          selectedTeacher = teacher.id;
        }
      }
    }

    if (selectedTeacher) {
      // Assign the course to the selected teacher
      await updateDoc(doc(db, 'courses', courseId), {
        teacherId: selectedTeacher,
        assignedAt: serverTimestamp(),
        assignmentMethod: autoAssign ? 'ai_auto' : 'manual',
      });

      return {
        success: true,
        assignedTeacher: selectedTeacher,
        assignmentSuggestions,
        message: `Course has been assigned successfully.`,
      };
    } else {
      return {
        success: false,
        assignmentSuggestions,
        message: 'No suitable teacher found. Please review suggestions and assign manually.',
      };
    }
  } catch (error) {
    console.error('Error in aiAssignCourseAction:', error);
    throw new Error(`Failed to assign course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function aiUploadCourseAction(input: z.infer<typeof aiUploadCourseSchema>) {
  const { courseId, files, organizeBy } = aiUploadCourseSchema.parse(input);

  try {
    // Get course details
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (!courseDoc.exists()) {
      throw new Error('Course not found');
    }

    const courseData = courseDoc.data();

    // Use AI to organize and recommend file structure
    const aiResponse = await adminAssistantFlow({
      task: 'upload_course',
      context: `Organize ${files.length} files for the course "${courseData.title}" using ${organizeBy} organization`,
      courseData: {
        title: courseData.title,
        description: courseData.description,
        tags: courseData.tags,
      },
      uploadData: {
        fileType: files[0]?.type as any,
        fileName: files[0]?.name,
        fileSize: files[0]?.size,
        description: `Uploading ${files.length} files`,
      },
    });

    const uploadRecommendations = aiResponse.generatedContent?.uploadRecommendations;

    // Process and organize files
    const organizedFiles = files.map((file, index) => {
      const recommendation = uploadRecommendations?.[index];
      return {
        ...file,
        organizedName: recommendation?.fileName || file.name,
        tags: recommendation?.tags || [],
        description: recommendation?.description || '',
        uploadOrder: index + 1,
      };
    });

    // Update course with organized file structure
    await updateDoc(doc(db, 'courses', courseId), {
      resources: organizedFiles,
      organizationMethod: organizeBy,
      aiUploadRecommendations: uploadRecommendations,
      lastUploaded: serverTimestamp(),
    });

    return {
      success: true,
      organizedFiles,
      uploadRecommendations,
      suggestions: aiResponse.suggestions,
      nextSteps: aiResponse.nextSteps,
      message: `Files have been organized and uploaded successfully.`,
    };
  } catch (error) {
    console.error('Error in aiUploadCourseAction:', error);
    throw new Error(`Failed to upload course files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function aiAnalyzeCourseAction(courseId: string) {
  try {
    // Get course details
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (!courseDoc.exists()) {
      throw new Error('Course not found');
    }

    const courseData = courseDoc.data();

    // Use AI to analyze the course
    const aiResponse = await adminAssistantFlow({
      task: 'analyze_course',
      context: `Analyze the course "${courseData.title}" and provide improvement suggestions`,
      courseData: {
        title: courseData.title,
        description: courseData.description,
        tags: courseData.tags,
        difficulty: courseData.difficulty,
      },
    });

    return {
      success: true,
      analysis: aiResponse.response,
      suggestions: aiResponse.suggestions,
      nextSteps: aiResponse.nextSteps,
      message: 'Course analysis completed successfully.',
    };
  } catch (error) {
    console.error('Error in aiAnalyzeCourseAction:', error);
    throw new Error(`Failed to analyze course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function aiSuggestImprovementsAction(context: string) {
  try {
    const aiResponse = await adminAssistantFlow({
      task: 'suggest_improvements',
      context,
    });

    return {
      success: true,
      suggestions: aiResponse.response,
      recommendations: aiResponse.suggestions,
      nextSteps: aiResponse.nextSteps,
      message: 'Improvement suggestions generated successfully.',
    };
  } catch (error) {
    console.error('Error in aiSuggestImprovementsAction:', error);
    throw new Error(`Failed to generate suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
