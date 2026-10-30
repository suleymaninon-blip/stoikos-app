import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Share, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';
import { WeeksWallpaper } from '../components/WeeksWallpaper';
import {
  WP_W, WP_H, WP_OUT, WEEKS_THEMES, SWATCH, MIN_YEAR, maxBirthYear,
  loadWeeksPrefs, saveWeeksPrefs, type WeeksPrefs, type WeeksTheme,
} from '../constants/lifeWeeks';
import { exportWeeksWeb } from '../constants/weeksCanvas';
import { REMINDERS_SUPPORTED, isWeeksReminderOn, setWeeksReminder } from '../constants/notify';
import { notify } from '../constants/dialog';

/**
 * Hayat haftaları — memento mori duvar kağıdı oluşturucu (30 Ekim 2026; tasarım
 * https://claude.ai/artifact/59VknQFbGf1zGqT5v8cJEU). Ayarlar'dan açılır.
 * Doğum ayı/yılı, ömür (80/90), dört görünüm, sayılar; resim 1290×2796.
 * iPhone duvar kağıdını uygulama değiştiremez: Kaydet paylaşım ekranını açar ("Resmi Kaydet"),
 * kullanıcı Fotoğraflar'dan "Duvar Kağıdı Olarak Kullan"ı seçer. Yeni izin gerekmiyor.
 * Pazar hatırlatması isteğe bağlı (notify.ts → setWeeksReminder), yalnız iOS/Android.
 */
const PREVIEW = 0.44;

