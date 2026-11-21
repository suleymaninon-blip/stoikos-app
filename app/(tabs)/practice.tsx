import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, Easing, TextInput,
  KeyboardAvoidingView, Platform, Modal, Pressable, AppState, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { reportPulse } from '../../constants/stoa';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Fonts } from '../../constants/theme';
import { useTheme, useStyles, type Palette } from '../../constants/themeContext';
import { FirstTip } from '../../components/FirstTip';
import { JOURNAL_KEY, journalKeyFor, thisMonthStats, type MonthStats } from '../../constants/journal';
import { DoneMark } from '../../components/DoneMark';
import { DayPartIcon, DayPart } from '../../components/Icons';
import { useLang, localeOf } from '../../constants/i18n';
import { getExercises, getDailyConcept, Exercise } from '../../constants/content';
import { getTodaysReflectionPrompt } from '../../constants/content';
import { addReflectionToMemory } from '../../constants/api';
import { ConceptModal } from '../../components/ConceptModal';
import { ConceptGlyph } from '../../components/ConceptGlyph';
import { PAPER } from '../../components/EmbossTile';
import { StaggerSection } from '../../components/StaggerSection';
import { useReduceMotion } from '../../hooks/useReduceMotion';

const COMPLETED_KEY = 'stoikos_completed_';
const SEEN_KEY = 'stoikos_ex_seen';
// JOURNAL_KEY artık constants/journal.ts'te (program kapanışı da yazıyor).
// Açıklaması en az bir kez açılmış egzersizler. İlk kez işaretlenen egzersizde kutucuk
// doğrudan işaretlemez, önce açıklamayı açar (kullanıcı kararı, 29 Ekim 2026).
const COACH_CONSENT_KEY = 'stoikos_journal_coach_consent'; // açık rıza (KVKK), varsayılan kapalı

const iconColor = (C: Palette, part: DayPart) => (part === 'morning' ? C.sand : C.moon);

