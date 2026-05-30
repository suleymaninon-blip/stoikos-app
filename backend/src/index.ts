/**
 * Stoikos Backend — Cloudflare Worker
 *
 * Görevleri:
 *  1) Anthropic API anahtarını GÜVENLE saklar (uygulamada anahtar olmaz)
 *  2) Koç isteklerini Claude'a iletir
 *  3) Her kullanıcının HAFIZASINI sunucuda (KV) tutar — kalıcı, cihaz değişse de kalır
 *  4) (sonra) abonelik doğrulaması eklenecek
 *
 * Uç noktalar:
 *   POST /coach        { userId, lang, messages: [{role, content}] }  -> { reply }
 *   GET  /memory/:id   -> { memory }            (hata ayıklama)
 *   POST /memory/reset { userId }               -> { ok }
 */

export interface Env {
  ANTHROPIC_API_KEY: string;
  MEMORY: KVNamespace;
}

const MODEL = 'claude-sonnet-4-6';
const API = 'https://api.anthropic.com/v1/messages';

const LANG_NAME: Record<string, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'русском языке' };
const LANG_INSTR: Record<string, string> = {
  tr: 'Tüm yanıtlarını Türkçe yaz.',
  en: 'Write all your responses in English.',
  de: 'Schreibe alle deine Antworten auf Deutsch.',
  ru: 'Пиши все свои ответы на русском языке.',
};

function buildSystemPrompt(lang: string, memory: string): string {
  const l = LANG_NAME[lang] ? lang : 'en';
  const memoryBlock = memory.trim()
    ? `\n\nKULLANICI HAKKINDA BİLDİKLERİN (geçmiş konuşmalardan; uygun olduğunda doğal biçimde başvur, ama her mesajda zorlama):\n${memory.trim()}`
    : '';
  return `You are Stoikos — a wisdom guide bringing ancient Stoic philosophy into modern life.

Your task:
- Address the user's problems, worries, or emotions from a Stoic perspective
- Turn the teachings of Marcus Aurelius, Epictetus, and Seneca into practical advice
- End every reply with a fitting Stoic quote
- Keep replies short, focused, and deep — guidance, not a sermon

Reply format:
1. Begin with empathy (1-2 sentences)
2. Offer a Stoic frame (2-3 sentences)
3. Give practical advice (1-2 sentences)
4. Add a quote in EXACTLY this format (keep the literal tag "ALINTI"): [ALINTI: "quote text" — Author, Source]

IMPORTANT: ${LANG_INSTR[l]} Use a warm but strong tone. The literal tag must remain "ALINTI" even though the quote text is in ${LANG_NAME[l]}.${memoryBlock}`;
}

// ─── CORS ─────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}

async function callClaude(env: Env, body: object): Promise<any> {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// Yeni konuşma turundan sonra hafızayı güncelle (durable user facts)
async function updateMemory(env: Env, userId: string, lang: string, lastUser: string, lastAssistant: string, prev: string) {
  try {
    const sys = `You maintain a concise long-term memory about a user of a Stoic coaching app. ` +
      `Given the previous memory and the latest exchange, output an UPDATED memory: a short bullet list ` +
      `of durable facts about the user (their name, goals, recurring struggles, values, important events). ` +
      `Merge new info, drop nothing important, keep it under 150 words. Output ONLY the bullet list, no preamble. Write in ${LANG_NAME[lang] || 'English'}.`;
    const data = await callClaude(env, {
      model: MODEL,
      max_tokens: 400,
      system: sys,
      messages: [{
        role: 'user',
        content: `PREVIOUS MEMORY:\n${prev || '(empty)'}\n\nLATEST EXCHANGE:\nUser: ${lastUser}\nCoach: ${lastAssistant}\n\nUpdated memory:`,
      }],
    });
    const updated = data.content?.[0]?.text?.trim();
    if (updated) await env.MEMORY.put(`mem:${userId}`, updated);
  } catch (e) {
    // hafıza güncellemesi başarısızsa sessiz geç — ana yanıt etkilenmesin
  }
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);

    // Hafıza okuma (debug)
    if (req.method === 'GET' && url.pathname.startsWith('/memory/')) {
      const id = url.pathname.split('/')[2];
      const memory = (await env.MEMORY.get(`mem:${id}`)) || '';
      return json({ memory });
    }

    // Hafıza sıfırlama
    if (req.method === 'POST' && url.pathname === '/memory/reset') {
      const { userId } = await req.json<{ userId?: string }>();
      if (userId) await env.MEMORY.delete(`mem:${userId}`);
      return json({ ok: true });
    }

    // Koç
    if (req.method === 'POST' && url.pathname === '/coach') {
      let payload: { userId?: string; lang?: string; messages?: { role: string; content: string }[] };
      try { payload = await req.json(); } catch { return json({ error: 'invalid json' }, 400); }
      const { userId, lang = 'en', messages } = payload;
      if (!userId || !Array.isArray(messages) || messages.length === 0) {
        return json({ error: 'userId ve messages gerekli' }, 400);
      }

      const memory = (await env.MEMORY.get(`mem:${userId}`)) || '';
      const system = buildSystemPrompt(lang, memory);

      let reply: string;
      try {
        const data = await callClaude(env, { model: MODEL, max_tokens: 1000, system, messages });
        reply = data.content?.[0]?.text ?? '';
      } catch (e: any) {
        return json({ error: 'coach_failed', detail: String(e.message || e) }, 502);
      }

      // Hafızayı arka planda güncelle (yanıtı bekletmeden)
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
      ctx.waitUntil(updateMemory(env, userId, lang, lastUser, reply, memory));

      return json({ reply });
    }

    return json({ error: 'not found' }, 404);
  },
};
