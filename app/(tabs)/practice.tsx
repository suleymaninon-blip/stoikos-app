import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, TextInput,
  KeyboardAvoidingView, Platform, Modal, Pressable, AppState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { JOURNAL_KEY, journalKeyFor } from '../../constants/journal';
import { DayPartIcon, DayPart } from '../../components/Icons';
import { useLang } from '../../constants/i18n';
import { getExercises, getDailyConcept, Exercise } from '../../constants/content';
import { getTodaysReflectionPrompt } from '../../constants/content';
import { addReflectionToMemory } from '../../constants/api';
import { ConceptModal } from '../../components/ConceptModal';

const COMPLETED_KEY = 'stoikos_completed_';
// JOURNAL_KEY artık constants/journal.ts'te (program kapanışı da yazıyor).
// Açıklaması en az bir kez açılmış egzersizler. İlk kez işaretlenen egzersizde kutucuk
// doğrudan işaretlemez, önce açıklamayı açar (kullanıcı kararı, 29 Ekim 2026).
const SEEN_KEY = 'stoikos_ex_seen';
const COACH_CONSENT_KEY = 'stoikos_journal_coach_consent'; // açık rıza (KVKK), varsayılan kapalı

// Sabah altın, akşam ay mavisi — bölüm etiketleri (moonTag/moonBadge) zaten
// bu ayrımı yapıyor, ikonlar da ona uyuyor.
const ICON_COLOR: Record<DayPart, string> = { morning: Colors.sand, evening: Colors.moon };

