import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stoikos_moods';

// 5 seviyeli ruh hali (1 = en zor, 5 = en huzurlu)
export const MOODS: { id: number; emoji: string; color: string }[] = [
  { id: 1, emoji: '😣', color: '#c0584f' },
  { id: 2, emoji: '😕', color: '#cf8a4a' },
  { id: 3, emoji: '😐', color: '#8a7e68' },
  { id: 4, emoji: '🙂', color: '#6a9a78' },
  { id: 5, emoji: '😌', color: '#c4a96a' },
];

export function moodOf(id: number) {
  return MOODS.find((m) => m.id === id);
}

export async function getMoods(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function setMood(dateStr: string, id: number): Promise<Record<string, number>> {
  const m = await getMoods();
  m[dateStr] = id;
  await AsyncStorage.setItem(KEY, JSON.stringify(m));
  return m;
}
