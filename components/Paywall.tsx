import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';

export type Plan = 'annual' | 'monthly';

/**
 * Stoikos Plus ödeme duvarı. Koç hakkı bitince, kilitli bir programa ya da
 * sesli anlatıma dokunulduğunda açılır.
 *
 * `onSubscribe` verilmezse buton kasten "YAKINDA" durumunda kalır — RevenueCat
 * bağlanmadan satın alınamayan bir butona "ABONE OL" yazmamak için. Bağlanınca
 * tek yapılacak: seçilen planı alan bir `onSubscribe` geçmek.
 *
 * ⚠️ Fiyatlar şu an i18n'de SABİT yazılı ve bu geçici. Mağaza Türkiye'de TL,
 * Almanya'da EUR tahsil edecek; gösterilen fiyatın tahsil edilenle uyuşmaması
 * hem Apple kılavuzuna aykırı hem kullanıcıyı yanıltır. RevenueCat bağlanınca
 * dört fiyat dizesi de (aylık, yıllık, aylık karşılığı, tasarruf oranı) onun
 * döndürdüğü yerelleştirilmiş değerlerden gelmeli.
 */
export function Paywall({
  visible,
  onClose,
  onSubscribe,
}: {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: (plan: Plan) => void;
}) {
  const { t } = useLang();
  // Yıllık önseçili: kategorinin gelirinin ~%60-68'i yıllık planlardan geliyor
  // ve ücretli edinme yalnızca yıllıkla geri kazanılıyor.
  const [plan, setPlan] = useState<Plan>('annual');
  if (!visible) return null;

  const features = [t('paywall.f1'), t('paywall.f2'), t('paywall.f3'), t('paywall.f4')];

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Text style={styles.omega}>Ω</Text>
            <Text style={styles.title}>{t('paywall.title')}</Text>
            <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

            <View style={styles.plans}>
              <TouchableOpacity
                style={[styles.plan, plan === 'annual' && styles.planOn]}
                onPress={() => setPlan('annual')}
                activeOpacity={0.85}
              >
                <View style={styles.planTop}>
                  <Text style={[styles.planLabel, plan === 'annual' && styles.planLabelOn]}>
                    {t('paywall.planAnnual')}
                  </Text>
                  <Text style={styles.planSave}>{t('paywall.save')}</Text>
                </View>
                <Text style={[styles.planPrice, plan === 'annual' && styles.planPriceOn]}>
                  {t('paywall.priceAnnual')}
                </Text>
                <Text style={styles.planSub}>{t('paywall.perMonth')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.plan, plan === 'monthly' && styles.planOn]}
                onPress={() => setPlan('monthly')}
                activeOpacity={0.85}
              >
                <View style={styles.planTop}>
                  <Text style={[styles.planLabel, plan === 'monthly' && styles.planLabelOn]}>
                    {t('paywall.planMonthly')}
                  </Text>
                </View>
                <Text style={[styles.planPrice, plan === 'monthly' && styles.planPriceOn]}>
                  {t('paywall.price')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.frequency}>
              {plan === 'annual' ? t('paywall.frequencyAnnual') : t('paywall.frequency')}
            </Text>

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
              <TouchableOpacity style={styles.cta} onPress={() => onSubscribe(plan)} activeOpacity={0.85}>
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
          </ScrollView>
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
    backgroundColor: Colors.stone2, borderRadius: 24, padding: 28,
    width: '100%', maxWidth: 420, maxHeight: '90%',
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.22)',
  },
  omega: { fontFamily: Fonts.cinzel, fontSize: 34, color: Colors.sand, textAlign: 'center', marginBottom: 10 },
  title: { fontFamily: Fonts.cinzel, fontSize: 21, color: Colors.sand2, textAlign: 'center', letterSpacing: 0.8, marginBottom: 6 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, textAlign: 'center', letterSpacing: 0.4, marginBottom: 18 },

  plans: { flexDirection: 'row', gap: 10 },
  plan: {
    flex: 1, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 13,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)', backgroundColor: Colors.stone3,
  },
  planOn: { borderColor: Colors.sand, backgroundColor: 'rgba(196,169,106,0.11)' },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 },
  planLabel: { fontFamily: Fonts.jost, fontSize: 11, letterSpacing: 1, color: Colors.muted },
  planLabelOn: { color: Colors.sand2 },
  planSave: {
    fontFamily: Fonts.jost, fontSize: 9, letterSpacing: 0.6, color: Colors.stone,
    backgroundColor: Colors.sand, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1.5, overflow: 'hidden',
  },
  planPrice: { fontFamily: Fonts.cinzel, fontSize: 17, color: Colors.text2, letterSpacing: 0.3 },
  planPriceOn: { color: Colors.sand2 },
  planSub: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, marginTop: 3 },

  frequency: { fontFamily: Fonts.jost, fontSize: 11.5, color: Colors.muted, textAlign: 'center', marginTop: 12, letterSpacing: 0.2 },
  divider: { height: 1, backgroundColor: 'rgba(196,169,106,0.15)', marginVertical: 18 },
  body: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 21, color: Colors.text2, marginBottom: 18 },

  features: { gap: 11, marginBottom: 18 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureMark: { fontSize: 10, color: Colors.sand, marginTop: 4 },
  featureText: { flex: 1, fontFamily: Fonts.jost, fontSize: 13, lineHeight: 20, color: Colors.text },

  freeNote: {
    backgroundColor: 'rgba(196,169,106,0.08)', borderRadius: 12, padding: 13,
    borderLeftWidth: 2, borderLeftColor: Colors.sand, marginBottom: 12,
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
