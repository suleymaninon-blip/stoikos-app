import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';

/**
 * Ücretsiz koç hakkı bitince açılan ödeme duvarı.
 *
 * `onSubscribe` verilmezse buton "yakında" durumunda gösterilir — RevenueCat
 * henüz bağlanmadığı için şimdilik böyle. Mağazaya çıkınca satın alma akışını
 * bu prop'a bağlamak yeterli, başka değişiklik gerekmez.
 */
export function Paywall({
  visible,
  onClose,
  onSubscribe,
}: {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
}) {
  const { t } = useLang();
  if (!visible) return null;

  const features = [t('paywall.f1'), t('paywall.f2'), t('paywall.f3')];

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.omega}>Ω</Text>
          <Text style={styles.title}>{t('paywall.title')}</Text>
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

          <View style={styles.priceBox}>
            <Text style={styles.price}>{t('paywall.price')}</Text>
            <Text style={styles.frequency}>{t('paywall.frequency')}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.body}>{t('paywall.body')}</Text>

          <View style={styles.features}>
            {features.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureMark}>✦</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={styles.freeNote}>
            <Text style={styles.freeNoteText}>{t('paywall.stillFree')}</Text>
          </View>

          <View style={styles.termsBox}>
            <Text style={styles.termsText}>{t('paywall.termsNote')}</Text>
          </View>

          {onSubscribe ? (
            <TouchableOpacity style={styles.cta} onPress={onSubscribe} activeOpacity={0.85}>
              <Text style={styles.ctaText}>{t('paywall.cta')}</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.cta, styles.ctaDisabled]}>
              <Text style={[styles.ctaText, styles.ctaTextDisabled]}>{t('paywall.soon')}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>{t('paywall.close')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    backgroundColor: Colors.stone2, borderRadius: 24, padding: 28, width: '100%', maxWidth: 420,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.22)',
  },
  omega: { fontFamily: Fonts.cinzel, fontSize: 34, color: Colors.sand, textAlign: 'center', marginBottom: 10 },
  title: { fontFamily: Fonts.cinzel, fontSize: 21, color: Colors.sand2, textAlign: 'center', letterSpacing: 0.8, marginBottom: 6 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, textAlign: 'center', letterSpacing: 0.4, marginBottom: 14 },
  priceBox: { alignItems: 'center', marginBottom: 18 },
  price: { fontFamily: Fonts.cinzel, fontSize: 26, color: Colors.sand2, letterSpacing: 0.5, marginBottom: 4 },
  frequency: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },
  divider: { height: 1, backgroundColor: 'rgba(196,169,106,0.15)', marginVertical: 18 },
  body: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 21, color: Colors.text2, marginBottom: 18 },

  features: { gap: 11, marginBottom: 18 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureMark: { fontSize: 10, color: Colors.sand, marginTop: 4 },
  featureText: { flex: 1, fontFamily: Fonts.jost, fontSize: 13, lineHeight: 20, color: Colors.text },

  freeNote: {
    backgroundColor: 'rgba(196,169,106,0.08)', borderRadius: 12, padding: 13,
    borderLeftWidth: 2, borderLeftColor: Colors.sand, marginBottom: 20,
  },
  freeNoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 13, lineHeight: 20, color: Colors.sand3 },

  termsBox: {
    backgroundColor: 'rgba(196,169,106,0.06)', borderRadius: 10, padding: 11,
    borderLeftWidth: 2, borderLeftColor: Colors.muted, marginBottom: 18,
  },
  termsText: { fontFamily: Fonts.jost, fontSize: 11, lineHeight: 16, color: Colors.muted, letterSpacing: 0.2 },

  cta: {
    backgroundColor: Colors.accent, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 10,
  },
  ctaDisabled: { backgroundColor: Colors.stone3, borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)' },
  ctaText: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.stone, letterSpacing: 1 },
  ctaTextDisabled: { color: Colors.sand2 },

  close: { paddingVertical: 10, alignItems: 'center' },
  closeText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },
});
