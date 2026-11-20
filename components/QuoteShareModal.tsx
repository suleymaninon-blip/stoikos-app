import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, Share, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Colors, Fonts } from '../constants/theme';
import StoikosMark from './StoikosMark';
import { shareQuoteCardWeb, CARD_OUT, quoteSizeFor } from '../constants/shareCard';

export interface ShareableQuote { text: string; author: string; source: string; }

/**
 * Söz paylaşım kartı (20 Kasım 2026; tasarım https://claude.ai/artifact/6U1GQAtzbNer2zyC6pkm3F).
 * 9:16 hikâye boyu (1080×1920): koyu zemin, ortada koyu "kâğıt" yaprak, büyük tırnak, söz,
 * yazar + künye; üstte işaret + STOIKOS, altta stoikos.app. Renkler bilerek temasız siyah-altın
 * (kullanıcı: "renk paletini değiştirmeyip sadece tasarımı"). Instagram'ın üst %14'ü (profil
 * çubuğu) ve alt %20'si (cevap çubuğu) boş bırakılır.
 * Tasarım 360×640'lık tuvalde; ekranda K katı küçültülmüş, web çizimi (shareCard.ts) 3 katı.
 */
const K = 0.8;
const n = (x: number) => x * K;
// Cinzel'de Kiril yok (Rusça yazar adı sistem yazı tipine düşüyordu) → Cormorant.
const CYRILLIC = /[\u0400-\u04FF]/;

export function QuoteShareModal({ quote, shareLabel, closeLabel, onClose }: {
  quote: ShareableQuote | null;
  shareLabel: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  if (!quote) return null;

  // Künye `quote.source` üzerinden uyarlama işaretini zaten taşıyor (content.ts → sourceName).
  // Mesajın sonunda adres var: görselle birlikte giden metin uygulamayı tanıtsın.
  const message = `“${quote.text}”\n— ${quote.author}, ${quote.source}\n\n✦ Stoikos · https://stoikos.app`;
  const qs = quoteSizeFor(quote.text);

  async function doShare() {
    setBusy(true);
    try {
      if (Platform.OS === 'web') {
        // Web'de view-shot çalışmıyor; kart canvas'a çizilip dosya olarak paylaşılıyor.
        // Söz zaten görselde: yanına yalnız tıklanabilir adres (kullanıcı: "niye hem kart hem yazı gidiyor").
        const r = await shareQuoteCardWeb({ text: quote!.text, author: quote!.author, source: quote!.source, message: '✦ Stoikos · https://stoikos.app' });
        if (r !== 'unsupported') return;
        throw new Error('web share unsupported');
      }
      // Ekrandaki kart 288×512; çıktı hikâye boyunda.
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile', ...CARD_OUT });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Stoikos' });
      } else {
        await Share.share({ url: uri });
      }
    } catch (e) {
      // Görsel yakalama olmazsa (örn. Expo Go) metin olarak paylaş
      try {
        await Share.share({ message });
      } catch {}
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ alignItems: 'center' }}>
          {/* Ekranda köşeler yuvarlak; yakalanan iç görünüm köşesiz (paylaşılan görselde saydam köşe olmasın). */}
          <View style={styles.cardFrame}>
            <View ref={cardRef} collapsable={false} style={styles.card}>
              <LinearGradient colors={['#17140f', '#0a0908']} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
              <View style={styles.brandRow}>
                <StoikosMark size={n(26)} />
                <Text style={styles.brand}>STOIKOS</Text>
              </View>
              <View style={styles.sheet}>
                <Text style={styles.mark}>“</Text>
                <Text style={[styles.quote, { fontSize: n(qs.size), lineHeight: n(qs.line) }]}>{quote.text}</Text>
                <Text style={[styles.author, CYRILLIC.test(quote.author) && { fontFamily: Fonts.cormorant, fontSize: n(13) }]}>{quote.author}</Text>
                <Text style={styles.source}>{quote.source}</Text>
              </View>
              <Text style={styles.url}>stoikos.app</Text>
            </View>
          </View>

          {/* Aksiyonlar */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareBtn} onPress={doShare} disabled={busy} activeOpacity={0.85}>
              {busy ? <ActivityIndicator size="small" color={Colors.stone} />
                : <Text style={styles.shareBtnText}>{shareLabel}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>{closeLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  cardFrame: {
    width: n(360), height: n(640), borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)',
  },
  card: { width: n(360), height: n(640), backgroundColor: '#0a0908' },

  brandRow: {
    position: 'absolute', left: 0, right: 0, top: n(98),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: n(10),
  },
  brand: { fontFamily: Fonts.cinzelBold, fontSize: n(13), letterSpacing: n(4), color: '#d8c49a' },

  sheet: {
    position: 'absolute', left: n(28), top: n(150), width: n(304), height: n(322),
    paddingHorizontal: n(26), paddingVertical: n(22), borderRadius: n(6),
    backgroundColor: '#1f1b16', borderWidth: 1, borderColor: 'rgba(196,169,106,0.16)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: n(10) }, shadowOpacity: 0.45, shadowRadius: n(30),
    elevation: 8,
  },
  mark: { fontFamily: Fonts.cormorant, fontSize: n(64), lineHeight: n(52), height: n(36), color: '#6e5a3a' },
  quote: { fontFamily: Fonts.cormorantItalic, color: '#f5edd8', textAlign: 'center' },
  author: { fontFamily: Fonts.cinzel, fontSize: n(11), letterSpacing: n(3), color: '#c2a878', marginTop: n(20), textAlign: 'center' },
  source: { fontFamily: Fonts.jost, fontSize: n(10.5), fontStyle: 'italic', color: '#8a8070', marginTop: n(4), textAlign: 'center' },
  url: {
    position: 'absolute', left: 0, right: 0, top: n(488),
    fontFamily: Fonts.jost, fontSize: n(11), letterSpacing: n(1.5), color: '#8a8070', textAlign: 'center',
  },

  actions: { flexDirection: 'row', gap: 12, marginTop: 20, width: n(360) },
  shareBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  shareBtnText: { fontFamily: Fonts.cinzel, fontSize: 13, letterSpacing: 1, color: Colors.stone },
  closeBtn: { paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  closeBtnText: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.text2 },
});
