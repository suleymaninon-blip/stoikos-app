import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, SafeAreaView, Linking, Share, Platform, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Fonts } from '../constants/theme';
import { useTheme, useStyles, type Palette } from '../constants/themeContext';
import { useLang, LANGUAGES, upper, localeOf } from '../constants/i18n';
import { exportJournal } from '../constants/journal';
import { getMemberNo, isFounder } from '../constants/stoa';
import {
  isNotifyEnabled, enableReminders, disableReminders, cancelAllReminders,
  REMINDERS_SUPPORTED, getReminderTimes, setReminderTime, formatTime,
  TIME_RANGE, TIME_STEP, ReminderKind, isTogetherReminderOn, setTogetherReminder,
} from '../constants/notify';
import { resetMemory, ADMIN_KEY_STORAGE } from '../constants/api';
import { APP_INFO, FEATURES } from '../constants/config';
import { replayOnboarding } from '../constants/onboarding';
import { notify, confirmAction } from '../constants/dialog';
import { HEALTH_SUPPORTED, isHealthSyncOn, setHealthSync, healthAppName } from '../constants/healthPrefs';
import { LockIcon, ShareArrowIcon, MailIcon, StarIcon } from '../components/Icons';
import { ThemePicker } from '../components/ThemePicker';
import { TypePicker } from '../components/TypePicker';
import { CalmPressable } from '../components/CalmPressable';
import { StaggerSection } from '../components/StaggerSection';
import { useReduceMotion } from '../hooks/useReduceMotion';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

// Emoji karşılığı olan glifler (↗ ✉ ★) iOS'ta renkli çiziliyor; onlar SVG.
const SVG_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  lock: LockIcon, share: ShareArrowIcon, mail: MailIcon, star: StarIcon,
};

// ── Kayarak geçen anahtar ("Hareketi Azalt"ta doğrudan yerine gelir) ──
function CalmToggle({ value }: { value: boolean }) {
  const styles = useStyles(makeStyles);
  const reduce = useReduceMotion();
  const pos = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) { pos.setValue(value ? 1 : 0); return; }
    Animated.spring(pos, { toValue: value ? 1 : 0, speed: 22, bounciness: 5, useNativeDriver: true }).start();
  }, [value, pos, reduce]);

  const translateX = pos.interpolate({ inputRange: [0, 1], outputRange: [0, 19] });

  return (
    <View style={[styles.toggle, value && styles.toggleOn]}>
      <Animated.View style={[styles.toggleKnob, { transform: [{ translateX }] }]} />
    </View>
  );
}

