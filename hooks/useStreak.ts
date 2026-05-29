import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'stoikos_streak';
const LAST_OPEN_KEY = 'stoikos_last_open';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);

  useEffect(() => {
    loadStreak();
  }, []);

  async function loadStreak() {
    try {
      const today = new Date().toDateString();
      const lastOpen = await AsyncStorage.getItem(LAST_OPEN_KEY);
      const storedStreak = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || '0');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = storedStreak;

      if (lastOpen === today) {
        // Already opened today, keep streak
        newStreak = storedStreak;
      } else if (lastOpen === yesterday.toDateString()) {
        // Opened yesterday, increment
        newStreak = storedStreak + 1;
      } else if (lastOpen === null) {
        // First time
        newStreak = 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      await AsyncStorage.setItem(STREAK_KEY, newStreak.toString());
      await AsyncStorage.setItem(LAST_OPEN_KEY, today);
      setStreak(newStreak);

      // Build week display (last 7 days)
      const days = Array(7).fill(false);
      for (let i = 0; i < Math.min(newStreak, 7); i++) {
        days[6 - i] = true;
      }
      setWeekDays(days);
    } catch (e) {
      console.error('Streak error:', e);
    }
  }

  return { streak, weekDays };
}