// ─── Liste satırı: daire işaretler, satır açar ───────────
// Eskiden daire de satır da aynı pencereyi açıyordu; işaretlemek de işareti
// kaldırmak da iki dokunuş + pencere istiyordu (Ekim 2026 akış revizyonu).
// Artık gerçek bir onay kutusu: tek dokunuşla işaretler/kaldırır, yanlış
// dokunuş alttaki "Geri al" şeridiyle düzeltilir. Satırın geri kalanı egzersizi açar.
// Çizim de kare (köşeleri yuvarlatılmış): yuvarlak daire radyo düğmesi gibi
// okunuyor, "birini seçince öbürü kalkar" beklentisi doğuruyordu; oysa egzersizler
// birbirinden bağımsız işaretleniyor. Tasarım: https://claude.ai/artifact/9MjkgTit1x6nSu6VBRPgWU
function ExerciseRow({
  exercise, completed, icon, onToggle, onOpen, markLabel, openLabel,
}: {
  exercise: Exercise;
  completed: boolean;
  icon: DayPart;
  onToggle: () => void;
  onOpen: () => void;
  markLabel: string;
  openLabel: string;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        style={styles.rowCheckHit}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={markLabel}
      >
        {({ pressed }) => (
          <View style={[styles.rowCheck, completed && styles.rowCheckDone, pressed && styles.rowCheckPressed]}>
            {completed && (
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={Colors.stone} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </View>
        )}
      </Pressable>
      <TouchableOpacity
        onPress={onOpen}
        activeOpacity={0.7}
        style={styles.rowBody}
        accessibilityRole="button"
        accessibilityLabel={openLabel}
      >
        <View style={styles.rowIcon}><DayPartIcon part={icon} size={16} color={ICON_COLOR[icon]} /></View>
        <Text style={[styles.rowName, completed && styles.rowNameDone]} numberOfLines={1}>{exercise.name}</Text>
        <Text style={styles.rowDuration}>{exercise.duration}</Text>
        <Text style={styles.rowChevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Egzersiz sayfası (alttan açılır) ──────────────────────
// Okumak için. Tamamlanmamışsa ana düğme "Tamamladım"; tamamlandıysa ana düğme
// yerine durum ("Bugün tamamlandı") ve küçük bir "İşareti kaldır" bağlantısı.
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
          <View style={styles.modalIcon}><DayPartIcon part={icon} size={40} color={ICON_COLOR[icon]} /></View>
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
  const { t, lang } = useLang();
  const today = new Date().toDateString();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [journal, setJournal] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  // "Dünkü yansımana dönüş" (25 Ekim 2026, rekabet analizi: rakip kullanıcıları dünkü günlüğe
  // dönük bir takip istiyor). Dün yazılan not kartın başında kısaca gösterilir; yalnız cihazdan okunur.
  const [yesterdayNote, setYesterdayNote] = useState<string | null>(null);
  const [coachConsent, setCoachConsent] = useState(false); // yansımayı koça iletme izni
  const [selected, setSelected] = useState<(Exercise & { icon: DayPart }) | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [conceptOpen, setConceptOpen] = useState(false);
  // Alttaki "… tamamlandı · Geri al" şeridi; 4 sn sonra kaybolur.
  const [toast, setToast] = useState<{ id: string; name: string; done: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Otomatik kayıt (25 Ekim 2026, rekabet analizi: rakibin en acı 1★ şikâyeti "yazarken
  // uygulama kapandı, günlüğüm gitti"). Yazılan metin 0,8 sn duraksamada ve uygulama
  // arka plana geçerken cihaza yazılır. "Kaydet" düğmesi kalır: koça iletim (rıza varsa)
  // yalnız ona basınca yapılır, her tuşta değil.
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Akşam bildirimine dokununca `/practice?focus=journal` açılır → günlük kartına kaydır.
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const journalY = useRef<number | null>(null);
  const scrollToJournal = () => {
    if (journalY.current != null) scrollRef.current?.scrollTo({ y: Math.max(0, journalY.current - 16), animated: true });
  };
  useEffect(() => { if (focus === 'journal') setTimeout(scrollToJournal, 450); }, [focus]);
  const draftRef = useRef<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const { morning: MORNING_EXERCISES, evening: EVENING_EXERCISES } = getExercises(lang, t('unit.min'));
  const concept = getDailyConcept(lang);

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
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

    // İlk sürüm: daha önce işaretlenmiş egzersizler zaten biliniyor sayılır.
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

  // Kutucuk: ilk kez işaretlenecek egzersizde önce açıklama açılır; sonra hep doğrudan işaretler.
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
    if (done) next.add(id);
    else next.delete(id);
    setCompleted(next);
    await AsyncStorage.setItem(COMPLETED_KEY + today, JSON.stringify([...next]));
  }

  // İşaretle/kaldır + geri al şeridi. Onay sorulmuyor: yanlış dokunuş tek
  // dokunuşla geri alınabildiği için pencere gereksiz sürtünme olurdu.
  function markExercise(ex: Exercise, done: boolean) {
    setExerciseDone(ex.id, done);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: ex.id, name: ex.name, done });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  function undoToast() {
    if (!toast) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setExerciseDone(toast.id, !toast.done);
    setToast(null);
  }

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
    setJournalSaved(true);
    // Yalnız kullanıcı açık rıza verdiyse koç hafızasına işlenir (KVKK).
    if (coachConsent) addReflectionToMemory(lang, txt);
  }

  const allExercises = [...MORNING_EXERCISES, ...EVENING_EXERCISES];
  const totalCount = allExercises.length;
  const doneCount = allExercises.filter((e) => completed.has(e.id)).length;
  const progress = totalCount > 0 ? doneCount / totalCount : 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(196,169,106,0.06)', 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('practice.calmTitle')}</Text>
            <Text style={styles.intro}>{t('practice.intro')}</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{t('practice.todayProgress')}</Text>
              <Text style={styles.progressCount}>{doneCount}/{totalCount}</Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            {doneCount === totalCount && doneCount > 0 && (
              <Text style={styles.allDoneText}>{t('practice.allDone')}</Text>
            )}
          </View>

          {/* Morning */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><DayPartIcon part="morning" size={22} color={ICON_COLOR.morning} /></View>
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
            {MORNING_EXERCISES.map((ex) => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                icon="morning"
                completed={completed.has(ex.id)}
                onToggle={() => tapCheckbox(ex, 'morning')}
                onOpen={() => openExercise({ ...ex, icon: 'morning' })}
                markLabel={t('practice.markA11y', { name: ex.name })}
                openLabel={t('practice.openA11y', { name: ex.name })}
              />
            ))}
          </View>

          {/* Evening */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><DayPartIcon part="evening" size={22} color={ICON_COLOR.evening} /></View>
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
            {EVENING_EXERCISES.map((ex) => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                icon="evening"
                completed={completed.has(ex.id)}
                onToggle={() => tapCheckbox(ex, 'evening')}
                onOpen={() => openExercise({ ...ex, icon: 'evening' })}
                markLabel={t('practice.markA11y', { name: ex.name })}
                openLabel={t('practice.openA11y', { name: ex.name })}
              />
            ))}
          </View>


          {/* Daily journal */}
          <View style={styles.journalCard} onLayout={(e) => { journalY.current = e.nativeEvent.layout.y; if (focus === 'journal') scrollToJournal(); }}>
            <View style={styles.journalHeader}>
              <Text style={styles.journalTag}>{t('practice.journalTag')}</Text>
              <TouchableOpacity onPress={() => router.push('/journal')} hitSlop={8} activeOpacity={0.7}>
                <Text style={styles.journalHistoryLink}>{t('practice.journalHistory')}</Text>
              </TouchableOpacity>
            </View>
            {/* Günün yansıma sorusu — 28'lik setten döner (content.ts).
                Eskiden burada her gün aynı sabit cümle vardı; günlük katmanın
                hiç değişmemesi 36. günde uygulamayı 6. günle aynı yapıyordu. */}
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
              <Text style={styles.journalSaveBtnText}>{journalSaved ? t('practice.saved') : t('practice.save')}</Text>
            </TouchableOpacity>

            {/* Açık rıza (KVKK) — varsayılan kapalı; yalnız açıkken yansıma koça iletilir */}
            <TouchableOpacity style={styles.consentRow} onPress={toggleCoachConsent} activeOpacity={0.7} accessibilityRole="checkbox" accessibilityState={{ checked: coachConsent }}>
              <View style={[styles.consentBox, coachConsent && styles.consentBoxOn]}>
                {coachConsent && <Text style={styles.consentCheck}>✓</Text>}
              </View>
              <Text style={styles.consentLabel}>{t('practice.journalConsent')}</Text>
            </TouchableOpacity>
            <Text style={styles.journalCoachNote}>{t('practice.journalConsentNote')}</Text>
          </View>

          {/* Concept of the day */}
          <View style={styles.conceptCard}>
            <Text style={styles.conceptTag}>{t('practice.conceptTag')}</Text>
            <Text style={styles.conceptLatin}>{concept.latin}</Text>
            <Text style={styles.conceptTr}>{concept.name}</Text>
            <View style={styles.conceptDivider} />
            {/* Yalnız ilk paragraf; tam metin Bilgelik'teki kavram penceresinde (22 Ekim 2026:
                tam metin sayfayı ~4 ekran boyuna uzatıyordu). */}
            <Text style={styles.conceptDesc}>{concept.desc.split('\n\n')[0]}</Text>
            <TouchableOpacity onPress={() => setConceptOpen(true)} style={styles.conceptMoreBtn} hitSlop={8} accessibilityRole="button">
              <Text style={styles.conceptMore}>{t('practice.readMore')}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>

      <ConceptModal concept={conceptOpen ? concept : null} onClose={() => setConceptOpen(false)} />

      {/* Seçili egzersiz yokken sayfa zaten null dönüyor; icon yedeği tip için. */}
      <ExerciseSheet
        exercise={selected}
        icon={selected?.icon ?? 'morning'}
        completed={selected ? completed.has(selected.id) : false}
        onComplete={() => { if (selected) { markExercise(selected, true); setSelected(null); } }}
        onUnmark={() => { if (selected) { markExercise(selected, false); setSelected(null); } }}
        onClose={() => setSelected(null)}
        labels={{ complete: t('practice.complete'), doneToday: t('practice.doneToday'), unmark: t('practice.unmark'), close: t('practice.close') }}
      />

      {toast && (
        <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
          <Text style={styles.toastText} numberOfLines={2}>
            {t(toast.done ? 'practice.toastDone' : 'practice.toastUndone', { name: toast.name })}
          </Text>
          <TouchableOpacity onPress={undoToast} style={styles.toastBtn} accessibilityRole="button">
            <Text style={styles.toastBtnText}>{t('practice.undoShort')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  scroll: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 8 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 28, color: Colors.text, letterSpacing: 0.3, marginBottom: 8, lineHeight: 34 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.3 },
  intro: { fontFamily: Fonts.jost, fontSize: 15, color: Colors.text2, lineHeight: 23 },

  // Progress
  progressWrap: { marginBottom: 28 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.muted },
  progressCount: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand },
  progressTrack: { height: 3, backgroundColor: Colors.stone3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  allDoneText: { fontFamily: Fonts.cormorantItalic, fontSize: 16, color: Colors.sand, marginTop: 8, textAlign: 'center' },

  // Section
  section: {
    backgroundColor: Colors.stone2, borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionIcon: { width: 22, height: 22 },
  sectionTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.sand, marginBottom: 2 },
  sectionTitle: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.text, letterSpacing: 0.3 },
  sectionBadge: {
    marginLeft: 'auto', backgroundColor: 'rgba(196,169,106,0.1)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)',
  },
  sectionBadgeText: { fontFamily: Fonts.cinzel, fontSize: 11, color: Colors.sand },
  // Akşam — ay-mavisi aksan
  moonTag: { color: Colors.moon },
  moonBadge: { backgroundColor: 'rgba(159,176,196,0.1)', borderColor: 'rgba(159,176,196,0.25)' },
  moonBadgeText: { color: Colors.moon },

  // Nazik kapanış kartı

  // Sade satır
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  // Dokunma alanı 44×48; görünen daire 26 px.
  rowCheckHit: { width: 44, height: 48, marginLeft: -9, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 48, paddingLeft: 2 },
  // Onay kutusu: kare, 7 px köşe. Boş kenar 3:1'in üstünde kalsın diye %70.
  rowCheck: {
    width: 26, height: 26, borderRadius: 7,
    borderWidth: 1.5, borderColor: 'rgba(201,168,118,0.7)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowCheckDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  rowCheckPressed: { transform: [{ scale: 0.92 }], backgroundColor: 'rgba(201,168,118,0.18)', borderColor: Colors.accent },
  rowIcon: { width: 16, height: 16 },
  rowName: { flex: 1, fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.text },
  rowNameDone: { color: Colors.muted },
  rowDuration: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.3 },
  rowChevron: { fontSize: 20, color: Colors.stone4, marginLeft: 2 },

  // Rehberli kart (modal)
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: Colors.stone2, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 28, paddingTop: 12, paddingBottom: 36, alignItems: 'center',
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(196,169,106,0.25)',
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 8 },
  sheetClose: { position: 'absolute', top: 14, right: 16, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone3 },
  sheetCloseText: { fontSize: 16, color: Colors.text2 },
  sheetDoneBox: {
    width: '100%', borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.45)',
  },
  sheetDoneText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.sand2 },
  sheetUnmark: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', marginTop: 6 },
  sheetUnmarkText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, textDecorationLine: 'underline' },

  // Geri al şeridi
  toast: {
    position: 'absolute', left: 16, right: 16, bottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.stone3, borderRadius: 16, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.35)',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  toastText: { flex: 1, fontFamily: Fonts.jost, fontSize: 14, color: Colors.text, lineHeight: 19 },
  toastBtn: { minWidth: 88, minHeight: 44, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  toastBtnText: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.sand2, letterSpacing: 0.3 },
  modalIcon: { marginBottom: 8 },
  modalDuration: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.sand, marginBottom: 6 },
  modalName: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, textAlign: 'center', letterSpacing: 0.3 },
  modalDivider: { width: 40, height: 2, backgroundColor: 'rgba(196,169,106,0.4)', borderRadius: 1, marginVertical: 18 },
  modalDesc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand3, lineHeight: 26, textAlign: 'center', marginBottom: 26 },
  modalBtn: {
    width: '100%', backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  modalBtnText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.stone },

  // Journal
  journalCard: {
    backgroundColor: Colors.stone2, borderRadius: 20, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(159,176,196,0.15)',
  },
  journalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  journalTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2.5, color: 'rgba(159,176,196,0.8)' },
  journalHistoryLink: { fontFamily: Fonts.jostMedium, fontSize: 11, color: 'rgba(159,176,196,0.9)', letterSpacing: 0.3 },
  journalHint: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 24, marginBottom: 12 },
  yesterdayBox: {
    borderLeftWidth: 2, borderLeftColor: 'rgba(159,176,196,0.45)', paddingLeft: 12, paddingVertical: 4,
    marginTop: 6, marginBottom: 14,
  },
  yesterdayTag: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 1.5, color: 'rgba(159,176,196,0.75)', marginBottom: 4 },
  yesterdayText: { fontFamily: Fonts.cormorantItalic, fontSize: 17, color: Colors.text2, lineHeight: 24 },
  yesterdayAsk: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, marginTop: 6 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, minHeight: 44 },
  consentBox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(159,176,196,0.5)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  consentBoxOn: { backgroundColor: 'rgba(159,176,196,0.85)', borderColor: 'rgba(159,176,196,0.85)' },
  consentCheck: { fontSize: 12, color: '#0c1116', fontFamily: Fonts.jostMedium, marginTop: -1 },
  consentLabel: { flex: 1, fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2, lineHeight: 19 },
  journalCoachNote: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2, lineHeight: 19, marginTop: 8 },
  journalInput: {
    backgroundColor: Colors.stone3, borderRadius: 12, padding: 14,
    fontFamily: Fonts.jost, fontSize: 16, color: Colors.text, lineHeight: 24,
    minHeight: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 12,
  },
  journalSaveBtn: {
    backgroundColor: 'rgba(159,176,196,0.15)', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(159,176,196,0.25)',
  },
  journalSaveBtnDim: { opacity: 0.5 },
  journalSaveBtnText: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.moon, letterSpacing: 0.5 },

  // Concept
  conceptCard: {
    backgroundColor: Colors.stone2, borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.18)',
  },
  conceptTag: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2.5, color: Colors.sand, marginBottom: 10 },
  conceptLatin: { fontFamily: Fonts.cormorantItalic, fontSize: 30, color: Colors.sand2, letterSpacing: 0.5, marginBottom: 2 },
  conceptTr: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.5, marginBottom: 14 },
  conceptDivider: { height: 1, backgroundColor: 'rgba(196,169,106,0.12)', marginBottom: 14 },
  conceptDesc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 26 },
  conceptMoreBtn: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: 4 },
  conceptMore: { fontFamily: Fonts.jostMedium, fontSize: 16, color: Colors.sand2 },

  // Shared
  cormorantItalic: { fontFamily: Fonts.cormorantItalic },
});
