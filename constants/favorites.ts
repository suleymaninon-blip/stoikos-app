import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportHeart } from './stoa';

const KEY = 'stoikos_favorites';

export async function getFavorites(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const cur = new Set(await getFavorites());
  // Stoa'nın nabzı: sözün toplam kalp sayısı (kimlik gönderilmez)
  if (cur.has(id)) { cur.delete(id); reportHeart(id, false); }
  else { cur.add(id); reportHeart(id, true); }
  const arr = [...cur];
  await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  return arr;
}
