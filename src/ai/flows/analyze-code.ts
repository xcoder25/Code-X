
'use server';

/**
 * @fileOverview An AI agent that analyzes and provides feedback on code snippets.
 *
 * - analyzeCode - A function that takes a code snippet and returns an analysis.
 * - AnalyzeCodeInput - The input type for the analyzeCode function.
 * - AnalyzeCodeOutput - The return type for the analyzeCode function.
 */
import { getAI, getGenerativeModel } from "firebase/ai";
import { app } from '@/lib/firebase';
import { z } from 'zod';

const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

export interface AnalyzeCodeOutput {
  explanation: string;
  feedback: string;
}

const ai = getAI(app);

const model = getGenerativeModel(ai, { 
    model: "gemini-1.5-flash",
    systemInstruction: `You are an expert code reviewer and AI assistant. Your task is to analyze the following code snippet and provide a clear explanation and constructive feedback.

    Your output must be a valid JSON object with two keys: "explanation" and "feedback".
    
    - "explanation": Describe what the code is intended to do. Explain the logic and flow.
    - "feedback": Identify any potential bugs, style issues, or areas for improvement. Suggest specific changes and explain why they are better. If the code is good, acknowledge it.`
});

export async function analyzeCode(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
  const prompt = `Task:
  1.  **Explain the Code**: Describe what the code is intended to do. Explain the logic and flow.
  2.  **Provide Feedback**: Identify any potential bugs, style issues, or areas for improvement. Suggest specific changes and explain why they are better. If the code is good, acknowledge it.
  
  Code to analyze:
  \`\`\`
  ${input.code}
  \`\`\`
  
  Generate your analysis now in JSON format.`;
  
  const result = await model.generateContent(prompt, {
    responseMimeType: "application/json",
  });
  
  const response = result.response;
  const text = response.text();
  
  try {
    const parsed = JSON.parse(text);
    return {
        explanation: parsed.explanation || "No explanation provided.",
        feedback: parsed.feedback || "No feedback provided."
    }
  } catch (e) {
      console.error("Failed to parse AI response:", text);
      return {
          explanation: "The AI returned an invalid response.",
          feedback: "Could not get feedback due to a formatting error."
      }
  }
}