// ─── Liste satırı: kutucuk işaretler (yaylanarak), satır açar ───────────
// Tek dokunuşla işaretler/kaldırır, yanlış dokunuş alttaki "Geri al" şeridiyle düzeltilir.
// Kare çizim bilerek: yuvarlak daire radyo düğmesi gibi okunuyordu (egzersizler bağımsız).
// Tasarım: https://claude.ai/artifact/9MjkgTit1x6nSu6VBRPgWU
function ExerciseRow({
  exercise, completed, icon, onToggle, onOpen, markLabel, openLabel, isLast,
}: {
  exercise: Exercise;
  completed: boolean;
  icon: DayPart;
  onToggle: () => void;
  onOpen: () => void;
  markLabel: string;
  openLabel: string;
  isLast?: boolean;
}) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const checkScale = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);
  const reduce = useReduceMotion();

  // İşaret değişince kutucuk bir kez hafifçe yaylanır ("Hareketi Azalt"ta yok).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (reduce) return;
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1.18, speed: 40, bounciness: 10, useNativeDriver: true }),
      Animated.spring(checkScale, { toValue: 1, speed: 28, bounciness: 6, useNativeDriver: true }),
    ]).start();
  }, [completed, checkScale, reduce]);

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Pressable
        onPress={onToggle}
        style={styles.rowCheckHit}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={markLabel}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              styles.rowCheck,
              completed && styles.rowCheckDone,
              pressed && styles.rowCheckPressed,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            {completed && (
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke={Colors.stone}
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </Animated.View>
        )}
      </Pressable>
      <TouchableOpacity
        onPress={onOpen}
        activeOpacity={0.7}
        style={styles.rowBody}
        accessibilityRole="button"
        accessibilityLabel={openLabel}
      >
        <View style={styles.rowIcon}>
          <DayPartIcon part={icon} size={16} color={iconColor(Colors, icon)} />
        </View>
        <Text style={[styles.rowName, completed && styles.rowNameDone]} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.rowDuration}>{exercise.duration}</Text>
        <Text style={styles.rowChevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Egzersiz sayfası (alttan açılır) ──────────────────────
function ExerciseSheet({
  exercise, icon, completed, onComplete, onUnmark, onClose, labels,
}: {
  exercise: (Exercise & { icon: DayPart }) | null;
  icon: DayPart;
  completed: boolean;
  onComplete: () => void;
  onUnmark: () => void;
  onClose: () => void;
  labels: { complete: string; doneToday: string; unmark: string; close: string };
}) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  if (!exercise) return null;
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetWrap}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={labels.close} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <TouchableOpacity onPress={onClose} style={styles.sheetClose} accessibilityRole="button" accessibilityLabel={labels.close} hitSlop={6}>
            <Text style={styles.sheetCloseText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.modalIcon}><DayPartIcon part={icon} size={40} color={iconColor(Colors, icon)} /></View>
          <Text style={styles.modalDuration}>{exercise.duration}</Text>
          <Text style={styles.modalName}>{exercise.name}</Text>
          <View style={styles.modalDivider} />
          <Text style={styles.modalDesc}>{exercise.desc}</Text>

          {completed ? (
            <>
              <View style={styles.sheetDoneBox} accessibilityRole="text">
                <Text style={styles.sheetDoneText}>✓ {labels.doneToday}</Text>
              </View>
              <TouchableOpacity onPress={onUnmark} style={styles.sheetUnmark} accessibilityRole="button">
                <Text style={styles.sheetUnmarkText}>{labels.unmark}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.modalBtn} onPress={onComplete} activeOpacity={0.85} accessibilityRole="button">
              <Text style={styles.modalBtnText}>{labels.complete}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function PracticeScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const reduceMotion = useReduceMotion();
  const today = new Date().toDateString();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [journal, setJournal] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  const [savedStats, setSavedStats] = useState<MonthStats | null>(null);
  const [yesterdayNote, setYesterdayNote] = useState<string | null>(null);
  const [coachConsent, setCoachConsent] = useState(false);
  const [selected, setSelected] = useState<(Exercise & { icon: DayPart }) | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [conceptOpen, setConceptOpen] = useState(false);
  const [toast, setToast] = useState<{ id: string; name: string; done: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const rootRef = useRef<View>(null);
  const firstRowRef = useRef<View>(null);
  const journalY = useRef<number | null>(null);
  const scrollToJournal = () => {
    if (journalY.current != null) scrollRef.current?.scrollTo({ y: Math.max(0, journalY.current - 16), animated: true });
  };
  useEffect(() => { if (focus === 'journal') setTimeout(scrollToJournal, 450); }, [focus]);
  const draftRef = useRef<string | null>(null);

  // Akıcı ilerleme çubuğu, toast ve kayıt kartı animasyonları
  const progressAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const savedCardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const { morning: MORNING_EXERCISES, evening: EVENING_EXERCISES } = getExercises(lang, t('unit.min'));
  const concept = getDailyConcept(lang);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const raw = await AsyncStorage.getItem(COMPLETED_KEY + today);
    if (raw) setCompleted(new Set(JSON.parse(raw)));

    const journalRaw = await AsyncStorage.getItem(JOURNAL_KEY + today);
    if (journalRaw) { setJournal(journalRaw); setJournalSaved(true); }

    const y = new Date(); y.setDate(y.getDate() - 1);
    const yRaw = (await AsyncStorage.getItem(journalKeyFor(y)))?.trim();
    setYesterdayNote(yRaw ? yRaw.replace(/\s+/g, ' ') : null);

    const consent = await AsyncStorage.getItem(COACH_CONSENT_KEY);
    setCoachConsent(consent === '1');

    const seenRaw = await AsyncStorage.getItem(SEEN_KEY);
    if (seenRaw) setSeen(new Set(JSON.parse(seenRaw)));
    else {
      const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(COMPLETED_KEY));
      const ids = new Set<string>();
      for (const [, v] of await AsyncStorage.multiGet(keys)) for (const id of JSON.parse(v || '[]')) ids.add(id);
      setSeen(ids);
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...ids])).catch(() => {});
    }
  }

  function openExercise(ex: Exercise & { icon: DayPart }) {
    setSelected(ex);
    if (!seen.has(ex.id)) {
      const next = new Set(seen).add(ex.id);
      setSeen(next);
      AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...next])).catch(() => {});
    }
  }

  function tapCheckbox(ex: Exercise, part: DayPart) {
    const isDone = completed.has(ex.id);
    if (!isDone && !seen.has(ex.id)) openExercise({ ...ex, icon: part });
    else markExercise(ex, !isDone);
  }

  async function toggleCoachConsent() {
    const next = !coachConsent;
    setCoachConsent(next);
    await AsyncStorage.setItem(COACH_CONSENT_KEY, next ? '1' : '0');
  }

  async function setExerciseDone(id: string, done: boolean) {
    const next = new Set(completed);
    if (done) { next.add(id); reportPulse('practice'); }
    else next.delete(id);
    setCompleted(next);
    await AsyncStorage.setItem(COMPLETED_KEY + today, JSON.stringify([...next]));
  }

  function markExercise(ex: Exercise, done: boolean) {
    setExerciseDone(ex.id, done);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: ex.id, name: ex.name, done });
    toastAnim.stopAnimation();
    if (reduceMotion) toastAnim.setValue(1);
    else {
      toastAnim.setValue(0);
      Animated.spring(toastAnim, { toValue: 1, speed: 22, bounciness: 5, useNativeDriver: true }).start();
    }
    toastTimer.current = setTimeout(() => {
      if (reduceMotion) { setToast(null); return; }
      // Sönerken yeni bir işaret gelirse bu animasyon durur (finished=false) ve yeni şerit silinmez.
      Animated.timing(toastAnim, { toValue: 0, duration: 240, useNativeDriver: true })
        .start(({ finished }) => { if (finished) setToast(null); });
    }, 4000);
  }

  function undoToast() {
    if (!toast) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastAnim.stopAnimation();
    setExerciseDone(toast.id, !toast.done);
    setToast(null);
  }

  // Otomatik kayıt (25 Ekim 2026, rekabet analizi: rakibin en acı 1★ şikâyeti "günlüğüm gitti").
  // 0,8 sn duraksamada ve arka plana geçerken cihaza yazılır. Koça iletim (rıza varsa) yalnız "Kaydet"te.
  async function persistDraft() {
    if (draftTimer.current) { clearTimeout(draftTimer.current); draftTimer.current = null; }
    const txt = draftRef.current;
    if (txt == null) return;
    draftRef.current = null;
    if (txt.trim()) await AsyncStorage.setItem(JOURNAL_KEY + today, txt);
    else await AsyncStorage.removeItem(JOURNAL_KEY + today);
  }

  function onJournalChange(txt: string) {
    setJournal(txt);
    setJournalSaved(false);
    setSavedStats(null);
    draftRef.current = txt;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => { persistDraft(); }, 800);
  }

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') persistDraft(); });
    return () => { sub.remove(); persistDraft(); };
  }, []);

  async function saveJournal() {
    if (draftTimer.current) { clearTimeout(draftTimer.current); draftTimer.current = null; }
    draftRef.current = null;
    const txt = journal.trim();
    if (!txt) return;
    await AsyncStorage.setItem(JOURNAL_KEY + today, txt);
    reportPulse('journal');
    setJournalSaved(true);
    thisMonthStats(lang, localeOf(lang))
      .then((stats) => {
        setSavedStats(stats);
        if (reduceMotion) { savedCardAnim.setValue(1); return; }
        savedCardAnim.setValue(0);
        Animated.timing(savedCardAnim, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      })
      .catch(() => { savedCardAnim.setValue(1); setSavedStats({ days: 1, words: 0, top: [] }); });
    // Yalnız kullanıcı açık rıza verdiyse koç hafızasına işlenir (KVKK).
    if (coachConsent) addReflectionToMemory(lang, txt);
  }

  const allExercises = [...MORNING_EXERCISES, ...EVENING_EXERCISES];
  const totalCount = allExercises.length;
  const doneCount = allExercises.filter((e) => completed.has(e.id)).length;
  const progress = totalCount > 0 ? doneCount / totalCount : 0;

  useEffect(() => {
    if (reduceMotion) { progressAnim.setValue(progress); return; }
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim, reduceMotion]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const toastTranslateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (
    <SafeAreaView ref={rootRef} style={styles.container}>
      <LinearGradient
        colors={[Colors.tint(Colors.isDark ? 0.08 : 0.09), 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* 1. Header + Progress */}
          <StaggerSection delay={0}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {t(new Date().getHours() < 18 ? 'practice.calmTitle' : 'practice.calmTitleEve')}
              </Text>
              <Text style={styles.intro}>{t('practice.intro')}</Text>
            </View>

            <View style={styles.progressWrap}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{t('practice.todayProgress')}</Text>
                <Text style={styles.progressCount}>{doneCount}/{totalCount}</Text>
              </View>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
              {doneCount === totalCount && doneCount > 0 && (
                <Text style={styles.allDoneText}>{t('practice.allDone')}</Text>
              )}
            </View>
          </StaggerSection>

          {/* 2. Morning */}
          <StaggerSection delay={90}>
            <View style={[styles.section, styles.cardShadow]}>
              <PaperBg />
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <DayPartIcon part="morning" size={22} color={iconColor(Colors, 'morning')} />
                </View>
                <View>
                  <Text style={styles.sectionTag}>{t('practice.morningTag')}</Text>
                  <Text style={styles.sectionTitle}>{t('practice.morningTitle')}</Text>
                </View>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>
                    {MORNING_EXERCISES.filter((e) => completed.has(e.id)).length}/{MORNING_EXERCISES.length}
                  </Text>
                </View>
              </View>
              {MORNING_EXERCISES.map((ex, i) => (
                <View key={ex.id} ref={i === 0 ? firstRowRef : undefined} collapsable={false}>
                  <ExerciseRow
                    exercise={ex}
                    icon="morning"
                    completed={completed.has(ex.id)}
                    onToggle={() => tapCheckbox(ex, 'morning')}
                    onOpen={() => openExercise({ ...ex, icon: 'morning' })}
                    markLabel={t('practice.markA11y', { name: ex.name })}
                    openLabel={t('practice.openA11y', { name: ex.name })}
                    isLast={i === MORNING_EXERCISES.length - 1}
                  />
                </View>
              ))}
            </View>
          </StaggerSection>

          {/* 3. Evening */}
          <StaggerSection delay={180}>
            <View style={[styles.section, styles.cardShadow]}>
              <PaperBg />
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <DayPartIcon part="evening" size={22} color={iconColor(Colors, 'evening')} />
                </View>
                <View>
                  <Text style={[styles.sectionTag, styles.moonTag]}>{t('practice.eveningTag')}</Text>
                  <Text style={styles.sectionTitle}>{t('practice.eveningTitle')}</Text>
                </View>
                <View style={[styles.sectionBadge, styles.moonBadge]}>
                  <Text style={[styles.sectionBadgeText, styles.moonBadgeText]}>
                    {EVENING_EXERCISES.filter((e) => completed.has(e.id)).length}/{EVENING_EXERCISES.length}
                  </Text>
                </View>
              </View>
              {EVENING_EXERCISES.map((ex, i) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  icon="evening"
                  completed={completed.has(ex.id)}
                  onToggle={() => tapCheckbox(ex, 'evening')}
                  onOpen={() => openExercise({ ...ex, icon: 'evening' })}
                  markLabel={t('practice.markA11y', { name: ex.name })}
                  openLabel={t('practice.openA11y', { name: ex.name })}
                  isLast={i === EVENING_EXERCISES.length - 1}
                />
              ))}
            </View>
          </StaggerSection>

          {/* 4. Daily journal */}
          {/* onLayout dıştaki bölümde: iç kartın y'si bölüme göre (0) olur, kaydırma yanlış yere giderdi. */}
          <StaggerSection
            delay={270}
            onLayout={(e) => {
              journalY.current = e.nativeEvent.layout.y;
              if (focus === 'journal') scrollToJournal();
            }}
          >
            <View style={[styles.journalCard, styles.cardShadow]}>
              <PaperBg />
              <View style={styles.journalHeader}>
                <Text style={styles.journalTag}>{t('practice.journalTag')}</Text>
                <TouchableOpacity onPress={() => router.push('/journal')} hitSlop={8} activeOpacity={0.7}>
                  <Text style={styles.journalHistoryLink}>{t('practice.journalHistory')}</Text>
                </TouchableOpacity>
              </View>

              {yesterdayNote && (
                <TouchableOpacity
                  style={styles.yesterdayBox}
                  onPress={() => router.push('/journal')}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('practice.yesterdayTag')}: ${yesterdayNote}`}
                >
                  <Text style={styles.yesterdayTag}>{t('practice.yesterdayTag')}</Text>
                  <Text style={styles.yesterdayText} numberOfLines={3}>“{yesterdayNote}”</Text>
                  <Text style={styles.yesterdayAsk}>{t('practice.yesterdayAsk')}</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.journalHint}>{getTodaysReflectionPrompt(lang)}</Text>
              <TextInput
                keyboardAppearance={Colors.isDark ? 'dark' : 'light'}
                style={styles.journalInput}
                placeholder={t('practice.journalPlaceholder')}
                placeholderTextColor={Colors.muted}
                value={journal}
                onChangeText={onJournalChange}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.journalSaveBtn, (!journal.trim() || journalSaved) && styles.journalSaveBtnDim]}
                onPress={saveJournal}
                disabled={!journal.trim() || journalSaved}
                activeOpacity={0.8}
              >
                <Text style={styles.journalSaveBtnText}>
                  {journalSaved ? t('practice.saved') : t('practice.save')}
                </Text>
              </TouchableOpacity>

              {savedStats && (
                <Animated.View
                  style={{
                    opacity: savedCardAnim,
                    transform: [{
                      translateY: savedCardAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
                    }],
                  }}
                >
                  <TouchableOpacity
                    style={styles.savedCard}
                    onPress={() => router.push('/journal')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLiveRegion="polite"
                  >
                    <DoneMark size={46} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedTitle}>{t('journal.savedTitle')}</Text>
                      <Text style={styles.savedSub}>
                        {t('journal.thisMonth')} —{' '}
                        {t('journal.monthStats')
                          .replace('{d}', String(savedStats.days))
                          .replace('{w}', String(savedStats.words))}
                      </Text>
                    </View>
                    <Text style={styles.savedArrow}>›</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              <TouchableOpacity
                style={styles.consentRow}
                onPress={toggleCoachConsent}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: coachConsent }}
              >
                <View style={[styles.consentBox, coachConsent && styles.consentBoxOn]}>
                  {coachConsent && <Text style={styles.consentCheck}>✓</Text>}
                </View>
                <Text style={styles.consentLabel}>{t('practice.journalConsent')}</Text>
              </TouchableOpacity>
              <Text style={styles.journalCoachNote}>{t('practice.journalConsentNote')}</Text>
            </View>
          </StaggerSection>

          {/* 5. Concept of the day */}
          <StaggerSection delay={360}>
            <View style={[styles.conceptCard, styles.cardShadow]}>
              <PaperBg />
              {/* Bilgelik'teki kavramlarla aynı dil (21 Kasım 2026): gravür çizimi + sönen ayırıcı */}
              <View style={styles.conceptHead}>
                <ConceptGlyph latin={concept.latin} fallback={concept.icon} size={48} color={Colors.sand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.conceptTag}>{t('practice.conceptTag')}</Text>
                  <Text style={styles.conceptLatin}>{concept.latin}</Text>
                  <Text style={styles.conceptTr}>{concept.name}</Text>
                </View>
              </View>
              <LinearGradient
                colors={['transparent', Colors.tint(0.45), 'transparent']}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={styles.conceptDivider}
              />
              {/* Yalnız ilk paragraf; tam metin kavram penceresinde (22 Ekim 2026). */}
              <Text style={styles.conceptDesc}>{concept.desc.split('\n\n')[0]}</Text>
              <TouchableOpacity
                onPress={() => setConceptOpen(true)}
                style={styles.conceptMoreBtn}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.conceptMore}>{t('practice.readMore')}</Text>
              </TouchableOpacity>
            </View>
          </StaggerSection>

        </ScrollView>
      </KeyboardAvoidingView>

      <ConceptModal concept={conceptOpen ? concept : null} onClose={() => setConceptOpen(false)} />

      <ExerciseSheet
        exercise={selected}
        icon={selected?.icon ?? 'morning'}
        completed={selected ? completed.has(selected.id) : false}
        onComplete={() => { if (selected) { markExercise(selected, true); setSelected(null); } }}
        onUnmark={() => { if (selected) { markExercise(selected, false); setSelected(null); } }}
        onClose={() => setSelected(null)}
        labels={{
          complete: t('practice.complete'),
          doneToday: t('practice.doneToday'),
          unmark: t('practice.unmark'),
          close: t('practice.close'),
        }}
      />

      {toast && (
        <Animated.View
          style={[
            styles.toast,
            { opacity: toastAnim, transform: [{ translateY: toastTranslateY }] },
          ]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <Text style={styles.toastText} numberOfLines={2}>
            {t(toast.done ? 'practice.toastDone' : 'practice.toastUndone', { name: toast.name })}
          </Text>
          <TouchableOpacity onPress={undoToast} style={styles.toastBtn} accessibilityRole="button">
            <Text style={styles.toastBtnText}>{t('practice.undoShort')}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <FirstTip
        id="practice"
        text={t('tip.practice')}
        target={firstRowRef}
        container={rootRef}
        enabled={MORNING_EXERCISES.length > 0}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
/** Kartın arkasında kâğıt dokusu (açık temada belirgin, koyuda çok soluk). Kart `overflow: 'hidden'` olmalı. */
function PaperBg() {
  const { C: Colors } = useTheme();
  return <ImageBackground source={PAPER} resizeMode="repeat" style={StyleSheet.absoluteFill} imageStyle={{ opacity: Colors.isDark ? 0.15 : 1 }} />;
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  scroll: { padding: 24, paddingBottom: 48 },

  cardShadow: !Colors.isDark
    ? Platform.select({
        ios: {
          shadowColor: '#1D2A2F',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        android: { elevation: 2 },
        default: {},
      })
    : {},

  header: { marginBottom: 24, marginTop: 8 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 30, color: Colors.text, letterSpacing: 0.3, marginBottom: 8, lineHeight: 36 },
  intro: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2, lineHeight: 23 },

  // Progress
  progressWrap: { marginBottom: 28 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.muted },
  progressCount: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand },
  progressTrack: { height: 5, backgroundColor: Colors.stone3, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 3 },
  allDoneText: { fontFamily: Fonts.cormorantItalic, fontSize: 16, color: Colors.sand, marginTop: 10, textAlign: 'center' },

  // Section
  // Kartlar açık temada krem "kâğıt" + doku (Bilgelik'le aynı, 21 Kasım 2026); koyuda yüzey rengi.
  section: {
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, borderRadius: 24, overflow: 'hidden',
    padding: 20, marginBottom: 18,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  sectionIcon: { width: 22, height: 22 },
  sectionTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.sand, marginBottom: 2 },
  sectionTitle: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.text, letterSpacing: 0.3 },
  sectionBadge: {
    marginLeft: 'auto', backgroundColor: Colors.tint(0.1),
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.tint(0.2),
  },
  sectionBadgeText: { fontFamily: Fonts.cinzel, fontSize: 11, color: Colors.sand },
  moonTag: { color: Colors.moon },
  moonBadge: { backgroundColor: Colors.moonA(0.1), borderColor: Colors.moonA(0.25) },
  moonBadgeText: { color: Colors.moon },

  // Row
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: Colors.overlay(0.05),
    paddingVertical: 2,
  },
  rowLast: { borderBottomWidth: 0 },
  rowCheckHit: { width: 44, height: 48, marginLeft: -9, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 48, paddingLeft: 2 },
  rowCheck: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.tint(0.7),
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowCheckDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  rowCheckPressed: { transform: [{ scale: 0.92 }], backgroundColor: Colors.tint(0.18), borderColor: Colors.accent },
  rowIcon: { width: 16, height: 16 },
  rowName: { flex: 1, fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.text },
  rowNameDone: { color: Colors.muted },
  rowDuration: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.3 },
  rowChevron: { fontSize: 20, color: Colors.stone4, marginLeft: 2 },

  // Sheet
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: Colors.stone2, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 28, paddingTop: 12, paddingBottom: 38, alignItems: 'center',
    borderWidth: 1, borderBottomWidth: 0, borderColor: Colors.tint(0.25),
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.overlay(0.14), marginBottom: 10 },
  sheetClose: {
    position: 'absolute', top: 14, right: 16, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone3,
  },
  sheetCloseText: { fontSize: 16, color: Colors.text2 },
  sheetDoneBox: {
    width: '100%', borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.tint(0.45),
  },
  sheetDoneText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.sand2 },
  sheetUnmark: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', marginTop: 6 },
  sheetUnmarkText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },

  // Toast
  toast: {
    position: 'absolute', left: 16, right: 16, bottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.stone3, borderRadius: 18, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.tint(0.35),
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  toastText: { flex: 1, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text, lineHeight: 19 },
  toastBtn: { minWidth: 88, minHeight: 44, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  toastBtnText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.sand2, letterSpacing: 0.3 },
  modalIcon: { marginBottom: 8 },
  modalDuration: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand, marginBottom: 6 },
  modalName: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, textAlign: 'center', letterSpacing: 0.3 },
  modalDivider: { width: 40, height: 2, backgroundColor: Colors.tint(0.4), borderRadius: 1, marginVertical: 18 },
  modalDesc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand3, lineHeight: 26, textAlign: 'center', marginBottom: 26 },
  modalBtn: {
    width: '100%', backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  modalBtnText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.stone },

  // Journal
  journalCard: {
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, borderRadius: 24, padding: 20, overflow: 'hidden',
    marginBottom: 18, borderWidth: 1, borderColor: Colors.moonA(0.16),
  },
  journalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  journalTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2.5, color: Colors.moonA(0.8) },
  journalHistoryLink: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.moonA(0.95), letterSpacing: 0.3 },
  journalHint: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 24, marginBottom: 14 },
  yesterdayBox: {
    borderLeftWidth: 2, borderLeftColor: Colors.moonA(0.45), paddingLeft: 12, paddingVertical: 4,
    marginTop: 6, marginBottom: 14,
  },
  yesterdayTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 1.5, color: Colors.moonA(0.75), marginBottom: 4 },
  yesterdayText: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 24 },
  yesterdayAsk: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 6 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, minHeight: 44 },
  consentBox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: Colors.moonA(0.5),
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent',
  },
  consentBoxOn: { backgroundColor: Colors.moonA(0.85), borderColor: Colors.moonA(0.85) },
  consentCheck: { fontSize: 12, color: Colors.isDark ? '#0c1116' : '#FFFFFF', fontFamily: Fonts.jostMedium, marginTop: -1 },
  consentLabel: { flex: 1, fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2, lineHeight: 19 },
  journalCoachNote: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2, lineHeight: 19, marginTop: 8 },
  journalInput: {
    backgroundColor: Colors.stone3, borderRadius: 14, padding: 14,
    fontFamily: Fonts.jost, fontSize: 16, color: Colors.text, lineHeight: 24,
    minHeight: 108, borderWidth: 1, borderColor: Colors.overlay(0.06), marginBottom: 12,
  },
  journalSaveBtn: {
    backgroundColor: Colors.moonA(0.15), borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.moonA(0.28),
  },
  journalSaveBtnDim: { opacity: 0.5 },
  savedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, minHeight: 64,
    backgroundColor: Colors.tint(0.07), borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: Colors.tint(0.16),
  },
  savedTitle: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.text },
  savedSub: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 3, lineHeight: 18 },
  savedArrow: { fontFamily: Fonts.jostLight, fontSize: 24, color: Colors.sand },
  journalSaveBtnText: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.moon, letterSpacing: 0.5 },

  // Concept
  conceptCard: {
    backgroundColor: Colors.isDark ? Colors.stone2 : Colors.stone, borderRadius: 24, padding: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.tint(0.18),
  },
  conceptHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  conceptTag: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.sand, marginBottom: 6 },
  conceptLatin: { fontFamily: Fonts.cormorant, fontSize: 30, lineHeight: 34, color: Colors.sand3 },
  conceptTr: { fontFamily: Fonts.cormorantItalic, fontSize: 18, lineHeight: 22, color: Colors.text2 },
  conceptDivider: { height: 1, marginBottom: 14 },
  conceptDesc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 26 },
  conceptMoreBtn: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: 6 },
  conceptMore: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.sand2 },

  // Shared
  cormorantItalic: { fontFamily: Fonts.cormorantItalic },
});
