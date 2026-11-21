import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgLinear, Path, Rect, Stop } from 'react-native-svg';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang } from '../constants/i18n';
import { Concept, conceptAudioKey } from '../constants/content';
import { hasAudio, playAudio, stopAudio } from '../constants/audio';
import { usePlus } from '../constants/entitlement';
import { ENFORCE_PLUS_GATE } from '../constants/config';
import { Paywall } from './Paywall';
import { SoundIcon, StopIcon, SunIcon } from './Icons';

// Kâğıt dokusu (scripts/brand/make-paper.py): 160 px döşenen, saydam zeminli hafif benekler.
const PAPER = require('../assets/paper.png');

// Kabartma simge kartı (21 Kasım 2026, kullanıcı: "o hissi alamıyorum" → iki katlı yapıldı):
// dışta kabarık çerçeve (üstü ışık, altı gölge), içte köşeleri oyulmuş, basılmış (çökük) pano
// (iç kenarın üstü gölge, altı ışık). Göz bu "yükselen dış, çöken iç" farkını kabartma okuyor.
const TILE_W = 92, TILE_H = 118, TILE_R = 14, PANEL_IN = 9, NOTCH = 8;
/** Köşeleri içe oyulmuş dikdörtgen (oyuk yarıçapı n). */
function notched(x: number, y: number, w: number, h: number, n: number) {
  const r = x + w, b = y + h;
  return `M${x + n} ${y} H${r - n} A${n} ${n} 0 0 0 ${r} ${y + n} V${b - n} A${n} ${n} 0 0 0 ${r - n} ${b} H${x + n} A${n} ${n} 0 0 0 ${x} ${b - n} V${y + n} A${n} ${n} 0 0 0 ${x + n} ${y} Z`;
}
const PANEL = notched(PANEL_IN, PANEL_IN, TILE_W - PANEL_IN * 2, TILE_H - PANEL_IN * 2, NOTCH);
const PANEL_LINE = notched(PANEL_IN + 4, PANEL_IN + 4, TILE_W - (PANEL_IN + 4) * 2, TILE_H - (PANEL_IN + 4) * 2, NOTCH - 2);

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
            {/* Kabartma simge kartı: gölge + üst kenarda ışık + oyuk köşeli iç çerçeve + doku. */}
            <View style={styles.tile}>
              <ImageBackground source={PAPER} resizeMode="repeat" style={[StyleSheet.absoluteFill, styles.tileClip]} imageStyle={{ opacity: Colors.isDark ? 0.3 : 1 }} />
              <Svg width={TILE_W} height={TILE_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  {/* yüzey: üstü biraz açık, altı biraz koyu */}
                  <SvgLinear id="tileFace" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={Colors.isDark ? '#ffffff' : '#ffffff'} stopOpacity={Colors.isDark ? 0.06 : 0.55} />
                    <Stop offset="1" stopColor={Colors.isDark ? '#000000' : '#8a7a5c'} stopOpacity={Colors.isDark ? 0.18 : 0.1} />
                  </SvgLinear>
                  {/* dış kenar: üstte ışık, altta gölge (kabarık) */}
                  <SvgLinear id="tileBevel" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#ffffff" stopOpacity={Colors.isDark ? 0.22 : 1} />
                    <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
                    <Stop offset="1" stopColor={Colors.isDark ? '#000000' : '#5c4d33'} stopOpacity={Colors.isDark ? 0.5 : 0.28} />
                  </SvgLinear>
                  {/* iç kenar: üstte gölge, altta ışık (basılmış) */}
                  <SvgLinear id="tileDeboss" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={Colors.isDark ? '#000000' : '#5c4d33'} stopOpacity={Colors.isDark ? 0.55 : 0.3} />
                    <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
                    <Stop offset="1" stopColor="#ffffff" stopOpacity={Colors.isDark ? 0.18 : 1} />
                  </SvgLinear>
                </Defs>
                <Rect x={0.75} y={0.75} width={TILE_W - 1.5} height={TILE_H - 1.5} rx={TILE_R} fill="url(#tileFace)" stroke="url(#tileBevel)" strokeWidth={1.5} />
                <Path d={PANEL} fill={Colors.isDark ? 'rgba(0,0,0,0.16)' : 'rgba(92,77,51,0.05)'} stroke="url(#tileDeboss)" strokeWidth={1.6} />
                <Path d={PANEL_LINE} fill="none" stroke={Colors.tint(Colors.isDark ? 0.3 : 0.35)} strokeWidth={0.8} />
              </Svg>
              <Text style={styles.icon}>{concept.icon + TEXT_GLYPH}</Text>
            </View>
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
  // Kabartma simge kartı: dış gölge ikili (yakın + yumuşak) ki kart zeminden kalksın.
  tile: {
    alignSelf: 'center', width: TILE_W, height: TILE_H, borderRadius: TILE_R,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    backgroundColor: Colors.isDark ? Colors.stone3 : Colors.stone2,
    ...Platform.select({
      ios: { shadowColor: Colors.isDark ? '#000' : '#3b3222', shadowOffset: { width: 0, height: 7 }, shadowOpacity: Colors.isDark ? 0.5 : 0.2, shadowRadius: 12 },
      android: { elevation: 6 },
      default: { boxShadow: Colors.isDark ? '0 1px 2px rgba(0,0,0,0.5), 0 8px 18px rgba(0,0,0,0.45)' : '0 1px 2px rgba(59,50,34,0.14), 0 8px 18px rgba(59,50,34,0.18)' } as any,
    }),
  },
  tileClip: { borderRadius: TILE_R, overflow: 'hidden' },
  // Simge kâğıda basılmış gibi: altında ince açık bir kenar.
  icon: {
    fontSize: 40, color: Colors.sand, textAlign: 'center',
    textShadowColor: Colors.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)',
    textShadowOffset: { width: 0, height: Colors.isDark ? -1 : 1 }, textShadowRadius: 0,
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
