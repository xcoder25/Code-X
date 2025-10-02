
/**
 * @fileoverview This file initializes and configures the Genkit AI toolkit.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Debug logging for AI configuration
if (process.env.NODE_ENV === 'development') {
  console.log('AI Configuration:', {
    hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
    hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
    hasGoogleGenaiApiKey: !!process.env.GOOGLE_GENAI_API_KEY,
    selectedKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY ? 'Found' : 'Missing'
  });
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});
