import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { useReduceMotion } from '../hooks/useReduceMotion';

/**
 * Tamamlandı işareti: logodaki altın küre belirir, üstüne onay çizilir, bir halka dışa yayılır.
 * Nefes seansının bitiş tebriğiyle aynı dil (o, `BreathOrb` içinde kendi kopyasını çiziyor);
 * günlük yansıma kaydedilince de bu kullanılıyor (14 Kasım 2026). "Hareketi Azalt" açıksa çizim yok.
 */
const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LEN = 56;
let seq = 0;

export function DoneMark({ size = 44 }: { size?: number }) {
  const reduce = useReduceMotion();
  const id = React.useMemo(() => `dm${++seq}`, []);   // web'de gradyan kimlikleri belge genelinde
  const pop = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) { pop.setValue(1); check.setValue(1); return; }
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
    Animated.timing(check, { toValue: 1, delay: 280, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.timing(pulse, { toValue: 1, delay: 160, duration: 1300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [reduce]);

  const ring = size * 0.72;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessible={false}>
      <Animated.View
        style={[styles.pulse, {
          width: ring, height: ring, borderRadius: ring / 2,
          opacity: pulse.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.8] }) }],
        }]}
      />
      <Animated.View style={{ opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }}>
        <Svg width={size} height={size} viewBox="0 0 104 104">
          <Defs>
            <RadialGradient id={`${id}h`} cx="50%" cy="50%" r="50%">
              <Stop offset="0.6" stopColor="#e2b874" stopOpacity="0.45" />
              <Stop offset="1" stopColor="#e2b874" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={`${id}o`} cx="42%" cy="36%" r="70%">
              <Stop offset="0" stopColor="#f8ebc8" />
              <Stop offset="0.45" stopColor="#d2b06c" />
              <Stop offset="1" stopColor="#8a6a34" />
            </RadialGradient>
          </Defs>
          <Circle cx="52" cy="52" r="52" fill={`url(#${id}h)`} />
          <Circle cx="52" cy="52" r="36" fill={`url(#${id}o)`} />
          <AnimatedPath
            d="M36 53 L47.5 64 L68 41"
            fill="none" stroke="#3a2c12" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={CHECK_LEN}
            strokeDashoffset={check.interpolate({ inputRange: [0, 1], outputRange: [CHECK_LEN, 0] })}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: { position: 'absolute', borderWidth: 2, borderColor: '#d4b376' },
});
