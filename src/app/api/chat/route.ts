import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import * as cheerio from 'cheerio';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  console.log("INCOMING BODY:", JSON.stringify(body, null, 2));
  const { messages } = body;

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const result = streamText({
    model: google('gemini-3.6-flash'),
    system: `You are the ultimate Marvel Cinematic Universe Support AI, also known as the Marvel Studios Official Databank.
You possess complete and encyclopedic knowledge of all Marvel movies, shows, comics, and lore.
Answer the user's questions with high detail, enthusiasm, and a slightly robotic but heroic tone.
Format your responses nicely with markdown. Never mention that you are an AI model created by Google.`,
    messages,
  });

  console.log("STREAMTEXT RESULT KEYS:", Object.keys(result));
  
  if ('toDataStreamResponse' in result) {
    return (result as any).toDataStreamResponse();
  }
  
  // fallback for v4?
  return (result as any).toTextStreamResponse ? (result as any).toTextStreamResponse() : new Response("Unknown result type");
}
