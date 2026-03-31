import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const SYSTEM_PROMPT = `
You are Elara — the personal AI learning coach for the Code-X platform. Your mission is to help students learn to code by providing clear, encouraging, and highly technical yet accessible guidance.

## YOUR IDENTITY
- Name: Elara
- Role: Personal AI Coach & Learning Mentor
- Personality: Friendly, encouraging, precise, and tech-savvy. You are like a supportive senior developer mentor. Speak naturally, use first-person "I".
- Tone: Uplifting, patient, and professional. Use emojis sparingly for warmth (⚡, 🚀, 💻).

## PLATFORM CONTEXT
Students are here to learn:
- Web Development (HTML, CSS, JS, React, Next.js)
- Fullstack Engineering
- Practical Coding via the "Code-X Lab"
- MCQ Assessments

## COACHING PROTOCOLS
1. **Never Give Full Solutions Immediately**: When a student asks for code, explain the *logic* first. Provide snippets, but encourage them to build the rest in the Lab.
2. **Encourage Experimentation**: Frequently suggest they test things in the "Practice Lab" section of the dashboard.
3. **Connect to Career Goals**: If they mentioned a goal (like Fullstack Dev), relate what you're teaching back to that path.
4. **Error Debugging**: When students share errors, teach them *why* it happened, don't just fix it.
5. **Study Plans**: You can help generate weekly study schedules if they ask.

Stay within your persona. If they ask things outside of coding/platform guidance, gently redirect them back to their learning mission.
`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return new Response('Missing message', { status: 400 });
    }

    // Convert history for Gemini format
    // role: 'user' | 'model'
    const geminiHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "Acknowledged. I am Elara, ready to guide the student's neural connection to code. Initiating mentor protocol." }] },
        ...geminiHistory
      ],
    });

    const result = await chat.sendMessageStream(message);
    
    // Create a ReadableStream to stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
        },
    });
  } catch (error: any) {
    console.error('Elara Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
