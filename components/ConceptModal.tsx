import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang } from '../constants/i18n';
import { Concept, conceptAudioKey } from '../constants/content';
import { hasAudio, playAudio, stopAudio } from '../constants/audio';
import { usePlus } from '../constants/entitlement';
import { ENFORCE_PLUS_GATE } from '../constants/config';
import { Paywall } from './Paywall';
import { SoundIcon, StopIcon, SunIcon } from './Icons';
import { ConceptGlyph } from './ConceptGlyph';
import { EmbossTile, PAPER } from './EmbossTile';


// Kavram simgeleri (☉ ◉ ⚖ …) renk verilmezse siyah çiziliyor, iOS ⚖'yi renkli emojiye
// çeviriyor. U+FE0E metin biçimini zorlar → paletin rengini alır.
export const TEXT_GLYPH = '︎';

/**
 * Kavramın tam metni: sesli anlatım, örnek, pratik bağ. Bilgelik → Kavramlar ve
 * Pratik → Günün Kavramı ("Devamını oku") aynı pencereyi kullanır (22 Ekim 2026'ya
 * kadar Pratik tam metni sayfanın içinde gösteriyordu, ekran ~4 boy uzuyordu).
 *
 * Sesli anlatım Plus'a dahil; kavram metninin kendisi ücretsiz — kilitlenen
 * yalnızca dinleme. Ses ve ödeme duvarı bu bileşenin içinde yönetiliyor.
 */
export function ConceptModal({ concept, onClose }: { concept: Concept | null; onClose: () => void }) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const { plus } = usePlus();
  // ⚠️ ENFORCE_PLUS_GATE geçici olarak false (bkz. constants/config.ts).
  const plusOk = plus || !ENFORCE_PLUS_GATE;
  const [playing, setPlaying] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Pencere kapanınca / başka kavrama geçince / dil değişince sesi durdur
  useEffect(() => { stopAudio(); setPlaying(false); }, [concept?.latin, lang]);
  useEffect(() => () => { stopAudio(); }, []);

  if (!concept) return null;
  const key = conceptAudioKey(concept.latin, lang);
  const audio = hasAudio(key);

  function toggle() {
    if (!plusOk) { setPaywallOpen(true); return; }
    if (playing) { stopAudio(); setPlaying(false); }
    else { setPlaying(true); playAudio(key, () => setPlaying(false)); }
  }
  const close = () => { stopAudio(); setPlaying(false); onClose(); };

  return (
    <Modal transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Kâğıt dokusu: açık temada belirgin, koyuda çok soluk (kirli görünmesin). */}
          <ImageBackground source={PAPER} resizeMode="repeat" style={StyleSheet.absoluteFill} imageStyle={{ opacity: Colors.isDark ? 0.18 : 1 }} />
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scroll}>
            <EmbossTile>
              {/* gravür çizimi; altında açık (koyu temada koyu) bir kopya → kâğıda basılmış */}
              <ConceptGlyph
                latin={concept.latin} fallback={concept.icon} size={62} color={Colors.sand}
                press={Colors.isDark ? '#000000' : '#ffffff'} pressOpacity={Colors.isDark ? 0.55 : 0.95}
              />
            </EmbossTile>
            <Text style={styles.latin}>{concept.latin}</Text>
            <Text style={styles.name}>{concept.name}</Text>
            {audio && (
              <TouchableOpacity onPress={toggle} style={[styles.listenBtn, playing && styles.listenBtnActive]}>
                <View style={styles.listenIcon}>
                  {playing ? <StopIcon size={14} color={Colors.sand} /> : <SoundIcon size={14} color={Colors.sand} />}
                </View>
              </TouchableOpacity>
            )}
            {/* Kenarlara doğru sönen ayırıcı */}
            <LinearGradient
              colors={['transparent', Colors.tint(0.45), 'transparent']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.divider}
            />
            <Text style={styles.desc}>{concept.desc}</Text>
            {concept.example ? (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>{t('wisdom.exampleLabel')}</Text>
                <Text style={styles.example}>{concept.example}</Text>
              </View>
            ) : null}
            {concept.practice ? (
              <View style={styles.practiceBox}>
                <View style={styles.practiceHead}>
                  <SunIcon size={16} color={Colors.moon} />
                  <Text style={styles.practiceLabel}>{t('wisdom.practiceLabel')}</Text>
                </View>
                <Text style={styles.practice}>{concept.practice}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.closeBtn} onPress={close}>
              <Text style={styles.closeText}>{t('wisdom.close')}</Text>
            </TouchableOpacity>
          </ScrollView>
          {/* Kaydırınca da yerinde duran kapatma düğmesi */}
          <TouchableOpacity
            onPress={close}
            style={styles.xBtn}
            accessibilityRole="button"
            accessibilityLabel={t('wisdom.close')}
            hitSlop={6}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path d="M6 6 L18 18 M18 6 L6 18" stroke={Colors.sand2} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </Modal>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    // Açık temada krem "kâğıt" (stone), simge kartı beyaz (stone2) → kabartma öne çıkar.
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, borderRadius: 24, width: '100%', maxHeight: '85%', overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.tint(0.2),
  },
  scroll: { padding: 28, paddingTop: 30 },
  xBtn: {
    position: 'absolute', top: 12, right: 12, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.stone3, borderWidth: 1, borderColor: Colors.overlay(0.07),
  },

  latin: { fontFamily: Fonts.cormorant, fontSize: 40, lineHeight: 46, color: Colors.sand3, textAlign: 'center' },
  name: { fontFamily: Fonts.cormorantItalic, fontSize: 20, lineHeight: 26, color: Colors.text2, textAlign: 'center', marginTop: 2, marginBottom: 14 },
  listenBtn: { alignSelf: 'center', width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.tint(0.12), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.tint(0.25), marginTop: 2, marginBottom: 14 },
  listenBtnActive: { backgroundColor: 'rgba(220,80,80,0.15)', borderColor: 'rgba(220,80,80,0.35)' },
  listenIcon: { width: 14, height: 14 },
  divider: { height: 1, marginBottom: 18 },
  desc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 26, marginBottom: 16 },
  exampleBox: { backgroundColor: Colors.tint(0.07), borderRadius: 14, padding: 14, marginBottom: 14 },
  exampleLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand, marginBottom: 6 },
  example: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 25 },
  practiceBox: {
    backgroundColor: Colors.moonA(0.1), borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.moonA(0.4),
  },
  practiceHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  practiceLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.moon },
  practice: { fontFamily: Fonts.jostMedium, fontSize: 17, color: Colors.text, lineHeight: 26 },
  closeBtn: {
    backgroundColor: Colors.stone3, borderRadius: 12, minHeight: 48,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  closeText: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.text2, letterSpacing: 1 },
});