export default function WallpaperScreen() {
  const { t, lang } = useLang();
  const [prefs, setPrefs] = useState<WeeksPrefs | null>(null);
  const [sunday, setSunday] = useState(false);
  const [busy, setBusy] = useState<'save' | 'share' | null>(null);
  const [toast, setToast] = useState('');
  const shot = useRef<View>(null);

  useEffect(() => { loadWeeksPrefs().then(({ prefs }) => setPrefs(prefs)); }, []);
  useEffect(() => { isWeeksReminderOn().then(setSunday); }, []);

  if (!prefs) return <View style={styles.container} />;

  const update = (patch: Partial<WeeksPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next); setToast('');
    saveWeeksPrefs(next);
  };
  const months = t('wp.months').split(',');
  const maxY = maxBirthYear();

  async function toggleSunday() {
    const ok = await setWeeksReminder(!sunday, lang).catch(() => false);
    if (ok) setSunday(!sunday);
    else if (!sunday) notify(t('wp.title'), t('wp.denied'));
  }

  async function exportImage(mode: 'save' | 'share') {
    if (busy) return;
    setBusy(mode); setToast('');
    const shareText = t('wp.shareText');
    try {
      if (Platform.OS === 'web') {
        const r = await exportWeeksWeb(prefs!, { caption: t('wp.caption'), weeksUpper: t('wp.weeksUpper'), lang }, mode, shareText);
        if (r === 'downloaded') setToast(t('wp.downloaded'));
        return;
      }
      const uri = await captureRef(shot, { format: 'png', quality: 1, result: 'tmpfile', ...WP_OUT });
      if (mode === 'save') setToast(t('wp.saveHint'));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Stoikos', UTI: 'public.png' });
      } else {
        await Share.share({ url: uri, message: shareText });
      }
    } catch {
      setToast(t('wp.failed'));
    } finally {
      setBusy(null);
    }
  }

  const Step = ({ label, dir, onPress, disabled }: { label: string; dir: -1 | 1; onPress: () => void; disabled?: boolean }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.step, disabled && { opacity: 0.3 }]} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      <Text style={styles.stepText}>{dir < 0 ? '‹' : '›'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Resim bu tam boyutlu, saatsiz kopyadan alınır (önizleme ölçekli). Ekranda ama opak bir
          katmanın arkasında: ekran dışına itilen görünümü iOS boş yakalayabiliyor. */}
      <View style={styles.hidden} pointerEvents="none">
        <WeeksWallpaper ref={shot} prefs={prefs} lang={lang} t={t} />
      </View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bg }]} pointerEvents="none" />
      <LinearGradient colors={['rgba(196,169,106,0.05)', 'transparent']} style={styles.grad} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.headRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('practice.close')}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('wp.title')}</Text>
            <Text style={styles.subtitle}>{t('wp.subtitle')}</Text>
          </View>
        </View>

        {/* Önizleme: gerçek boyutta çizilir, ölçeklenerek gösterilir; resim bu görünümden alınır. */}
        <View style={styles.previewBox}>
          <View style={styles.previewInner}>
            <WeeksWallpaper prefs={prefs} lang={lang} t={t} clock />
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.row, styles.rowBorder, { gap: 0 }]}>
            <Text style={styles.label} numberOfLines={1}>{t('wp.birth')}</Text>
            <Step label={t('wp.prevMonth')} dir={-1} onPress={() => update({ month: prefs.month === 1 ? 12 : prefs.month - 1 })} />
            <Text style={[styles.value, { minWidth: 78 }]}>{months[prefs.month - 1]}</Text>
            <Step label={t('wp.nextMonth')} dir={1} onPress={() => update({ month: prefs.month === 12 ? 1 : prefs.month + 1 })} />
            <Step label={t('wp.prevYear')} dir={-1} disabled={prefs.year <= MIN_YEAR} onPress={() => update({ year: Math.max(MIN_YEAR, prefs.year - 1) })} />
            <Text style={[styles.value, { minWidth: 42 }]}>{prefs.year}</Text>
            <Step label={t('wp.nextYear')} dir={1} disabled={prefs.year >= maxY} onPress={() => update({ year: Math.min(maxY, prefs.year + 1) })} />
          </View>

          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.label}>{t('wp.life')}</Text>
            {([80, 90] as const).map((n) => (
              <TouchableOpacity key={n} onPress={() => update({ life: n })} style={[styles.chip, prefs.life === n && styles.chipOn]} accessibilityRole="radio" accessibilityState={{ selected: prefs.life === n }}>
                <Text style={[styles.chipText, prefs.life === n && styles.chipTextOn]}>{t('wp.years').replace('{n}', String(n))}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.rowBorder, { paddingVertical: 12, gap: 10 }]}>
            <Text style={styles.label}>{t('wp.look')}</Text>
            <View style={styles.themes}>
              {WEEKS_THEMES.map((th: WeeksTheme) => (
                <TouchableOpacity key={th} onPress={() => update({ theme: th })} style={[styles.theme, prefs.theme === th && styles.themeOn]} accessibilityRole="radio" accessibilityState={{ selected: prefs.theme === th }}>
                  <LinearGradient colors={SWATCH[th]} style={styles.swatch} start={{ x: 0.2, y: 0.1 }} end={{ x: 0.9, y: 1 }} />
                  <Text style={[styles.themeText, prefs.theme === th && { color: Colors.sand2 }]}>{t(`wp.theme.${th}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={() => update({ numbers: !prefs.numbers })} style={[styles.row, REMINDERS_SUPPORTED && styles.rowBorder]} accessibilityRole="switch" accessibilityState={{ checked: prefs.numbers }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('wp.numbers')}</Text>
              <Text style={styles.hint}>{t('wp.numbersHint')}</Text>
            </View>
            <View style={[styles.toggle, prefs.numbers && styles.toggleOn]}><View style={[styles.knob, prefs.numbers && styles.knobOn]} /></View>
          </TouchableOpacity>

          {REMINDERS_SUPPORTED && (
            <TouchableOpacity onPress={toggleSunday} style={styles.row} accessibilityRole="switch" accessibilityState={{ checked: sunday }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('wp.sunday')}</Text>
                <Text style={styles.hint}>{t('wp.sundayHint')}</Text>
              </View>
              <View style={[styles.toggle, sunday && styles.toggleOn]}><View style={[styles.knob, sunday && styles.knobOn]} /></View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => exportImage('save')} style={styles.primary} activeOpacity={0.85} accessibilityRole="button">
            {busy === 'save' ? <ActivityIndicator color={Colors.bg} /> : <Text style={styles.primaryText}>{t('wp.save')}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => exportImage('share')} style={styles.secondary} activeOpacity={0.85} accessibilityRole="button">
            {busy === 'share' ? <ActivityIndicator color={Colors.sand2} /> : <Text style={styles.secondaryText}>{t('wp.share')}</Text>}
          </TouchableOpacity>
        </View>
        {!!toast && <Text style={styles.toast} accessibilityLiveRegion="polite">{toast}</Text>}
        <Text style={styles.privacy}>{t('wp.privacy')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  scroll: { padding: 20, paddingBottom: 48, gap: 16 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  backIcon: { fontFamily: Fonts.jostLight, fontSize: 26, color: Colors.sand2, marginTop: -2 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 28, lineHeight: 32, color: Colors.text },
  subtitle: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted },
  previewBox: {
    alignSelf: 'center', width: WP_W * PREVIEW, height: WP_H * PREVIEW, borderRadius: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.25)',
  },
  previewInner: {
    width: WP_W, height: WP_H,
    transform: [{ translateX: -(WP_W * (1 - PREVIEW)) / 2 }, { translateY: -(WP_H * (1 - PREVIEW)) / 2 }, { scale: PREVIEW }],
  },
  hidden: { position: 'absolute', left: 0, top: 0, width: WP_W, height: WP_H },
  card: { backgroundColor: Colors.stone2, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(212,146,74,0.12)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 56, paddingVertical: 6 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.stone4 },
  label: { flex: 1, fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2 },
  hint: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, marginTop: 2, lineHeight: 17 },
  value: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.sand2, textAlign: 'center' },
  step: { width: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: Fonts.jostLight, fontSize: 22, color: Colors.sand },
  chip: { minWidth: 64, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#3a342a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginLeft: 6 },
  chipOn: { backgroundColor: Colors.sand, borderColor: Colors.sand },
  chipText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text2 },
  chipTextOn: { color: Colors.bg, fontFamily: Fonts.jostMedium },
  themes: { flexDirection: 'row', gap: 8 },
  theme: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  themeOn: { borderColor: Colors.sand },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  themeText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted },
  toggle: { width: 46, height: 27, borderRadius: 14, backgroundColor: Colors.stone4, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: Colors.accent },
  knob: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#f0e8d5' },
  knobOn: { alignSelf: 'flex-end' },
  actions: { flexDirection: 'row', gap: 10 },
  primary: { flex: 1, minHeight: 50, borderRadius: 14, backgroundColor: Colors.sand, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.bg },
  secondary: { flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(194,168,120,0.5)', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.sand2 },
  toast: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 19, color: Colors.text2, textAlign: 'center' },
  privacy: { fontFamily: Fonts.jost, fontSize: 12, lineHeight: 18, color: Colors.muted, textAlign: 'center' },
});
