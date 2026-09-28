import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';

const { width, height } = Dimensions.get('window');

/** Işığın dikey merkezi (ekran yüksekliğinin oranı). Logo grubu ortalı ama
 *  Ω merkezin biraz üstünde — en parlak nokta Ω ile STOIKOS arasına düşsün. */
const GLOW_CENTER_Y = 0.46;

export function BrandIntro({ onFinish }: { onFinish: () => void }) {
  const { t } = useLang();

  const glow = useRef(new Animated.Value(0)).current;
  const omegaOpacity = useRef(new Animated.Value(0)).current;
  const omegaScale = useRef(new Animated.Value(0.82)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameUp = useRef(new Animated.Value(14)).current;
  const lineW = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Ω + ışıltı belirir
      Animated.parallel([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(omegaOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(omegaScale, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // STOIKOS yazısı yükselerek belirir
      Animated.parallel([
        Animated.timing(nameOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(nameUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // ince çizgi + alt başlık
      Animated.parallel([
        Animated.timing(lineW, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // bekle
      Animated.delay(650),
      // tüm ekran yumuşakça kaybolur
      Animated.timing(screenFade, { toValue: 0, duration: 550, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenFade }]} pointerEvents="none">
      {/* Logonun ARKASINDA sıcak ışıltı — radyal.
          Önceden bir dairenin içine konmuş DOĞRUSAL gradyandı (y 0.5 → 1):
          dairenin üst yarısı tam parlak kalıyor, sönme ortadan aşağı
          başlıyordu. Sonuç logonun üstünde düz bir ışık kubbesiydi, Ω ise
          sönmenin başladığı karanlık bölgeye düşüyordu.
          userSpaceOnUse: ekran kare olmadığı için yüzde yarıçap elipse
          dönerdi; piksel cinsinden yarıçap daireyi korur. */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glow }]} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient
              id="introGlow"
              cx={width / 2}
              cy={height * GLOW_CENTER_Y}
              r={width * 0.78}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#d4924a" stopOpacity="0.26" />
              <Stop offset="0.42" stopColor="#c4a96a" stopOpacity="0.09" />
              <Stop offset="1" stopColor="#c4a96a" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height={height} fill="url(#introGlow)" />
        </Svg>
      </Animated.View>

      {/* (Arkadaki 240px'lik soluk Ω kaldırıldı: %5 opaklıkta ne net filigran
          ne görünmezdi, ayakları ince çizginin iki ucunda dışarı taşıyordu.
          Ekranda iki Ω vardı; küçük altın Ω tek başına yeterince güçlü.) */}

      {/* ana Ω */}
      <Animated.Text style={[styles.omega, { opacity: omegaOpacity, transform: [{ scale: omegaScale }] }]}>Ω</Animated.Text>

      {/* STOIKOS */}
      <Animated.Text style={[styles.name, { opacity: nameOpacity, transform: [{ translateY: nameUp }] }]}>
        STOIKOS
      </Animated.Text>

      {/* ince çizgi */}
      <View style={styles.lineRow}>
        <Animated.View style={[styles.line, { width: lineW.interpolate({ inputRange: [0, 1], outputRange: [0, 70] }) }]} />
        <Animated.Text style={[styles.star, { opacity: taglineOpacity }]}>✦</Animated.Text>
        <Animated.View style={[styles.line, { width: lineW.interpolate({ inputRange: [0, 1], outputRange: [0, 70] }) }]} />
      </View>

      {/* alt başlık */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>{t('setup.tagline')}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.stone,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  omega: { fontFamily: Fonts.cinzelBold, fontSize: 76, color: Colors.sand2, lineHeight: 84, marginBottom: 6 },
  name: { fontFamily: Fonts.cinzelBold, fontSize: 34, letterSpacing: 8, color: Colors.sand3, marginTop: -4 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, marginBottom: 14 },
  line: { height: 1, backgroundColor: 'rgba(196,169,106,0.4)' },
  star: { fontSize: 10, color: Colors.sand },
  tagline: { fontFamily: Fonts.jostLight, fontSize: 12, letterSpacing: 3, color: Colors.muted },
});
