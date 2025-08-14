
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';
import { next } from '@genkit-ai/next';
import 'dotenv/config';

export const ai = genkit({
  plugins: [
    next(),
    firebase(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  logSinks: ['firebase'],
  enableTracing: true,
});
