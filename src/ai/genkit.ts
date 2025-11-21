
/**
 * @fileoverview This file initializes and a new Genkit AI toolkit instance.
 *
 * This file is the entry point for all AI-related functionality in the app.
 * It creates a new Genkit AI toolkit instance and exports it for use in
 * other parts of the application. The Genkit AI toolkit is a collection of
 * tools and utilities that make it easy to build and use generative AI

 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (
  !process.env.GOOGLE_API_KEY &&
  !process.env.GEMINI_API_KEY &&
  !process.env.GOOGLE_GENAI_API_KEY
) {
  console.warn(
    'いずれかの環境変数を設定してください: GOOGLE_API_KEY, GEMINI_API_KEY, GOOGLE_GENAI_API_KEY'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});
