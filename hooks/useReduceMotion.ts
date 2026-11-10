import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Telefonda "Hareketi Azalt" açık mı (iOS/Android ayarı; web'de prefers-reduced-motion). */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(v); }).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => { alive = false; sub?.remove?.(); };
  }, []);
  return reduce;
}
