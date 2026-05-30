import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stoikos_favorites';

export async function getFavorites(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const cur = new Set(await getFavorites());
  if (cur.has(id)) cur.delete(id);
  else cur.add(id);
  const arr = [...cur];
  await AsyncStorage.setItem(KEY, JSON.stringify(arr));
  return arr;
}
