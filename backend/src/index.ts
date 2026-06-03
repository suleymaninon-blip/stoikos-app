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
  DB: D1Database;
  ADMIN_KEY: string;
}

const MODEL = 'claude-sonnet-4-6';
const API = 'https://api.anthropic.com/v1/messages';

const LANG_NAME: Record<string, string> = {
  tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'Русский (Russian)', fr: 'Français (French)', es: 'Español (Spanish)',
};

function buildSystemPrompt(lang: string, memory: string): string {
  const langName = LANG_NAME[lang] || 'English';
  const memoryBlock = memory.trim()
    ? `\n\n## KULLANICI HAKKINDA BİLDİKLERİN\n(Geçmiş konuşmalardan; uygun olduğunda doğal biçimde başvur, ama her mesajda zorlama):\n${memory.trim()}`
    : '';
  return `Sen STOIKOS uygulamasının Stoacı koçusun. Görevin, kullanıcının günlük hayat zorluklarıyla baş etmesine Stoacı felsefenin pratik bilgeliğiyle yardım etmek. Bir terapist ya da alıntı makinesi değilsin — sakin, bilge ve sıcak bir yol arkadaşısın.

## TEMEL TARZIN: ANLAYIŞLA YANIT VER
- Kullanıcı bir şey paylaştığında, VARSAYILAN davranışın yardımcı bir karşılık vermektir — bir Stoacı bakış açısı, bir çerçeve, somut bir düşünce. Soru sormak değil.
- Çoğu yanıtın soru İÇERMESİN. Doğrudan, sıcak ve işe yarar ol.
- Soru sormak istisnadır, kural değil. Yalnızca şu durumlarda TEK bir kısa soru sor: (a) ne demek istediği gerçekten belirsizse ve cevap vermek için netlik şartsa, ya da (b) kullanıcı kendisi açılmak/konuşmak istiyor gibiyse.
- Soru sorduğunda bile, önce bir değer ver (bir görüş, bir çerçeve), SONRA istersen tek bir soru ekle. Boş boş soruyla geçiştirme.
- Asla art arda soru sorma. Asla topu sürekli kullanıcıya atma ("peki sen ne düşünüyorsun?" gibi). O senden bilgelik bekliyor, sorgu değil.

## YANIT UZUNLUĞU: DURUMA GÖRE
- Basit soru/selamlama → kısa, sıcak (2-3 cümle).
- Gerçek bir dert → daha derin git ama bunaltma. Bir-iki kısa paragraf yeter.
- Gereksiz doldurma cümlesi kurma. Her cümle bir işe yarasın.

## ALINTI KULLANIMI: SADECE GERÇEKTEN UYDUĞUNDA
- Her yanıta alıntı sıkıştırma. Çoğu yanıtta alıntı OLMASIN.
- Yalnızca bir Stoacı söz söylediğin şeyi gerçekten güçlendiriyorsa kullan.
- Kullanacaksan ayrı satırda > ile ver:
> "Söz buraya." — Yazar, Kaynak
- Bir yanıtta en fazla bir alıntı.

## STOACI ÖZ
- Kontrol ikilemi: neyin elimizde olduğunu, neyin olmadığını ayırmak.
- Olaylar değil, yargılarımız bizi üzer. Tepkiyle uyaran arasına boşluk koymak.
- Erdem (bilgelik, cesaret, adalet, ölçülülük) tek gerçek iyiliktir; dış şeyler tercih edilir ama mutluluğun şartı değildir.
- Amor fati: olanı kabul edip onunla çalışmak. Memento mori: sınırlı zamanın farkında, panikte değil uyanık yaşamak.
- Şu ana dönmek; tek gerçek bu andır.

## SINIRLARIN (çok önemli)
- Sen terapist ya da doktor değilsin. Kullanıcıda ciddi ruhsal kriz, kendine zarar verme ya da derin depresyon işareti görürsen: Stoacı tavsiyeye girme. Şefkatle uzman desteği gerektiğini söyle, bir profesyonele ya da güvendiği birine başvurmasını nazikçe öner. Felsefeyle geçiştirme.
- Tıbbi, hukuki, finansal somut tavsiye verme.
- Stoacılığı "her derde deva" gibi satma. Bazen en bilgece şey "bu zor ve zaman alacak" demektir.

## TON
Sakin, sıcak, sade. Ukala ya da didaktik değil. Seni gerçekten dert eden olgun bir dostun tonu. Doğal ve akıcı konuş.

## DİL (çok önemli)
Kullanıcıya şu dilde yanıt ver: ${langName}. Tüm yanıtın baştan sona o dilde olsun — alıntıyı da o dile çevir.${memoryBlock}`;
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

// ─── Meydan Okuma: söz moderasyonu (Claude) ───────────────
async function moderateQuote(env: Env, text: string): Promise<{ ok: boolean; reason: string }> {
  try {
    const data = await callClaude(env, {
      model: MODEL,
      max_tokens: 150,
      system: `You moderate user-submitted aphorisms for a Stoic philosophy app. Decide if the text is BOTH:
(1) appropriate — no hate, harassment, profanity, sexual content, ads/spam, links, personal data, or political propaganda; and
(2) in the spirit of Stoic wisdom — a reflective maxim about virtue, self-control, acceptance, mortality, reason, resilience (not random nonsense, not a question, not a quote clearly copied from a famous author).
Respond ONLY with JSON: {"ok": true|false, "reason": "<short reason in Turkish>"}. ok=true only if BOTH conditions hold.`,
      messages: [{ role: 'user', content: text }],
    });
    const raw = data.content?.[0]?.text ?? '';
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const j = JSON.parse(m[0]);
      return { ok: !!j.ok, reason: String(j.reason || '') };
    }
  } catch (e) {}
  return { ok: false, reason: 'Değerlendirilemedi, lütfen tekrar dene.' };
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    const path = url.pathname;

    // ════════ MEYDAN OKUMA ════════
    // Söz gönder
    if (req.method === 'POST' && path === '/challenge/submit') {
      const { userId, text, lang = 'tr', author } = await req.json<any>().catch(() => ({}));
      const t = (text || '').trim();
      if (!userId || t.length < 8 || t.length > 220) {
        return json({ error: 'bad_request', reason: 'Söz 8-220 karakter olmalı.' }, 400);
      }
      // basit hız limiti: son 1 saatte en çok 5 gönderim
      const since = Date.now() - 3600_000;
      const recent = await env.DB.prepare('SELECT COUNT(*) AS c FROM quotes WHERE user_id=? AND created_at>?')
        .bind(userId, since).first<{ c: number }>();
      if ((recent?.c ?? 0) >= 5) return json({ error: 'rate_limited', reason: 'Bir saatte en fazla 5 söz gönderebilirsin.' }, 429);

      const mod = await moderateQuote(env, t);
      const status = mod.ok ? 'pending' : 'rejected';
      await env.DB.prepare('INSERT INTO quotes (user_id,text,author,lang,status,reason,created_at) VALUES (?,?,?,?,?,?,?)')
        .bind(userId, t, (author || '').toString().slice(0, 40) || null, lang, status, mod.reason || null, Date.now()).run();
      return json(mod.ok
        ? { status: 'pending', message: 'Sözün alındı! Onaylandıktan sonra listede görünecek.' }
        : { status: 'rejected', reason: mod.reason });
    }

    // Onaylı sözleri listele
    if (req.method === 'GET' && path === '/challenge/list') {
      const lang = url.searchParams.get('lang') || 'tr';
      const sort = url.searchParams.get('sort') === 'new' ? 'new' : 'top';
      const userId = url.searchParams.get('userId') || '';
      const order = sort === 'new' ? 'created_at DESC' : 'likes DESC, created_at DESC';
      const rows = await env.DB.prepare(
        `SELECT q.id,q.text,q.author,q.likes,
          EXISTS(SELECT 1 FROM likes l WHERE l.quote_id=q.id AND l.user_id=?) AS liked
         FROM quotes q WHERE q.status='approved' AND q.lang=? ORDER BY ${order} LIMIT 100`
      ).bind(userId, lang).all();
      const items = (rows.results || []).map((r: any, i: number) => ({
        id: r.id, text: r.text, author: r.author, likes: r.likes, liked: !!r.liked, rank: sort === 'top' ? i + 1 : null,
      }));
      return json({ items });
    }

    // Beğeni aç/kapa
    if (req.method === 'POST' && path === '/challenge/like') {
      const { userId, quoteId } = await req.json<any>().catch(() => ({}));
      if (!userId || !quoteId) return json({ error: 'bad_request' }, 400);
      const existing = await env.DB.prepare('SELECT 1 FROM likes WHERE quote_id=? AND user_id=?').bind(quoteId, userId).first();
      if (existing) {
        await env.DB.batch([
          env.DB.prepare('DELETE FROM likes WHERE quote_id=? AND user_id=?').bind(quoteId, userId),
          env.DB.prepare('UPDATE quotes SET likes=likes-1 WHERE id=? AND likes>0').bind(quoteId),
        ]);
      } else {
        await env.DB.batch([
          env.DB.prepare('INSERT INTO likes (quote_id,user_id) VALUES (?,?)').bind(quoteId, userId),
          env.DB.prepare('UPDATE quotes SET likes=likes+1 WHERE id=?').bind(quoteId),
        ]);
      }
      const row = await env.DB.prepare('SELECT likes FROM quotes WHERE id=?').bind(quoteId).first<{ likes: number }>();
      return json({ liked: !existing, likes: row?.likes ?? 0 });
    }

    // ── Yönetim (ADMIN_KEY ile) ──
    if (path.startsWith('/challenge/admin')) {
      const key = req.headers.get('x-admin-key') || url.searchParams.get('key') || '';
      if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ error: 'unauthorized' }, 401);

      if (req.method === 'GET' && path === '/challenge/admin/pending') {
        const rows = await env.DB.prepare("SELECT id,text,author,lang,created_at FROM quotes WHERE status='pending' ORDER BY created_at ASC LIMIT 100").all();
        return json({ items: rows.results || [] });
      }
      if (req.method === 'POST' && path === '/challenge/admin/moderate') {
        const { quoteId, action } = await req.json<any>().catch(() => ({}));
        const status = action === 'approve' ? 'approved' : 'rejected';
        await env.DB.prepare('UPDATE quotes SET status=? WHERE id=?').bind(status, quoteId).run();
        return json({ ok: true, status });
      }
    }


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
        const data = await callClaude(env, { model: MODEL, max_tokens: 700, system, messages });
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
