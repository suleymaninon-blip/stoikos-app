import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'stoikos_streak';
const STREAK_LAST_DATE_KEY = 'stoikos_streak_last_date';
const COMPLETED_KEY = 'stoikos_completed_';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);

  const loadStreak = useCallback(async () => {
    try {
      const today = new Date();
      const todayStr = today.toDateString();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      const todayRaw = await AsyncStorage.getItem(COMPLETED_KEY + todayStr);
      const todayDone: string[] = todayRaw ? JSON.parse(todayRaw) : [];
      const completedToday = todayDone.length > 0;

      const storedStreak = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || '0');
      const lastDate = await AsyncStorage.getItem(STREAK_LAST_DATE_KEY);

      let newStreak = storedStreak;

      if (completedToday && lastDate !== todayStr) {
        if (lastDate === yesterdayStr || lastDate === null) {
          newStreak = storedStreak + 1;
        } else {
          newStreak = 1;
        }
        await AsyncStorage.setItem(STREAK_KEY, newStreak.toString());
        await AsyncStorage.setItem(STREAK_LAST_DATE_KEY, todayStr);
      } else if (lastDate && lastDate !== todayStr && lastDate !== yesterdayStr) {
        const lastDateObj = new Date(lastDate);
        const diffDays = Math.floor((today.getTime() - lastDateObj.getTime()) / 86400000);
        if (diffDays > 1) {
          newStreak = 0;
          await AsyncStorage.setItem(STREAK_KEY, '0');
        }
      }

      setStreak(newStreak);

      const days = await Promise.all(
        Array.from({ length: 7 }, async (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const raw = await AsyncStorage.getItem(COMPLETED_KEY + d.toDateString());
          const done: string[] = raw ? JSON.parse(raw) : [];
          return done.length > 0;
        })
      );
      setWeekDays(days);
    } catch (e) {
      console.error('Streak error:', e);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, []);

  return { streak, weekDays, refresh: loadStreak };
}
