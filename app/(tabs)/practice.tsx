import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, TextInput,
  KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../constants/theme';
import { useLang } from '../../constants/i18n';
import { getExercises, getDailyConcept, Exercise } from '../../constants/content';

const COMPLETED_KEY = 'stoikos_completed_';
const JOURNAL_KEY = 'stoikos_journal_';

// ─── Sade liste satırı (dokununca rehberli kart açılır) ────
function ExerciseRow({
  exercise, completed, icon, onOpen, tapHint,
}: {
  exercise: Exercise;
  completed: boolean;
  icon: string;
  onOpen: () => void;
  tapHint: string;
}) {
  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.7} style={styles.row}>
      <View style={[styles.rowCheck, completed && styles.rowCheckDone]}>
        {completed && <Text style={styles.rowCheckMark}>✓</Text>}
      </View>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowName, completed && styles.rowNameDone]} numberOfLines={1}>{exercise.name}</Text>
      <Text style={styles.rowDuration}>{exercise.duration}</Text>
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Rehberli kart (modal) ─────────────────────────────────
function ExerciseModal({
  exercise, icon, completed, onToggle, onClose, labels,
}: {
  exercise: (Exercise & { icon: string }) | null;
  icon: string;
  completed: boolean;
  onToggle: () => void;
  onClose: () => void;
  labels: { complete: string; undo: string; done: string };
}) {
  if (!exercise) return null;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalIcon}>{icon}</Text>
          <Text style={styles.modalDuration}>{exercise.duration}</Text>
          <Text style={styles.modalName}>{exercise.name}</Text>
          <View style={styles.modalDivider} />
          <Text style={styles.modalDesc}>{exercise.desc}</Text>

          <TouchableOpacity
            style={[styles.modalBtn, completed && styles.modalBtnDone]}
            onPress={onToggle}
            activeOpacity={0.85}
          >
            <Text style={[styles.modalBtnText, completed && styles.modalBtnTextDone]}>
              {completed ? labels.undo : labels.complete}
            </Text>
          </TouchableOpacity>

          {completed && <Text style={styles.modalDoneNote}>✦ {labels.done}</Text>}
        </Pressable>
      </Pressable>
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
  const [selected, setSelected] = useState<(Exercise & { icon: string }) | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
  }

  async function toggleExercise(id: string) {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
    await AsyncStorage.setItem(COMPLETED_KEY + today, JSON.stringify([...next]));
  }

  async function saveJournal() {
    if (!journal.trim()) return;
    await AsyncStorage.setItem(JOURNAL_KEY + today, journal.trim());
    setJournalSaved(true);
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
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
      />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

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
              <Text style={styles.sectionIcon}>☀</Text>
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
                icon="☀"
                completed={completed.has(ex.id)}
                onOpen={() => setSelected({ ...ex, icon: '☀' })}
                tapHint={t('practice.tapHint')}
              />
            ))}
          </View>

          {/* Evening */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌙</Text>
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
                icon="🌙"
                completed={completed.has(ex.id)}
                onOpen={() => setSelected({ ...ex, icon: '🌙' })}
                tapHint={t('practice.tapHint')}
              />
            ))}
          </View>

          {/* Nazik kapanış */}
          <View style={styles.closeCard}>
            <Text style={styles.closeQuote}>“{t('practice.closeQuote')}”</Text>
            <Text style={styles.closeSub}>{t('practice.closeSub')}</Text>
          </View>

          {/* Daily journal */}
          <View style={styles.journalCard}>
            <Text style={styles.journalTag}>{t('practice.journalTag')}</Text>
            <Text style={styles.journalHint}>{t('practice.journalHint')}</Text>
            <TextInput
              style={styles.journalInput}
              placeholder={t('practice.journalPlaceholder')}
              placeholderTextColor={Colors.stone4}
              value={journal}
              onChangeText={(txt) => { setJournal(txt); setJournalSaved(false); }}
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
          </View>

          {/* Concept of the day */}
          <View style={styles.conceptCard}>
            <Text style={styles.conceptTag}>{t('practice.conceptTag')}</Text>
            <Text style={styles.conceptLatin}>{concept.latin}</Text>
            <Text style={styles.conceptTr}>{concept.name}</Text>
            <View style={styles.conceptDivider} />
            <Text style={styles.conceptDesc}>{concept.desc}</Text>
          </View>

        </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>

      <ExerciseModal
        exercise={selected}
        icon={selected?.icon || ''}
        completed={selected ? completed.has(selected.id) : false}
        onToggle={() => { if (selected) toggleExercise(selected.id); }}
        onClose={() => setSelected(null)}
        labels={{ complete: t('practice.complete'), undo: t('practice.undo'), done: t('practice.done') }}
      />
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
  intro: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2, lineHeight: 20 },

  // Progress
  progressWrap: { marginBottom: 28 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.muted },
  progressCount: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand },
  progressTrack: { height: 3, backgroundColor: Colors.stone3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  allDoneText: { fontFamily: Fonts.cormorantItalic, fontSize: 12, color: Colors.sand, marginTop: 8, textAlign: 'center' },

  // Section
  section: {
    backgroundColor: Colors.stone2, borderRadius: 20,
    padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionIcon: { fontSize: 22 },
  sectionTag: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.sand, marginBottom: 2 },
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
  closeCard: {
    backgroundColor: 'rgba(194,168,120,0.06)', borderRadius: 20, padding: 22, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.12)', alignItems: 'center',
  },
  closeQuote: { fontFamily: Fonts.cormorantItalic, fontSize: 19, color: Colors.sand2, textAlign: 'center', lineHeight: 26, marginBottom: 8 },
  closeSub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, textAlign: 'center' },

  // Sade satır
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(196,169,106,0.4)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  rowCheckDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  rowCheckMark: { fontSize: 12, color: Colors.stone, fontWeight: '700' },
  rowIcon: { fontSize: 16 },
  rowName: { flex: 1, fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.text },
  rowNameDone: { color: Colors.muted },
  rowDuration: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.5 },
  rowChevron: { fontSize: 20, color: Colors.stone4, marginLeft: 2 },

  // Rehberli kart (modal)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  modalCard: {
    width: '100%', backgroundColor: Colors.stone2, borderRadius: 26, padding: 30, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)',
  },
  modalIcon: { fontSize: 44, marginBottom: 8 },
  modalDuration: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 2, color: Colors.sand, marginBottom: 6 },
  modalName: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, textAlign: 'center', letterSpacing: 0.3 },
  modalDivider: { width: 40, height: 2, backgroundColor: 'rgba(196,169,106,0.4)', borderRadius: 1, marginVertical: 18 },
  modalDesc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand3, lineHeight: 26, textAlign: 'center', marginBottom: 26 },
  modalBtn: {
    width: '100%', backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  modalBtnDone: { backgroundColor: Colors.stone3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtnText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.stone },
  modalBtnTextDone: { color: Colors.muted },
  modalDoneNote: { fontFamily: Fonts.cormorantItalic, fontSize: 14, color: Colors.sand, marginTop: 14 },

  // Journal
  journalCard: {
    backgroundColor: Colors.stone2, borderRadius: 20, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(100,160,220,0.15)',
  },
  journalTag: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2.5, color: 'rgba(100,160,220,0.8)', marginBottom: 6 },
  journalHint: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, lineHeight: 17, marginBottom: 12 },
  journalInput: {
    backgroundColor: Colors.stone3, borderRadius: 12, padding: 14,
    fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, lineHeight: 21,
    minHeight: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 12,
  },
  journalSaveBtn: {
    backgroundColor: 'rgba(100,160,220,0.15)', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(100,160,220,0.25)',
  },
  journalSaveBtnDim: { opacity: 0.5 },
  journalSaveBtnText: { fontFamily: Fonts.jostMedium, fontSize: 12, color: 'rgba(140,190,240,0.9)', letterSpacing: 0.5 },

  // Concept
  conceptCard: {
    backgroundColor: Colors.stone2, borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.18)',
  },
  conceptTag: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2.5, color: Colors.sand, marginBottom: 10 },
  conceptLatin: { fontFamily: Fonts.cormorantItalic, fontSize: 30, color: Colors.sand2, letterSpacing: 0.5, marginBottom: 2 },
  conceptTr: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.5, marginBottom: 14 },
  conceptDivider: { height: 1, backgroundColor: 'rgba(196,169,106,0.12)', marginBottom: 14 },
  conceptDesc: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.text2, lineHeight: 19 },

  // Shared
  cormorantItalic: { fontFamily: Fonts.cormorantItalic },
});
