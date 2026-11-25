import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { Colors, Fonts } from '../constants/theme';
import { upper, useLang } from '../constants/i18n';
import { CARD_OUT, SHEET, TRACE_MOTIF_W, shareTraceCardWeb, traceTitleSize } from '../constants/shareCard';
import { TRACE_IMAGES } from '../constants/traceImages';
import StoikosMark from './StoikosMark';
import TraceCoin from './TraceCoin';
import { PAPER } from './EmbossTile';
import { CalmPressable } from './CalmPressable';

/**
 * İzler → "Bir arkadaşına öner" (25 Kasım 2026, kullanıcı: övünme değil öneri).
 * Sikke ayrıntısının içinde (aynı Modal) açılır: 9:16 kart önizlemesi + Paylaş + Geri.
 * Tasarım A · Kâğıt yaprak (https://claude.ai/artifact/YHC39D6eCJesqL8kZGdp1V): söz kartıyla
 * aynı siyah-altın çerçeve, bilerek temasız. Geometri 360×640 tuvalde; ekranda 0,8 kat,
 * web çizimi (constants/shareCard.ts → renderTraceCard) 3 kat — biri değişirse öteki de.
 * Yalnız kazanılmış sikke paylaşılır; yazılanlar, tarih, sayı, üye numarası kartta yok.
 */
const K = 0.8;
const n = (x: number) => x * K;

export default function TraceShare({ pid, title, onBack }: { pid: string; title: string; onBack: () => void }) {
  const { t, lang } = useLang();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const tag = upper(t('trace.shareTag'), lang);
  const motif = t(`trace.m.${pid}`);
  const invite = t('trace.shareInvite');
  const message = t('trace.shareMsg', { name: title });

  async function doShare() {
    setBusy(true);
    try {
      if (Platform.OS === 'web') {
        const src = TRACE_IMAGES[pid];
        const coinUri = src ? Asset.fromModule(src as number).uri : null;
        const r = await shareTraceCardWeb({ coinUri, tag, title, motif, invite, message });
        if (r !== 'unsupported') return;
        throw new Error('web share unsupported');
      }
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile', ...CARD_OUT });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Stoikos' });
      else await Share.share({ url: uri, message });
    } catch {
      // Görsel olmazsa (örn. Expo Go) yalnız öneri metni
      try { await Share.share({ message }); } catch {}
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.cardFrame}>
        <View ref={cardRef} collapsable={false} style={styles.card}>
          <LinearGradient colors={['#17140f', '#0a0908']} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
          <View style={styles.brandRow}>
            <StoikosMark size={n(26)} />
            <Text style={styles.brand}>STOIKOS</Text>
          </View>
          <View style={styles.sheet}>
            <ImageBackground source={PAPER} resizeMode="repeat" style={[StyleSheet.absoluteFill, styles.sheetPaper]} imageStyle={{ opacity: 0.35 }} />
            <Text style={styles.tag}>{tag}</Text>
            <View style={styles.coinWrap}>
              <View style={styles.coinShadow} />
              {TRACE_IMAGES[pid]
                ? <Image source={TRACE_IMAGES[pid]} style={styles.coinImg} resizeMode="contain" />
                : <TraceCoin pid={pid} state="earned" size={n(112)} />}
            </View>
            <Text style={[styles.title, { fontSize: n(traceTitleSize(title)) }]} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
            <Text style={styles.motif}>{motif}</Text>
            <LinearGradient
              colors={['rgba(196,169,106,0)', 'rgba(196,169,106,0.55)', 'rgba(196,169,106,0)']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.divider}
            />
            <Text style={styles.invite} numberOfLines={1} adjustsFontSizeToFit>{invite}</Text>
          </View>
          <Text style={styles.url}>stoikos.app</Text>
        </View>
      </View>

      <Text style={styles.note}>{t('trace.shareNote')}</Text>
      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <CalmPressable onPress={doShare} disabled={busy} style={styles.shareBtn} accessibilityLabel={t('trace.shareBtn')}>
            {busy ? <ActivityIndicator size="small" color={Colors.stone} /> : <Text style={styles.shareBtnText}>{t('trace.shareBtn')}</Text>}
          </CalmPressable>
        </View>
        <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" hitSlop={6}>
          <Text style={styles.backBtnText}>{t('trace.shareBack')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  cardFrame: { width: n(360), height: n(640), borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)' },
  card: { width: n(360), height: n(640), backgroundColor: '#0a0908' },

  brandRow: { position: 'absolute', left: 0, right: 0, top: n(98), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: n(10) },
  brand: { fontFamily: Fonts.cinzelBold, fontSize: n(13), letterSpacing: n(4), color: '#d8c49a' },

  // shareCard.ts → SHEET ve traceCardLayout ile aynı sayılar
  sheet: {
    position: 'absolute', left: n(SHEET.x), top: n(SHEET.y), width: n(SHEET.w), height: n(SHEET.h),
    paddingHorizontal: n(20), borderRadius: n(SHEET.r),
    backgroundColor: '#1f1b16', borderWidth: 1, borderColor: 'rgba(196,169,106,0.16)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: n(10) }, shadowOpacity: 0.45, shadowRadius: n(30), elevation: 8,
  },
  sheetPaper: { borderRadius: n(SHEET.r), overflow: 'hidden' },
  tag: { fontFamily: Fonts.jostMedium, fontSize: n(10), lineHeight: n(12), letterSpacing: n(2.4), color: '#c2a878', textAlign: 'center' },
  coinWrap: { width: n(112), height: n(112), marginTop: n(16) },
  coinShadow: { position: 'absolute', left: n(112 * 0.045), top: n(112 * 0.06), width: n(112 * 0.93), height: n(112 * 0.93), borderRadius: n(56), backgroundColor: 'rgba(0,0,0,0.32)' },
  coinImg: { position: 'absolute', left: n(112 * 0.03), top: n(112 * 0.03), width: n(112 * 0.94), height: n(112 * 0.94) },
  title: { fontFamily: Fonts.cormorant, fontSize: n(26), lineHeight: n(30), color: '#f5edd8', textAlign: 'center', marginTop: n(16), maxWidth: n(SHEET.w - 40) },
  motif: { fontFamily: Fonts.cormorantItalic, fontSize: n(15), lineHeight: n(20), color: '#d8c49a', textAlign: 'center', marginTop: n(8), width: n(TRACE_MOTIF_W) },
  divider: { width: n(120), height: 1, marginTop: n(16) },
  invite: { fontFamily: Fonts.jost, fontSize: n(12.5), lineHeight: n(16), color: '#b5a88f', textAlign: 'center', marginTop: n(14), maxWidth: n(SHEET.w - 40) },
  url: { position: 'absolute', left: 0, right: 0, top: n(488), fontFamily: Fonts.jost, fontSize: n(11), letterSpacing: n(1.5), color: '#8a8070', textAlign: 'center' },

  note: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 19, color: '#b5a88f', textAlign: 'center', marginTop: 14, width: n(360) },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, width: n(360) },
  shareBtn: { height: 50, backgroundColor: Colors.accent, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.stone },
  backBtn: { minHeight: 50, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone3 },
  backBtnText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.text2 },
});