// ── Açılan bölümün içeriği yumuşakça belirir ──
function AccordionBody({ children }: { children: React.ReactNode }) {
  const styles = useStyles(makeStyles);
  const reduce = useReduceMotion();
  const anim = useRef(new Animated.Value(reduce ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) { anim.setValue(1); return; }
    Animated.timing(anim, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [anim, reduce]);

  return (
    <Animated.View
      style={[
        styles.accBody,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ── Bölüm başlığı: ad + içindekiler özeti; ok açılınca 90° döner ──
function AccordionRow({ title, summary, isOpen, onPress }: {
  title: string; summary: string; isOpen: boolean; onPress: () => void;
}) {
  const styles = useStyles(makeStyles);
  const reduce = useReduceMotion();
  const rot = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) { rot.setValue(isOpen ? 1 : 0); return; }
    Animated.timing(rot, { toValue: isOpen ? 1 : 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [isOpen, rot, reduce]);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <CalmPressable
      style={[styles.accRow, styles.cardShadow, isOpen && styles.accRowOpen]}
      onPress={onPress}
      accessibilityState={{ expanded: isOpen }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.secText}>{title}</Text>
        <Text style={styles.accSum} numberOfLines={1}>{summary}</Text>
      </View>
      <Animated.Text style={[styles.accChev, { transform: [{ rotate }] }]}>›</Animated.Text>
    </CalmPressable>
  );
}

export default function SettingsScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang, setLang } = useLang();
  const [notifyOn, setNotifyOn] = useState(false);
  const [togetherOn, setTogetherOn] = useState(false);
  const [memberNo, setMemberNo] = useState<number | null>(null);
  useEffect(() => { getMemberNo().then(setMemberNo); }, []);
  useEffect(() => { if (REMINDERS_SUPPORTED) isTogetherReminderOn().then(setTogetherOn).catch(() => {}); }, []);
  const [healthOn, setHealthOn] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  // Katlanır bölümler (15 Kasım 2026): sayfa beş kısa satırla açılır, aynı anda tek bölüm açık.
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));

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

  // Birlikte nefes hatırlatması (15 Kasım 2026): her akşam 20:58, günlük hatırlatıcılardan bağımsız.
  async function toggleTogether() {
    const ok = await setTogetherReminder(!togetherOn, lang).catch(() => false);
    if (ok) setTogetherOn(!togetherOn);
    else notify('Stoikos', t('notify.denied'));
  }

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

  async function exportMyJournal() {
    try {
      const r = await exportJournal(t('data.exportTitle'), localeOf(lang));
      if (r === 'empty') notify(t('data.export'), t('data.exportEmpty'));
    } catch {}
  }

  // Tüm verileri sil: önce sunucudaki koç hafızası (ağ gerekir), o onaylanınca cihazdaki
  // bütün stoikos_* kayıtları ve kurulu hatırlatıcılar. Sunucu silinmezse hiçbir şeye
  // dokunulmaz — "silindi" ancak gerçekten silinince söylenir. Abonelik mağazada, etkilenmez.
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
        colors={[Colors.tint(Colors.isDark ? 0.07 : 0.08), 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Küçük düğme kendi satırında: ScrollView içinde Pressable tam genişliğe yayılırdı. */}
        <View style={styles.backRow}>
          <CalmPressable onPress={() => router.back()} style={[styles.backBtn, styles.cardShadow]} pressScale={0.94}>
            <Text style={styles.backIcon}>‹</Text>
          </CalmPressable>
        </View>

        <StaggerSection delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.title')}</Text>
            <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
          </View>
        </StaggerSection>

        {/* 1. Dil ve görünüm */}
        <StaggerSection delay={60}>
          <AccordionRow
            title={t('settings.secLook')}
            summary={`${t('progress.langLabel')} · ${t('theme.title')} · ${t('font.title')}`}
            isOpen={open === 'look'}
            onPress={() => toggle('look')}
          />
          {open === 'look' && (
            <AccordionBody>
              <View style={styles.langWrap}>
                <Text style={styles.langTitle}>{upper(t('progress.langLabel'), lang)}</Text>
                <View style={styles.langRow}>
                  {LANGUAGES.map((l) => (
                    <CalmPressable
                      key={l.code}
                      onPress={() => setLang(l.code)}
                      style={[styles.langChip, lang === l.code && styles.langChipActive]}
                      pressScale={0.95}
                    >
                      <Text style={styles.langFlag}>{l.flag}</Text>
                      <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
                    </CalmPressable>
                  ))}
                </View>
              </View>

              {/* Görünüm (2 Kasım 2026): Otomatik / Ege / Zeytin / Gece mavisi / Klasik */}
              <View style={styles.langWrap}>
                <Text style={styles.langTitle}>{upper(t('theme.title'), lang)}</Text>
                <ThemePicker />
              </View>

              {/* Yazı tipi ve boyutu (2 Kasım 2026): en hızlı okunan yazı tipi kişiden kişiye değişir */}
              <View style={styles.langWrap}>
                <Text style={styles.langTitle}>{upper(t('font.title'), lang)}</Text>
                <TypePicker />
              </View>
            </AccordionBody>
          )}
        </StaggerSection>

        {/* 2. Hatırlatıcılar */}
        <StaggerSection delay={110}>
          <AccordionRow
            title={t('settings.secRemind')}
            summary={
              REMINDERS_SUPPORTED && notifyOn && times
                ? `${formatTime(times.morning)} · ${formatTime(times.evening)}`
                : t('notify.title')
            }
            isOpen={open === 'remind'}
            onPress={() => toggle('remind')}
          />
          {open === 'remind' && (
            <AccordionBody>
              <CalmPressable
                style={[styles.notifyCard, styles.cardShadow, !REMINDERS_SUPPORTED && styles.notifyCardOff]}
                onPress={toggleNotify}
                disabled={!REMINDERS_SUPPORTED}
                accessibilityRole="switch"
                accessibilityState={{ checked: notifyOn }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifyTitle}>{t('notify.title')}</Text>
                  <Text style={styles.notifyHint}>
                    {REMINDERS_SUPPORTED ? t('notify.hint') : t('notify.webOnly')}
                  </Text>
                </View>
                {REMINDERS_SUPPORTED && <CalmToggle value={notifyOn} />}
              </CalmPressable>

              {/* Saatleri kullanıcı seçer (30 Ekim 2026): 15 dk adımlı − / + */}
              {REMINDERS_SUPPORTED && notifyOn && times && (
                <View style={[styles.timesCard, styles.cardShadow]}>
                  {(['morning', 'evening'] as ReminderKind[]).map((k, i) => {
                    const [lo, hi] = TIME_RANGE[k];
                    const label = t(k === 'morning' ? 'notify.morning' : 'notify.evening');
                    return (
                      <View key={k} style={[styles.timeRow, i === 0 && styles.timeRowBorder]}>
                        <Text style={styles.timeLabel}>{label}</Text>
                        <TouchableOpacity
                          onPress={() => shiftTime(k, -1)}
                          disabled={times[k] <= lo}
                          style={[styles.timeBtn, times[k] <= lo && styles.timeBtnOff]}
                          accessibilityRole="button"
                          accessibilityLabel={`${label}: ${t('notify.earlier')}`}
                        >
                          <Text style={styles.timeBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue} accessibilityLiveRegion="polite">{formatTime(times[k])}</Text>
                        <TouchableOpacity
                          onPress={() => shiftTime(k, 1)}
                          disabled={times[k] >= hi}
                          style={[styles.timeBtn, times[k] >= hi && styles.timeBtnOff]}
                          accessibilityRole="button"
                          accessibilityLabel={`${label}: ${t('notify.later')}`}
                        >
                          <Text style={styles.timeBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}

              {REMINDERS_SUPPORTED && (
                <CalmPressable
                  style={[styles.notifyCard, styles.cardShadow, { marginTop: 12 }]}
                  onPress={toggleTogether}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: togetherOn }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifyTitle}>{t('together.setTitle')}</Text>
                    <Text style={styles.notifyHint}>{t('together.setHint')}</Text>
                  </View>
                  <CalmToggle value={togetherOn} />
                </CalmPressable>
              )}
            </AccordionBody>
          )}
        </StaggerSection>

        {/* 3. Keşfet */}
        <StaggerSection delay={160}>
          <AccordionRow
            title={t('settings.secExplore')}
            summary={`${t('help.title')} · ${t('wp.title')}`}
            isOpen={open === 'explore'}
            onPress={() => toggle('explore')}
          />
          {open === 'explore' && (
            <AccordionBody>
              {/* Nasıl kullanılır? + tanıtımı tekrar göster — yan yana (30 Ekim 2026). flex dıştaki Pressable'a da geçer. */}
              <View style={styles.helpRow}>
                <CalmPressable style={[styles.resetBtn, styles.cardShadow, styles.helpBtn]} onPress={() => router.push('/help')}>
                  <Text style={[styles.resetText, styles.helpText]}>{t('help.title')}</Text>
                </CalmPressable>
                <CalmPressable style={[styles.resetBtn, styles.cardShadow, { flex: 1 }]} onPress={showOnboardingAgain}>
                  <Text style={styles.resetText}>{t('onboarding.replayBtn')}</Text>
                </CalmPressable>
              </View>

              {/* Hayat haftaları — memento mori duvar kağıdı (30 Ekim 2026) */}
              <CalmPressable style={[styles.notifyCard, styles.cardShadow]} onPress={() => router.push('/wallpaper')}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifyTitle}>{t('wp.title')}</Text>
                  <Text style={styles.notifyHint}>{t('wp.rowHint')}</Text>
                </View>
                <Text style={styles.aboutArrow}>›</Text>
              </CalmPressable>
            </AccordionBody>
          )}
        </StaggerSection>

        {/* 4. Verilerin — geri alınamayan işlem ayrı bölümde ve uyarı renginde
            (22 Ekim 2026'ya kadar "Tanıtımı tekrar göster" ile aynı görünüyordu). */}
        <StaggerSection delay={210}>
          <AccordionRow
            title={t('settings.dataSection')}
            summary={`${t('journal.title')} · ${t('data.export')}`}
            isOpen={open === 'data'}
            onPress={() => toggle('data')}
          />
          {open === 'data' && (
            <AccordionBody>
              {/* Hesap yok: veriler cihazda. Silinince kaybolacağını önceden söyle (rakiplerde "kaybolan günlük" 1★ sebebiydi). */}
              <Text style={styles.dataNote}>{t('settings.localDataNote')}</Text>
              {/* Sağlık uygulamasına farkındalık dakikası yazma — yalnız iPhone/Android'de */}
              {HEALTH_SUPPORTED && (
                <CalmPressable
                  style={[styles.notifyCard, styles.cardShadow]}
                  onPress={toggleHealth}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: healthOn }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifyTitle}>{t('health.title').replace('{app}', healthAppName(lang))}</Text>
                    <Text style={styles.notifyHint}>{t('health.hint').replace('{app}', healthAppName(lang))}</Text>
                  </View>
                  <CalmToggle value={healthOn} />
                </CalmPressable>
              )}
              <CalmPressable style={[styles.resetBtn, styles.cardShadow, { marginBottom: 10 }]} onPress={() => router.push('/journal')}>
                <Text style={styles.resetText}>{t('journal.title')}</Text>
              </CalmPressable>
              <CalmPressable style={[styles.resetBtn, styles.cardShadow, { marginBottom: 10 }]} onPress={exportMyJournal}>
                <Text style={styles.resetText}>{t('data.export')}</Text>
              </CalmPressable>
              <CalmPressable style={styles.dangerBtn} onPress={resetCoachMemory}>
                <Text style={styles.dangerText}>{t('memory.resetBtn')}</Text>
              </CalmPressable>
              <CalmPressable style={[styles.dangerBtn, { marginTop: 10 }]} onPress={deleteAllData}>
                <Text style={styles.dangerText}>{t('data.deleteAll')}</Text>
              </CalmPressable>
            </AccordionBody>
          )}
        </StaggerSection>

        {/* 5. Destek & Hakkında */}
        <StaggerSection delay={260}>
          <AccordionRow
            title={t('about.section')}
            summary={`${t('about.support')} · ${t('about.privacy')}`}
            isOpen={open === 'about'}
            onPress={() => toggle('about')}
          />
          {open === 'about' && (
            <AccordionBody>
              {/* Stoa üyeliği (15 Kasım 2026): numara ilk açılışta sunucudan bir kez alınır */}
              {memberNo != null && (
                <View style={[styles.memberCard, styles.cardShadow]}>
                  <Text style={styles.memberLabel}>{t('stoa.memberRow')}</Text>
                  <Text style={styles.memberNo}>
                    {`${t('stoa.memberNo')} ${memberNo.toLocaleString(localeOf(lang))}`}
                    {isFounder(memberNo) ? ` · ${t('stoa.founder')}` : ''}
                  </Text>
                </View>
              )}
              <View style={[styles.aboutCard, styles.cardShadow]}>
                {[
                  { icon: 'share', label: t('about.share'), onPress: shareApp },
                  ...(storeUrl ? [{ icon: 'star', label: t('about.rate'), onPress: rateApp }] : []),
                  { icon: 'mail', label: t('about.support'), onPress: contactSupport },
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
                    accessibilityRole="button"
                  >
                    {SVG_ICONS[r.icon]
                      ? <View style={styles.aboutIconBox}>{React.createElement(SVG_ICONS[r.icon], { size: 18, color: Colors.sand })}</View>
                      : <Text style={styles.aboutIcon}>{r.icon}</Text>}
                    <Text style={styles.aboutLabel}>{r.label}</Text>
                    <Text style={styles.aboutArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </AccordionBody>
          )}
        </StaggerSection>

        <StaggerSection delay={310}>
          <Text style={styles.versionText}>{t('about.version')} {APP_VERSION}</Text>

          {/* Yönetici — onay kuyruğu (yalnızca sahibi). Meydan Okuma gizliyken gösterilmez. */}
          {FEATURES.meydanOkuma && (
            <View style={[styles.adminWrap, styles.cardShadow]}>
              <Text style={styles.adminTitle}>{t('admin.title')}</Text>
              <Text style={styles.adminHint}>{t('admin.hint')}</Text>
              <View style={styles.adminRow}>
                <TextInput
                  keyboardAppearance={Colors.isDark ? 'dark' : 'light'}
                  style={styles.adminInput}
                  placeholder={t('admin.placeholder')}
                  placeholderTextColor={Colors.muted}
                  value={adminKey}
                  onChangeText={setAdminKey}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[styles.adminBtn, !adminKey.trim() && { opacity: 0.4 }]}
                  onPress={openAdmin}
                  disabled={!adminKey.trim()}
                >
                  <Text style={styles.adminBtnText}>{t('admin.open')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </StaggerSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 270 },
  scroll: { padding: 24, paddingBottom: 52 },

  cardShadow: !Colors.isDark
    ? Platform.select({
        ios: { shadowColor: '#1D2A2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
        android: { elevation: 2 },
        default: {},
      })
    : {},

  backRow: { flexDirection: 'row', marginTop: 4, marginBottom: 14 },
  backBtn: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.stone2, borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  backIcon: { fontFamily: Fonts.jostLight, fontSize: 26, color: Colors.sand2, marginTop: -2 },
  header: { marginBottom: 24 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 28, color: Colors.text, letterSpacing: 0.3, lineHeight: 34, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.muted, letterSpacing: 0.2, lineHeight: 21 },

  // Dil seçici
  langWrap: { marginBottom: 20 },
  langTitle: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.muted, marginBottom: 10 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.stone2,
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.overlay(0.08),
  },
  langChipActive: { backgroundColor: Colors.tint(0.18), borderColor: Colors.accent },
  langFlag: { fontSize: 16 },
  langLabel: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.text2 },
  langLabelActive: { color: Colors.accent },

  // Bildirim kartı
  notifyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.stone2, borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.tint(0.18),
  },
  notifyCardOff: { opacity: 0.7 },
  timesCard: {
    backgroundColor: Colors.stone2, borderRadius: 18, paddingHorizontal: 16,
    marginTop: -10, marginBottom: 20, borderWidth: 1, borderColor: Colors.tint(0.12),
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
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

  // Aksiyon düğmeleri
  helpRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  helpBtn: { flex: 1, borderColor: Colors.tint(0.45), backgroundColor: Colors.stone3 },
  helpText: { color: Colors.sand2 },
  resetBtn: {
    backgroundColor: Colors.stone2, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  resetText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.text2, letterSpacing: 0.3, textAlign: 'center' },
  dangerBtn: {
    minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(214,120,100,0.35)', backgroundColor: 'rgba(214,120,100,0.06)',
  },
  dangerText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.danger, letterSpacing: 0.3 },

  // Katlanır bölüm satırları
  accRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 70,
    paddingHorizontal: 18, paddingVertical: 15, marginBottom: 10,
    backgroundColor: Colors.stone2, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  accRowOpen: { borderColor: Colors.tint(0.45), backgroundColor: Colors.stone3 },
  accSum: { fontFamily: Fonts.jost, fontSize: 14, lineHeight: 20, color: Colors.muted, marginTop: 4 },
  accChev: { fontFamily: Fonts.jostLight, fontSize: 24, lineHeight: 26, color: Colors.sand2 },
  accBody: { paddingTop: 8, paddingBottom: 14 },
  secText: { fontFamily: Fonts.jostMedium, fontSize: 13, letterSpacing: 2.5, color: Colors.sand2 },

  // Destek & Hakkında
  dataNote: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 19, color: Colors.text2, marginBottom: 14 },
  aboutCard: {
    backgroundColor: Colors.stone2, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.overlay(0.06), overflow: 'hidden',
  },
  aboutRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  aboutRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.overlay(0.05) },
  aboutIcon: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand, width: 22, textAlign: 'center' },
  aboutIconBox: { width: 22, alignItems: 'center' },
  aboutLabel: { flex: 1, fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2 },
  aboutArrow: { fontFamily: Fonts.jostLight, fontSize: 20, color: Colors.muted },
  memberCard: { backgroundColor: Colors.tint(0.08), borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 12 },
  memberLabel: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted },
  memberNo: { fontFamily: Fonts.cormorant, fontSize: 21, color: Colors.text, marginTop: 2 },
  versionText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 14 },

  // Yönetici
  adminWrap: {
    marginTop: 18, backgroundColor: Colors.stone2, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  adminTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.text2, marginBottom: 4 },
  adminHint: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, lineHeight: 16, marginBottom: 10 },
  adminRow: { flexDirection: 'row', gap: 8 },
  adminInput: {
    flex: 1, backgroundColor: Colors.stone3, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9,
    fontFamily: Fonts.jost, fontSize: 12, color: Colors.text, borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  adminBtn: {
    backgroundColor: Colors.stone4, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.overlay(0.08),
  },
  adminBtnText: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand2 },
});
