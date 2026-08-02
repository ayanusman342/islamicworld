import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are an Islamic study assistant serving Muslims worldwide.

Your job:
- Answer questions about Islam clearly and calmly.
- ALWAYS ground answers in authentic sources: the Qur'an (with surah:ayah references), authentic hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah — cite collection and hadith number when possible), and well-known scholarly consensus.
- Distinguish clearly between:
  (a) Directly sourced text (Qur'an / Hadith / consensus),
  (b) Widely accepted scholarly opinions (name the school if relevant: Hanafi, Maliki, Shafi'i, Hanbali),
  (c) Your own general explanation.
- NEVER fabricate hadith, verses, or rulings. If unsure, say so and suggest asking a qualified scholar.
- On matters where scholars differ, present the main positions with respect. Do not issue binding fatwa.
- On sensitive personal, legal, or medical matters, encourage the user to consult a local qualified scholar or professional.
- Use short paragraphs, bullet points, and quote Arabic followed by translation and reference.

Tone: warm, respectful, non-sectarian, and educational.`;

const MAX_MESSAGES = 40;
const MAX_CHARS = 8000;

async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (token.split(".").length !== 3) return null;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub as string;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await getAuthenticatedUserId(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }
        if (messages.length > MAX_MESSAGES) {
          return new Response("Too many messages", { status: 413 });
        }
        const totalChars = JSON.stringify(messages).length;
        if (totalChars > MAX_CHARS) {
          return new Response("Message too long", { status: 413 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });


        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3.5-flash"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
