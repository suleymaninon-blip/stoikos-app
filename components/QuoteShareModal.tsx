import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, Share, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Colors, Fonts } from '../constants/theme';
import { Quote } from '../constants/content';

export function QuoteShareModal({ quote, tagline, shareLabel, closeLabel, onClose }: {
  quote: Quote | null;
  tagline: string;
  shareLabel: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  if (!quote) return null;

  async function doShare() {
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Stoikos' });
      } else {
        await Share.share({ url: uri });
      }
    } catch (e) {
      // Görsel yakalama olmazsa (örn. Expo Go) metin olarak paylaş
      try {
        await Share.share({ message: `"${quote!.text}" — ${quote!.author}, ${quote!.source}\n\n— Stoikos` });
      } catch {}
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ alignItems: 'center' }}>
          {/* Paylaşılacak kart */}
          <View ref={cardRef} collapsable={false} style={styles.card}>
            <LinearGradient
              colors={['rgba(212,146,74,0.12)', 'transparent']}
              style={styles.cardGlow}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            <Text style={styles.cardOmegaFaint}>Ω</Text>
            <Text style={styles.cardStar}>✦</Text>
            <Text style={styles.cardQuote}>“{quote.text}”</Text>
            <Text style={styles.cardAuthor}>— {quote.author}</Text>
            <Text style={styles.cardSource}>{quote.source}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardBrand}>Ω  STOIKOS</Text>
              <Text style={styles.cardTagline}>{tagline}</Text>
            </View>
          </View>

          {/* Aksiyonlar */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareBtn} onPress={doShare} disabled={busy} activeOpacity={0.85}>
              {busy ? <ActivityIndicator size="small" color={Colors.stone} />
                : <Text style={styles.shareBtnText}>↗  {shareLabel}</Text>}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 26 },
  card: {
    width: 320, minHeight: 320, backgroundColor: Colors.stone, borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.3)', overflow: 'hidden', justifyContent: 'center',
  },
  cardGlow: { position: 'absolute', top: 0, right: 0, width: 280, height: 200 },
  cardOmegaFaint: { position: 'absolute', top: 10, right: 16, fontFamily: Fonts.cinzel, fontSize: 120, color: 'rgba(196,169,106,0.06)', lineHeight: 130 },
  cardStar: { fontSize: 12, color: Colors.sand, opacity: 0.7, marginBottom: 16 },
  cardQuote: { fontFamily: Fonts.cormorantItalic, fontSize: 24, lineHeight: 34, color: Colors.sand3, marginBottom: 18 },
  cardAuthor: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.sand, letterSpacing: 0.5 },
  cardSource: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, fontStyle: 'italic', marginTop: 2 },
  cardFooter: { marginTop: 26, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(196,169,106,0.15)' },
  cardBrand: { fontFamily: Fonts.cinzelBold, fontSize: 13, letterSpacing: 3, color: Colors.sand2 },
  cardTagline: { fontFamily: Fonts.jostLight, fontSize: 9, letterSpacing: 1.5, color: Colors.muted, marginTop: 2 },

  actions: { flexDirection: 'row', gap: 12, marginTop: 22, width: 320 },
  shareBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  shareBtnText: { fontFamily: Fonts.cinzel, fontSize: 13, letterSpacing: 1, color: Colors.stone },
  closeBtn: { paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  closeBtnText: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.text2 },
});
