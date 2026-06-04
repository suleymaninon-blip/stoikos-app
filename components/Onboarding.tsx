import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity,
  useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../constants/theme';
import { useLang, LANGUAGES } from '../constants/i18n';

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, lang, setLang } = useLang();
  const { width } = useWindowDimensions();
  const ref = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const slides = [
    { key: 'welcome' as const },
    { key: 'p1' as const, icon: '☀', title: t('onb.p1t'), desc: t('onb.p1d') },
    { key: 'p2' as const, icon: '◎', title: t('onb.p2t'), desc: t('onb.p2d') },
    { key: 'p3' as const, icon: '◈', title: t('onb.p3t'), desc: t('onb.p3d') },
  ];
  const last = slides.length - 1;

  const go = (i: number) => { ref.current?.scrollTo({ x: i * width, animated: true }); setPage(i); };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(194,168,120,0.10)', 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      {/* Geç */}
      {page < last && (
        <TouchableOpacity style={styles.skip} onPress={onDone} hitSlop={12}>
          <Text style={styles.skipText}>{t('onb.skip')}</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        style={{ flex: 1 }}
      >
        {slides.map((s) => (
          <View key={s.key} style={[styles.slide, { width }]}>
            {s.key === 'welcome' ? (
              <>
                <Text style={styles.omega}>Ω</Text>
                <Text style={styles.brand}>STOIKOS</Text>
                <Text style={styles.tagline}>{t('setup.tagline')}</Text>
                <Text style={styles.intro}>{t('onb.intro')}</Text>

                <Text style={styles.langPrompt}>{t('onb.langPrompt')}</Text>
                <View style={styles.langGrid}>
                  {LANGUAGES.map((l) => {
                    const active = lang === l.code;
                    return (
                      <TouchableOpacity
                        key={l.code}
                        style={[styles.langChip, active && styles.langChipActive]}
                        onPress={() => setLang(l.code)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.langFlag}>{l.flag}</Text>
                        <Text style={[styles.langLabel, active && styles.langLabelActive]}>{l.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>{s.icon}</Text>
                </View>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.desc}>{s.desc}</Text>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Noktalar */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      {/* Buton */}
      <Pressable
        style={styles.btn}
        onPress={() => (page < last ? go(page + 1) : onDone())}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>{page < last ? t('onb.next') : t('onb.begin')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.bg, zIndex: 50 },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 360 },
  skip: { position: 'absolute', top: 56, right: 24, zIndex: 5, paddingHorizontal: 8, paddingVertical: 6 },
  skipText: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.5 },

  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, paddingBottom: 40 },

  omega: { fontFamily: Fonts.cinzel, fontSize: 64, color: Colors.sand, marginBottom: 6 },
  brand: { fontFamily: Fonts.cinzelBold, fontSize: 26, letterSpacing: 6, color: Colors.text, marginBottom: 12 },
  tagline: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.sand, textTransform: 'uppercase', marginBottom: 18 },
  intro: { fontFamily: Fonts.cormorantItalic, fontSize: 22, color: Colors.text2, textAlign: 'center', lineHeight: 30, marginBottom: 36 },

  langPrompt: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 2, color: Colors.muted, textTransform: 'uppercase', marginBottom: 14 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: Colors.stone2, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  langChipActive: { backgroundColor: 'rgba(194,168,120,0.16)', borderColor: Colors.sand },
  langFlag: { fontSize: 15 },
  langLabel: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.muted },
  langLabelActive: { color: Colors.sand2 },

  iconWrap: {
    width: 92, height: 92, borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(194,168,120,0.10)', borderWidth: 1, borderColor: 'rgba(194,168,120,0.2)',
    marginBottom: 28,
  },
  icon: { fontSize: 38, color: Colors.sand2 },
  title: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, letterSpacing: 0.5, marginBottom: 14, textAlign: 'center' },
  desc: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2, textAlign: 'center', lineHeight: 24 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(194,168,120,0.25)' },
  dotActive: { backgroundColor: Colors.sand, width: 20 },

  btn: {
    marginHorizontal: 36, marginBottom: 44, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', backgroundColor: 'rgba(194,168,120,0.16)',
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.35)',
  },
  btnText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1.5, color: Colors.sand2 },
});
