# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

Create a `.env.local` file in the project root and populate the following keys (do not commit `.env.local`):

```
NEXT_PUBLIC_APP_URL=http://localhost:9002

# Firebase (client-safe)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Google AI / Genkit (CRITICAL FOR AI FEATURES)
GOOGLE_API_KEY=your_google_ai_api_key_here
```

**⚠️ IMPORTANT FOR PRODUCTION:**
- The `GOOGLE_API_KEY` is **REQUIRED** for all AI features to work
- Make sure to set all environment variables in your production deployment platform
- For Docker deployments, pass environment variables using `-e` flag or docker-compose
- For Vercel/Netlify, add environment variables in your deployment dashboard