import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL, getUserId } from './api';

/**
 * STOIKOS PLUS — tek yetki kaynağı.
 *
 * Ücretsiz kalan: alıntılar, kavramlar, filozoflar, nefes orbu, günlük pratik,
 * ilerleme. Bunlar hem indirme sebebi hem mağaza puanı motoru; kapatılmıyor.
 *
 * Plus: koç, programlar, kavramların sesli anlatımı ve sonradan eklenen içerik.
 * Yani metalaşmış olan bedava, üretilmiş olan paralı.
 *
 * 14 günlük deneme burada SAYILMIYOR — mağazanın introductory offer'ı veriyor,
 * makbuza bağlı, uygulama silinip kurulunca sıfırlanmıyor. Deneme sürerken
 * RevenueCat kullanıcıyı zaten "abone" döner, o yüzden ayrı bir durum yok.
 *
 * ⚠️ Sınırın sertliği içeriğe göre değişir, bunu bilerek kabul ediyoruz:
 * koç sunucuda korunuyor (asıl kapı orada), programlar ve ses ise uygulamayla
 * birlikte gelen yerel içerik — istemci tarafındaki kilit bir hız kesici,
 * kırılmaz bir duvar değil. Paketten çıkarmayı bilen zaten çıkarır; bunun için
 * ürünü bozmaya değmez.
 */

const CACHE_KEY = 'stoikos_plus_cached';

export interface Entitlement {
  /** Plus içeriği açık mı (abonelik veya süren deneme). */
  plus: boolean;
  /** İlk kontrol sürüyor — kilidi göstermeden önce beklemek için. */
  loading: boolean;
  refresh: () => void;
}

const Ctx = createContext<Entitlement>({ plus: false, loading: true, refresh: () => {} });

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const [plus, setPlus] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    // Son bilinen değeri hemen uygula: ağ yoksa abone erişimini kaybetmesin.
    // Abone olmayanın önbelleği zaten false olduğu için bu bir açık kapı değil.
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached != null) setPlus(cached === '1');
    } catch {}

    try {
      const userId = await getUserId();
      const res = await fetch(`${BACKEND_URL}/entitlement?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const { plus: p } = (await res.json()) as { plus: boolean };
        setPlus(!!p);
        AsyncStorage.setItem(CACHE_KEY, p ? '1' : '0').catch(() => {});
      }
    } catch {
      // Ağ hatası: önbellekteki değerle devam et.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { check(); }, [check]);

  return <Ctx.Provider value={{ plus, loading, refresh: check }}>{children}</Ctx.Provider>;
}

/** Plus durumunu okur. Kilitli bir şeye dokunulduğunda Paywall açılmalı. */
export function usePlus(): Entitlement {
  return useContext(Ctx);
}
