import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';

// Basılınca hafifçe içe göçen düğme/kart (Ana ekran + Koç, 19 Kasım 2026).
// `flex` dıştaki Pressable'a da verilir: yoksa yan yana kartlar genişliği paylaşmaz, içeriği kadar daralır.
// "Hareketi Azalt"ta basılma ölçeği yok.
export function CalmPressable({
  children, onPress, style, disabled, pressScale = 0.975,
  accessibilityLabel, accessibilityHint, accessibilityState, accessibilityRole = 'button',
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  pressScale?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { expanded?: boolean; disabled?: boolean; checked?: boolean };
  accessibilityRole?: 'button' | 'switch';
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduce = useReduceMotion();
  const flex = StyleSheet.flatten(style)?.flex;

  const animateTo = (toValue: number) => {
    if (reduce) return;
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 28, bounciness: 4 }).start();
  };

  return (
    <Pressable
      style={flex != null ? { flex } : undefined}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => { if (!disabled) animateTo(pressScale); }}
      onPressOut={() => animateTo(1)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={disabled ? { ...accessibilityState, disabled: true } : accessibilityState}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
