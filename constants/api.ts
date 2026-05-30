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

// Koça mesaj gönder — backend Claude'a iletir, hafızayı yönetir
export async function sendCoach(lang: Lang, messages: CoachMsg[]): Promise<string> {
  const userId = await getUserId();
  const res = await fetch(`${BACKEND_URL}/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, lang, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `backend ${res.status}`);
  }
  const data = await res.json();
  return data.reply as string;
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
