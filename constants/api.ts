import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang } from './i18n';

// Stoikos backend (Cloudflare Worker)
export const BACKEND_URL = 'https://stoikos-backend.stoikos-app.workers.dev';

const UID_KEY = 'stoikos_user_id';

// Cihaza özel kalıcı kullanıcı kimliği (hafıza bu kimliğe bağlı)
export async function getUserId(): Promise<string> {
  let id = await AsyncStorage.getItem(UID_KEY);
  if (!id) {
    id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
    await AsyncStorage.setItem(UID_KEY, id);
  }
  return id;
}

export interface CoachMsg { role: 'user' | 'assistant'; content: string; }

export interface CoachReply {
  reply: string;
  /** Kalan ücretsiz hak; abone ise null (sınırsız). */
  remaining: number | null;
  subscribed: boolean;
}

export interface CoachQuota {
  subscribed: boolean;
  used: number;
  limit: number;
  /** Abone ise null (sınırsız). */
  remaining: number | null;
}

/**
 * Kalan ücretsiz koç hakkı.
 *
 * Bu YALNIZCA arayüz içindir — asıl kapı sunucuda. Ağ hatasında null döner ve
 * arayüz sayaç göstermez; kullanıcıyı yanlışlıkla kilitlemeyiz, çünkü kotayı
 * zaten backend uyguluyor.
 */
export async function getCoachQuota(): Promise<CoachQuota | null> {
  try {
    const userId = await getUserId();
    const res = await fetch(`${BACKEND_URL}/coach/quota?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return (await res.json()) as CoachQuota;
  } catch {
    return null;
  }
}

// Koça mesaj gönder — backend Claude'a iletir, hafızayı yönetir
export async function sendCoach(lang: Lang, messages: CoachMsg[]): Promise<CoachReply> {
  const userId = await getUserId();
  const res = await fetch(`${BACKEND_URL}/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, lang, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e: any = new Error(err.reason || err.detail || err.error || `backend ${res.status}`);
    // Hız limiti: `scope` ile uygulama kendi dilinde mesaj gösterir.
    // `reason` (Türkçe) yalnız scope gelmezse yedek olarak kullanılır.
    if (res.status === 429) {
      e.rateLimitScope = err.scope as 'minute' | 'day' | undefined;
      if (err.reason) e.userMessage = err.reason;
    }
    // Ücretsiz hak bitti → arayüz ödeme duvarını açar (metin duvarda, balon yok)
    if (res.status === 402) e.quotaExceeded = true;
    throw e;
  }
  const data = await res.json();
  return {
    reply: data.reply as string,
    remaining: data.remaining ?? null,
    subscribed: !!data.subscribed,
  };
}

// Koç hafızasını sıfırla
export async function resetMemory(): Promise<void> {
  const userId = await getUserId();
  await fetch(`${BACKEND_URL}/memory/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}

// Günlük yansımayı koç hafızasına işle (fire-and-forget; başarısızsa sessiz)
export async function addReflectionToMemory(lang: Lang, text: string): Promise<void> {
  try {
    const userId = await getUserId();
    await fetch(`${BACKEND_URL}/memory/note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lang, text }),
    });
  } catch {}
}

// ─── Meydan Okuma ─────────────────────────────────────────
export const ADMIN_KEY_STORAGE = 'stoikos_admin_key';

export interface ChallengeQuote {
  id: number; text: string; author: string | null; likes: number; liked: boolean; rank: number | null;
}

export async function submitQuote(lang: Lang, text: string, author: string): Promise<{ status: string; reason?: string; message?: string }> {
  const userId = await getUserId();
  const res = await fetch(`${BACKEND_URL}/challenge/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, lang, text, author }),
  });
  return res.json();
}

export async function listChallenge(lang: Lang, sort: 'top' | 'new'): Promise<ChallengeQuote[]> {
  const userId = await getUserId();
  const res = await fetch(`${BACKEND_URL}/challenge/list?lang=${lang}&sort=${sort}&userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function likeChallenge(quoteId: number): Promise<{ liked: boolean; likes: number }> {
  const userId = await getUserId();
  const res = await fetch(`${BACKEND_URL}/challenge/like`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, quoteId }),
  });
  return res.json();
}

// Yönetim (sadece sahibi)
export async function adminPending(adminKey: string): Promise<{ id: number; text: string; author: string | null; lang: string }[]> {
  const res = await fetch(`${BACKEND_URL}/challenge/admin/pending`, { headers: { 'x-admin-key': adminKey } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function adminModerate(adminKey: string, quoteId: number, action: 'approve' | 'reject'): Promise<void> {
  await fetch(`${BACKEND_URL}/challenge/admin/moderate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ quoteId, action }),
  });
}
