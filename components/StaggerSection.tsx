import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';
import { onIntroDone } from '../constants/introSignal';

// Bölümlerin ekrana kademeli, sakin yerleşmesi (Ana ekran + Pratik, 19 Kasım 2026).
// Açılış animasyonunun (BrandIntro) bitmesini bekler; yoksa giriş onun arkasında oynayıp görünmeden biter.
// "Hareketi Azalt"ta bölümler hemen yerinde.
export function StaggerSection({
  delay, children, style, onLayout,
}: {
  delay: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) { opacity.setValue(1); translateY.setValue(0); return; }
    let anim: Animated.CompositeAnimation | null = null;
    const off = onIntroDone(() => {
      anim = Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 550, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]);
      anim.start();
    });
    return () => { off(); anim?.stop(); };
  }, [delay, opacity, translateY, reduce]);

  return (
    <Animated.View onLayout={onLayout} style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
