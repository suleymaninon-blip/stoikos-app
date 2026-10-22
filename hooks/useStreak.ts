import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { maybeAskForReview } from '../constants/review';

const COMPLETED_KEY = 'stoikos_completed_';
// Geriye en fazla bu kadar gün bakılır (bir yıl + pay).
const MAX_LOOKBACK = 400;

async function doneOn(d: Date): Promise<boolean> {
  const raw = await AsyncStorage.getItem(COMPLETED_KEY + d.toDateString());
  const done: string[] = raw ? JSON.parse(raw) : [];
  return done.length > 0;
}

/**
 * Süreklilik, günlük kayıtlardan (`stoikos_completed_<tarih>`) sayılır.
 *
 * 22 Ekim 2026'ya kadar ayrı bir sayaç (`stoikos_streak`) tutuluyordu ve yalnız
 * Ana ekran açıldığında artıyordu. Biri o gün egzersiz yapıp Ana ekrana hiç
 * dönmezse gün sayaca işlenmiyor, ertesi gün seri 1'e düşüyordu — oysa alttaki
 * noktalar (kayıtlardan) o günü dolu gösteriyordu. Artık ikisi aynı kaynaktan.
 *
 * Bugün henüz bir şey yapılmadıysa seri dünden itibaren sayılır: gün bitmeden
 * seriyi sıfır göstermek, sabah açan herkesi cezalandırmak olurdu.
 */
export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);

  const loadStreak = useCallback(async () => {
    try {
      const days = await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return doneOn(d);
        })
      );
      setWeekDays(days);

      const cursor = new Date();
      if (!days[6]) cursor.setDate(cursor.getDate() - 1);
      let n = 0;
      while (n < MAX_LOOKBACK && (await doneOn(cursor))) {
        n++;
        cursor.setDate(cursor.getDate() - 1);
      }
      setStreak(n);

      // Yedi gün üst üste: alışkanlık kurulmuş, uygulamadan fayda görülüyor.
      // Değerlendirme istemi için hak edilmiş an. (İstem yalnızca bir kez
      // sorulur; kontrol maybeAskForReview içinde.)
      if (n >= 7) maybeAskForReview('streak7');
    } catch (e) {
      console.error('Streak error:', e);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, []);

  return { streak, weekDays, refresh: loadStreak };
}
