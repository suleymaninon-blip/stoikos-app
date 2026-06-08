import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, Alert, Linking, Share, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { useLang, LANGUAGES } from '../constants/i18n';
import { isNotifyEnabled, enableReminders, disableReminders } from '../constants/notify';
import { resetMemory, ADMIN_KEY_STORAGE } from '../constants/api';
import { APP_INFO, FEATURES } from '../constants/config';
import { replayOnboarding } from '../constants/onboarding';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function SettingsScreen() {
  const { t, lang, setLang } = useLang();
  const [notifyOn, setNotifyOn] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => { isNotifyEnabled().then(setNotifyOn); }, []);
  useEffect(() => { AsyncStorage.getItem(ADMIN_KEY_STORAGE).then((k) => k && setAdminKey(k)); }, []);

  async function toggleNotify() {
    if (notifyOn) {
      await disableReminders();
      setNotifyOn(false);
    } else {
      const ok = await enableReminders(lang);
      if (ok) setNotifyOn(true);
      else Alert.alert('Stoikos', t('notify.denied'));
    }
  }

  function resetCoachMemory() {
    Alert.alert(
      t('memory.resetTitle'),
      t('memory.resetMsg'),
      [
        { text: t('progress.cancel'), style: 'cancel' },
        { text: t('progress.reset'), style: 'destructive', onPress: () => { resetMemory(); } },
      ]
    );
  }

  async function showOnboardingAgain() {
    await replayOnboarding();   // root'taki Onboarding'i tetikler
    router.replace('/');        // ana ekrana dön, tanıtım üstte açılsın
  }

  async function shareApp() {
    try { await Share.share({ message: `${t('about.shareMsg')} ${APP_INFO.shareUrl}` }); } catch {}
  }
  function rateApp() {
    const store = Platform.OS === 'ios' ? APP_INFO.storeUrl.ios : APP_INFO.storeUrl.android;
    Linking.openURL(store || APP_INFO.shareUrl).catch(() => {});
  }
  function contactSupport() {
    const url = `mailto:${APP_INFO.supportEmail}?subject=${encodeURIComponent(t('about.supportSubject'))}`;
    Linking.openURL(url).catch(() => Alert.alert(t('about.support'), APP_INFO.supportEmail));
  }
  function showAbout() {
    Alert.alert('Stoikos', `${t('about.desc')}\n\n${t('about.version')} ${APP_VERSION}`);
  }
  function openPrivacy() {
    Linking.openURL(APP_INFO.privacyUrl).catch(() => {});
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
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
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
          <Text style={styles.langTitle}>{t('progress.langLabel')}</Text>
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
        <TouchableOpacity style={styles.notifyCard} onPress={toggleNotify} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifyTitle}>{t('notify.title')}</Text>
            <Text style={styles.notifyHint}>{t('notify.hint')}</Text>
          </View>
          <View style={[styles.toggle, notifyOn && styles.toggleOn]}>
            <View style={[styles.toggleKnob, notifyOn && styles.toggleKnobOn]} />
          </View>
        </TouchableOpacity>

        {/* Tanıtımı tekrar göster */}
        <TouchableOpacity style={styles.resetBtn} onPress={showOnboardingAgain} activeOpacity={0.8}>
          <Text style={styles.resetText}>{t('onboarding.replayBtn')}</Text>
        </TouchableOpacity>

        {/* Koç hafızası sıfırla */}
        <TouchableOpacity style={[styles.resetBtn, { marginTop: 10 }]} onPress={resetCoachMemory} activeOpacity={0.8}>
          <Text style={styles.resetText}>{t('memory.resetBtn')}</Text>
        </TouchableOpacity>

        {/* Destek & Hakkında */}
        <Text style={styles.aboutSection}>{t('about.section')}</Text>
        <View style={styles.aboutCard}>
          {[
            { icon: '↗', label: t('about.share'), onPress: shareApp },
            { icon: '★', label: t('about.rate'), onPress: rateApp },
            { icon: '✉', label: t('about.support'), onPress: contactSupport },
            { icon: '🔒', label: t('about.privacy'), onPress: openPrivacy },
            { icon: 'ⓘ', label: t('about.about'), onPress: showAbout },
          ].map((r, i, arr) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.aboutRow, i < arr.length - 1 && styles.aboutRowBorder]}
              onPress={r.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.aboutIcon}>{r.icon}</Text>
              <Text style={styles.aboutLabel}>{r.label}</Text>
              <Text style={styles.aboutArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
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
                placeholderTextColor={Colors.stone4}
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
  grad: { position: 'absolute', top: 0, right: 0, width: '70%', height: 250 },
  scroll: { padding: 24, paddingBottom: 48 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginTop: 4, marginBottom: 12 },
  backIcon: { fontFamily: Fonts.jostLight, fontSize: 26, color: Colors.sand2, marginTop: -2 },
  header: { marginBottom: 26 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 27, color: Colors.text, letterSpacing: 0.3, lineHeight: 33, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.2, lineHeight: 19 },

  // Dil seçici
  langWrap: { marginBottom: 20 },
  langTitle: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.muted, marginBottom: 10 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.stone2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  langChipActive: { backgroundColor: 'rgba(212,146,74,0.18)', borderColor: Colors.accent },
  langFlag: { fontSize: 14 },
  langLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.muted },
  langLabelActive: { color: Colors.accent },

  // Bildirim kartı
  notifyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.stone2, borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(212,146,74,0.18)',
  },
  notifyTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand2, letterSpacing: 0.3, marginBottom: 4 },
  notifyHint: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, lineHeight: 16 },
  toggle: { width: 46, height: 27, borderRadius: 14, backgroundColor: Colors.stone4, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: Colors.accent },
  toggleKnob: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#f0e8d5' },
  toggleKnobOn: { alignSelf: 'flex-end' },

  // Reset / aksiyon butonları
  resetBtn: {
    backgroundColor: Colors.stone2, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  resetText: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.muted, letterSpacing: 0.3 },

  // Destek & Hakkında
  aboutSection: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2.5, color: Colors.muted, marginTop: 24, marginBottom: 12 },
  aboutCard: { backgroundColor: Colors.stone2, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  aboutRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  aboutIcon: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand, width: 22, textAlign: 'center' },
  aboutLabel: { flex: 1, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text2 },
  aboutArrow: { fontFamily: Fonts.jostLight, fontSize: 20, color: Colors.stone4 },
  versionText: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.faint, textAlign: 'center', marginTop: 12 },

  // Yönetici
  adminWrap: { marginTop: 18, backgroundColor: Colors.stone2, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  adminTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.text2, marginBottom: 4 },
  adminHint: { fontFamily: Fonts.jost, fontSize: 10.5, color: Colors.muted, lineHeight: 15, marginBottom: 10 },
  adminRow: { flexDirection: 'row', gap: 8 },
  adminInput: { flex: 1, backgroundColor: Colors.stone3, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontFamily: Fonts.jost, fontSize: 12, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  adminBtn: { backgroundColor: Colors.stone4, borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  adminBtnText: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand2 },
});
