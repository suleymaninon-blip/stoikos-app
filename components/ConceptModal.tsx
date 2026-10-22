import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';
import { Concept, conceptAudioKey } from '../constants/content';
import { hasAudio, playAudio, stopAudio } from '../constants/audio';
import { usePlus } from '../constants/entitlement';
import { ENFORCE_PLUS_GATE } from '../constants/config';
import { Paywall } from './Paywall';
import { SoundIcon, StopIcon } from './Icons';

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
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Text style={styles.icon}>{concept.icon + TEXT_GLYPH}</Text>
            <Text style={styles.latin}>{concept.latin}</Text>
            <Text style={styles.name}>{concept.name}</Text>
            {audio && (
              <TouchableOpacity onPress={toggle} style={[styles.listenBtn, playing && styles.listenBtnActive]}>
                <View style={styles.listenIcon}>
                  {playing ? <StopIcon size={14} color={Colors.sand} /> : <SoundIcon size={14} color={Colors.sand} />}
                </View>
              </TouchableOpacity>
            )}
            <View style={styles.divider} />
            <Text style={styles.desc}>{concept.desc}</Text>
            {concept.example ? (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>{t('wisdom.exampleLabel')}</Text>
                <Text style={styles.example}>{concept.example}</Text>
              </View>
            ) : null}
            {concept.practice ? (
              <View style={styles.practiceBox}>
                <Text style={styles.practiceLabel}>{t('wisdom.practiceLabel')}</Text>
                <Text style={styles.practice}>{concept.practice}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.closeBtn} onPress={close}>
              <Text style={styles.closeText}>{t('wisdom.close')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    backgroundColor: Colors.stone2, borderRadius: 24, padding: 28, width: '100%', maxHeight: '85%',
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)',
  },
  icon: { fontSize: 32, color: Colors.sand2, marginBottom: 12, textAlign: 'center' },
  latin: { fontFamily: Fonts.cormorantItalic, fontSize: 28, color: Colors.sand2, textAlign: 'center', marginBottom: 4 },
  name: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, textAlign: 'center', letterSpacing: 0.5, marginBottom: 16 },
  listenBtn: { alignSelf: 'center', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(196,169,106,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)', marginTop: 4, marginBottom: 12 },
  listenBtnActive: { backgroundColor: 'rgba(220,80,80,0.15)', borderColor: 'rgba(220,80,80,0.35)' },
  listenIcon: { width: 14, height: 14 },
  divider: { height: 1, backgroundColor: 'rgba(196,169,106,0.15)', marginBottom: 16 },
  desc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 26, marginBottom: 16 },
  exampleBox: {
    backgroundColor: 'rgba(196,169,106,0.08)', borderRadius: 12, padding: 14,
    borderLeftWidth: 2, borderLeftColor: Colors.sand, marginBottom: 20,
  },
  exampleLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand, marginBottom: 6 },
  example: { fontFamily: Fonts.cormorantItalic, fontSize: 18, color: Colors.sand3, lineHeight: 26 },
  practiceBox: {
    backgroundColor: 'rgba(159,176,196,0.08)', borderRadius: 12, padding: 14,
    borderLeftWidth: 2, borderLeftColor: Colors.moon, marginBottom: 20,
  },
  practiceLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.moon, marginBottom: 6 },
  practice: { fontFamily: Fonts.cormorantItalic, fontSize: 18, color: Colors.text, lineHeight: 26 },
  closeBtn: {
    backgroundColor: Colors.stone3, borderRadius: 12, minHeight: 48,
    paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  closeText: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.text2, letterSpacing: 1 },
});
