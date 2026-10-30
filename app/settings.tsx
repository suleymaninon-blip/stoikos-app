import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, Linking, Share, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { useLang, LANGUAGES, upper, localeOf } from '../constants/i18n';
import { exportJournal } from '../constants/journal';
import { isNotifyEnabled, enableReminders, disableReminders, cancelAllReminders, REMINDERS_SUPPORTED, getReminderTimes, setReminderTime, formatTime, TIME_RANGE, TIME_STEP, ReminderKind } from '../constants/notify';
import { resetMemory, ADMIN_KEY_STORAGE } from '../constants/api';
import { APP_INFO, FEATURES } from '../constants/config';
import { replayOnboarding } from '../constants/onboarding';
import { notify, confirmAction } from '../constants/dialog';
import { HEALTH_SUPPORTED, isHealthSyncOn, setHealthSync, healthAppName } from '../constants/healthPrefs';
import { LockIcon } from '../components/Icons';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function SettingsScreen() {
  const { t, lang, setLang } = useLang();
  const [notifyOn, setNotifyOn] = useState(false);
  const [healthOn, setHealthOn] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => { isNotifyEnabled().then(setNotifyOn); }, []);
  const [times, setTimes] = useState<Record<ReminderKind, number> | null>(null);
  useEffect(() => { getReminderTimes().then(setTimes); }, []);

  // Hatırlatıcı saatini 15 dk kaydır; açıksa takvim yeni saatle yeniden kurulur.
  function shiftTime(kind: ReminderKind, dir: 1 | -1) {
    if (!times) return;
    const [lo, hi] = TIME_RANGE[kind];
    const next = Math.min(hi, Math.max(lo, times[kind] + dir * TIME_STEP));
    if (next === times[kind]) return;
    setTimes({ ...times, [kind]: next });
    setReminderTime(kind, next, lang).catch(() => {});
  }
  useEffect(() => { isHealthSyncOn().then(setHealthOn); }, []);

  async function toggleHealth() {
    const ok = await setHealthSync(!healthOn);
    if (healthOn) { setHealthOn(false); return; }
    setHealthOn(ok);
    if (!ok) notify('Stoikos', t('health.denied').replace('{app}', healthAppName(lang)));
  }
  useEffect(() => { AsyncStorage.getItem(ADMIN_KEY_STORAGE).then((k) => k && setAdminKey(k)); }, []);

  async function toggleNotify() {
    if (!REMINDERS_SUPPORTED) return;   // web: kart zaten açıklama gösteriyor
    try {
      if (notifyOn) {
        await disableReminders(lang);
        setNotifyOn(false);
      } else {
        const ok = await enableReminders(lang);
        if (ok) setNotifyOn(true);
        else notify('Stoikos', t('notify.denied'));
      }
    } catch {
      notify('Stoikos', t('notify.denied'));
    }
  }

  async function resetCoachMemory() {
    const ok = await confirmAction({
      title: t('memory.resetTitle'),
      message: t('memory.resetMsg'),
      confirmText: t('progress.reset'),
      cancelText: t('progress.cancel'),
      destructive: true,
    });
    if (!ok) return;
    // Silindiğini ancak sunucu onaylarsa söylüyoruz — gizlilik sözü bu.
    try {
      await resetMemory();
      notify(t('memory.resetTitle'), t('memory.resetDone'));
    } catch {
      notify(t('memory.resetTitle'), t('memory.resetFailed'));
    }
  }

  async function showOnboardingAgain() {
    await replayOnboarding();   // root'taki Onboarding'i tetikler
    router.replace('/');        // ana ekrana dön, tanıtım üstte açılsın
  }

  async function shareApp() {
    try { await Share.share({ message: `${t('about.shareMsg')} ${APP_INFO.shareUrl}` }); } catch {}
  }
  // Mağaza bağlantısı yoksa (web, ya da yayından önce) satır hiç gösterilmez;
  // eskiden kendi sitemize düşüyordu, "Değerlendir" diyip siteyi açmak yanıltıcı.
  const storeUrl = Platform.OS === 'ios' ? APP_INFO.storeUrl.ios
    : Platform.OS === 'android' ? APP_INFO.storeUrl.android : '';
  function rateApp() {
    if (storeUrl) Linking.openURL(storeUrl).catch(() => {});
  }
  function contactSupport() {
    const url = `mailto:${APP_INFO.supportEmail}?subject=${encodeURIComponent(t('about.supportSubject'))}`;
    Linking.openURL(url).catch(() => notify(t('about.support'), APP_INFO.supportEmail));
  }
  function showAbout() {
    notify('Stoikos', `${t('about.desc')}\n\n${t('about.version')} ${APP_VERSION}`);
  }
  function openTerms() {
    Linking.openURL(lang === 'tr' ? APP_INFO.termsUrl : APP_INFO.termsUrlEn).catch(() => {});
  }
  // İptal ve plan değişikliği mağazanın kendi sayfasında; web'de abonelik yok, satır gizli.
  const manageSubUrl = Platform.OS === 'ios' ? APP_INFO.manageSubUrl.ios
    : Platform.OS === 'android' ? APP_INFO.manageSubUrl.android : '';

  // Tüm verileri sil: önce sunucudaki koç hafızası (ağ gerekir), o onaylanınca cihazdaki
  // bütün stoikos_* kayıtları ve kurulu hatırlatıcılar. Sunucu silinmezse hiçbir şeye
  // dokunulmaz — "silindi" ancak gerçekten silinince söylenir. Abonelik mağazada, etkilenmez.
  async function exportMyJournal() {
    try {
      const r = await exportJournal(t('data.exportTitle'), localeOf(lang));
      if (r === 'empty') notify(t('data.export'), t('data.exportEmpty'));
    } catch {}
  }

  async function deleteAllData() {
    const ok = await confirmAction({
      title: t('data.deleteAll'),
      message: t('data.deleteAllMsg'),
      confirmText: t('progress.reset'),
      cancelText: t('progress.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await resetMemory();
    } catch {
      notify(t('data.deleteAll'), t('data.deleteAllFailed'));
      return;
    }
    await cancelAllReminders().catch(() => {});
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith('stoikos'));
    await AsyncStorage.multiRemove(keys);
    notify(t('data.deleteAll'), t('data.deleteAllDone'));
    await replayOnboarding();
    router.replace('/');
  }

  function openPrivacy() {
    const url = lang === 'tr' ? APP_INFO.privacyUrl : APP_INFO.privacyUrlEn;
    Linking.openURL(url).catch(() => {});
  }
  async function openAdmin() {
    if (!adminKey.trim()) return;
    await AsyncStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
    router.push('/challenge-admin');
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(196,169,106,0.05)', 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
        </View>

        {/* Dil seçici */}
        <View style={styles.langWrap}>
          <Text style={styles.langTitle}>{upper(t('progress.langLabel'), lang)}</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                onPress={() => setLang(l.code)}
                style={[styles.langChip, lang === l.code && styles.langChipActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Günlük hatırlatıcılar */}
        <TouchableOpacity
          style={[styles.notifyCard, !REMINDERS_SUPPORTED && styles.notifyCardOff]}
          onPress={toggleNotify}
          disabled={!REMINDERS_SUPPORTED}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.notifyTitle}>{t('notify.title')}</Text>
            <Text style={styles.notifyHint}>
              {REMINDERS_SUPPORTED ? t('notify.hint') : t('notify.webOnly')}
            </Text>
          </View>
          {REMINDERS_SUPPORTED && (
            <View style={[styles.toggle, notifyOn && styles.toggleOn]}>
              <View style={[styles.toggleKnob, notifyOn && styles.toggleKnobOn]} />
            </View>
          )}
        </TouchableOpacity>

        {/* Saatleri kullanıcı seçer (30 Ekim 2026): 15 dk adımlı − / + */}
        {REMINDERS_SUPPORTED && notifyOn && times && (
          <View style={styles.timesCard}>
            {(['morning', 'evening'] as ReminderKind[]).map((k, i) => {
              const [lo, hi] = TIME_RANGE[k];
              const label = t(k === 'morning' ? 'notify.morning' : 'notify.evening');
              return (
                <View key={k} style={[styles.timeRow, i === 0 && styles.timeRowBorder]}>
                  <Text style={styles.timeLabel}>{label}</Text>
                  <TouchableOpacity onPress={() => shiftTime(k, -1)} disabled={times[k] <= lo} style={[styles.timeBtn, times[k] <= lo && styles.timeBtnOff]} accessibilityRole="button" accessibilityLabel={`${label}: ${t('notify.earlier')}`}>
                    <Text style={styles.timeBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue} accessibilityLiveRegion="polite">{formatTime(times[k])}</Text>
                  <TouchableOpacity onPress={() => shiftTime(k, 1)} disabled={times[k] >= hi} style={[styles.timeBtn, times[k] >= hi && styles.timeBtnOff]} accessibilityRole="button" accessibilityLabel={`${label}: ${t('notify.later')}`}>
                    <Text style={styles.timeBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Sağlık uygulamasına farkındalık dakikası yazma — yalnız iPhone/Android'de */}
        {HEALTH_SUPPORTED && (
          <TouchableOpacity style={styles.notifyCard} onPress={toggleHealth} activeOpacity={0.85} accessibilityRole="switch" accessibilityState={{ checked: healthOn }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifyTitle}>{t('health.title').replace('{app}', healthAppName(lang))}</Text>
              <Text style={styles.notifyHint}>{t('health.hint').replace('{app}', healthAppName(lang))}</Text>
            </View>
            <View style={[styles.toggle, healthOn && styles.toggleOn]}>
              <View style={[styles.toggleKnob, healthOn && styles.toggleKnobOn]} />
            </View>
          </TouchableOpacity>
        )}

        {/* Hayat haftaları — memento mori duvar kağıdı (30 Ekim 2026) */}
        <TouchableOpacity style={styles.notifyCard} onPress={() => router.push('/wallpaper')} activeOpacity={0.85} accessibilityRole="button">
          <View style={{ flex: 1 }}>
            <Text style={styles.notifyTitle}>{t('wp.title')}</Text>
            <Text style={styles.notifyHint}>{t('wp.rowHint')}</Text>
          </View>
          <Text style={styles.aboutArrow}>›</Text>
        </TouchableOpacity>

        {/* Nasıl kullanılır? (6 hareketli kart) + tanıtımı tekrar göster — yan yana (30 Ekim 2026) */}
        <View style={styles.helpRow}>
          <TouchableOpacity style={[styles.resetBtn, styles.helpBtn]} onPress={() => router.push('/help')} activeOpacity={0.8} accessibilityRole="button">
            <Text style={[styles.resetText, styles.helpText]}>{t('help.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.resetBtn, { flex: 1 }]} onPress={showOnboardingAgain} activeOpacity={0.8} accessibilityRole="button">
            <Text style={styles.resetText}>{t('onboarding.replayBtn')}</Text>
          </TouchableOpacity>
        </View>


        {/* Destek & Hakkında */}
        <Text style={styles.aboutSection}>{t('about.section')}</Text>
        <View style={styles.aboutCard}>
          {[
            { icon: '↗', label: t('about.share'), onPress: shareApp },
            ...(storeUrl ? [{ icon: '★', label: t('about.rate'), onPress: rateApp }] : []),
            { icon: '✉', label: t('about.support'), onPress: contactSupport },
            { icon: '◎', label: t('about.instagram'), onPress: () => Linking.openURL(APP_INFO.instagramUrl).catch(() => {}) },
            { icon: 'lock', label: t('about.privacy'), onPress: openPrivacy },
            { icon: '§', label: t('about.terms'), onPress: openTerms },
            ...(manageSubUrl ? [{ icon: '↻', label: t('about.manageSub'), onPress: () => Linking.openURL(manageSubUrl).catch(() => {}) }] : []),
            { icon: 'ⓘ', label: t('about.about'), onPress: showAbout },
          ].map((r, i, arr) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.aboutRow, i < arr.length - 1 && styles.aboutRowBorder]}
              onPress={r.onPress}
              activeOpacity={0.7}
            >
              {r.icon === 'lock'
                ? <View style={styles.aboutIconBox}><LockIcon size={18} color={Colors.sand} /></View>
                : <Text style={styles.aboutIcon}>{r.icon}</Text>}
              <Text style={styles.aboutLabel}>{r.label}</Text>
              <Text style={styles.aboutArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Verilerin — geri alınamayan işlem ayrı bölümde ve uyarı renginde
            (22 Ekim 2026'ya kadar "Tanıtımı tekrar göster" ile aynı görünüyordu). */}
        <Text style={styles.aboutSection}>{t('settings.dataSection')}</Text>
        {/* Hesap yok: veriler cihazda. Silinince kaybolacağını önceden söyle (rakiplerde "kaybolan günlük" 1★ sebebiydi). */}
        <Text style={styles.dataNote}>{t('settings.localDataNote')}</Text>
        <TouchableOpacity style={[styles.resetBtn, { marginBottom: 10 }]} onPress={exportMyJournal} activeOpacity={0.8}>
          <Text style={styles.resetText}>{t('data.export')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerBtn} onPress={resetCoachMemory} activeOpacity={0.8}>
          <Text style={styles.dangerText}>{t('memory.resetBtn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.dangerBtn, { marginTop: 10 }]} onPress={deleteAllData} activeOpacity={0.8}>
          <Text style={styles.dangerText}>{t('data.deleteAll')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>{t('about.version')} {APP_VERSION}</Text>

        {/* Yönetici — onay kuyruğu (yalnızca sahibi). Meydan Okuma gizliyken gösterilmez. */}
        {FEATURES.meydanOkuma && (
          <View style={styles.adminWrap}>
            <Text style={styles.adminTitle}>{t('admin.title')}</Text>
            <Text style={styles.adminHint}>{t('admin.hint')}</Text>
            <View style={styles.adminRow}>
              <TextInput
                style={styles.adminInput}
                placeholder={t('admin.placeholder')}
                placeholderTextColor={Colors.muted}
                value={adminKey}
                onChangeText={setAdminKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={[styles.adminBtn, !adminKey.trim() && { opacity: 0.4 }]} onPress={openAdmin} disabled={!adminKey.trim()}>
                <Text style={styles.adminBtnText}>{t('admin.open')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  scroll: { padding: 24, paddingBottom: 48 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginTop: 4, marginBottom: 12 },
  backIcon: { fontFamily: Fonts.jostLight, fontSize: 26, color: Colors.sand2, marginTop: -2 },
  header: { marginBottom: 26 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 27, color: Colors.text, letterSpacing: 0.3, lineHeight: 33, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.muted, letterSpacing: 0.2, lineHeight: 21 },

  // Dil seçici
  langWrap: { marginBottom: 20 },
  langTitle: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.muted, marginBottom: 10 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.stone2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  langChipActive: { backgroundColor: 'rgba(212,146,74,0.18)', borderColor: Colors.accent },
  langFlag: { fontSize: 16 },
  langLabel: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.text2 },
  langLabelActive: { color: Colors.accent },

  // Bildirim kartı
  notifyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.stone2, borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(212,146,74,0.18)',
  },
  notifyCardOff: { opacity: 0.7 },
  timesCard: { backgroundColor: Colors.stone2, borderRadius: 16, paddingHorizontal: 16, marginTop: -10, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212,146,74,0.12)' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  timeRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.stone4 },
  timeLabel: { flex: 1, fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2 },
  timeValue: { minWidth: 64, textAlign: 'center', fontFamily: Fonts.jostMedium, fontSize: 18, color: Colors.sand2, fontVariant: ['tabular-nums'] },
  timeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone3 },
  timeBtnOff: { opacity: 0.35 },
  timeBtnText: { fontFamily: Fonts.jostMedium, fontSize: 20, color: Colors.sand2 },
  notifyTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand2, letterSpacing: 0.3, marginBottom: 4 },
  notifyHint: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2, lineHeight: 19 },
  toggle: { width: 46, height: 27, borderRadius: 14, backgroundColor: Colors.stone4, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: Colors.accent },
  toggleKnob: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#f0e8d5' },
  toggleKnobOn: { alignSelf: 'flex-end' },

  // Reset / aksiyon butonları
  helpRow: { flexDirection: 'row', gap: 10 },
  helpBtn: { flex: 1, borderColor: 'rgba(194,168,120,0.45)', backgroundColor: Colors.stone3 },
  helpText: { color: Colors.sand2 },
  resetBtn: {
    backgroundColor: Colors.stone2, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  resetText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.text2, letterSpacing: 0.3, textAlign: 'center' },
  dangerBtn: {
    minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(214,120,100,0.35)', backgroundColor: 'rgba(214,120,100,0.06)',
  },
  dangerText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: '#e3a08f', letterSpacing: 0.3 },

  // Destek & Hakkında
  dataNote: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 19, color: Colors.text2, marginBottom: 14 },
  aboutSection: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.muted, marginTop: 24, marginBottom: 12 },
  aboutCard: { backgroundColor: Colors.stone2, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  aboutRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  aboutIcon: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand, width: 22, textAlign: 'center' },
  aboutIconBox: { width: 22, alignItems: 'center' },
  aboutLabel: { flex: 1, fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2 },
  aboutArrow: { fontFamily: Fonts.jostLight, fontSize: 20, color: Colors.muted },
  versionText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 12 },

  // Yönetici
  adminWrap: { marginTop: 18, backgroundColor: Colors.stone2, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  adminTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.text2, marginBottom: 4 },
  adminHint: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, lineHeight: 15, marginBottom: 10 },
  adminRow: { flexDirection: 'row', gap: 8 },
  adminInput: { flex: 1, backgroundColor: Colors.stone3, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontFamily: Fonts.jost, fontSize: 12, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  adminBtn: { backgroundColor: Colors.stone4, borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  adminBtnText: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand2 },
});
