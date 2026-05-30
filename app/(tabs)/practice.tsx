import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../constants/theme';
import { useLang } from '../../constants/i18n';
import { getExercises, getDailyConcept, Exercise } from '../../constants/content';

const COMPLETED_KEY = 'stoikos_completed_';
const JOURNAL_KEY = 'stoikos_journal_';

// ─── ExerciseItem ──────────────────────────────────────────
function ExerciseItem({
  exercise, completed, onToggle,
}: {
  exercise: Exercise;
  completed: boolean;
  onToggle: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle();
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View style={[styles.exItem, completed && styles.exItemDone, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.exCheck, completed && styles.exCheckDone]}>
          {completed && <Text style={styles.exCheckMark}>✓</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.exHeader}>
            <Text style={[styles.exName, completed && styles.exNameDone]}>{exercise.name}</Text>
            <Text style={styles.exDuration}>{exercise.duration}</Text>
          </View>
          <Text style={styles.exDesc}>{exercise.desc}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function PracticeScreen() {
  const { t, lang } = useLang();
  const today = new Date().toDateString();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [journal, setJournal] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
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

  const hour = new Date().getHours();
  const isMorning = hour < 14;

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
            <Text style={styles.title}>{t('practice.title')}</Text>
            <Text style={styles.subtitle}>
              {isMorning ? t('practice.morningSub') : t('practice.eveningSub')}
            </Text>
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
              <Text style={styles.sectionIcon}>🌅</Text>
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
              <ExerciseItem
                key={ex.id}
                exercise={ex}
                completed={completed.has(ex.id)}
                onToggle={() => toggleExercise(ex.id)}
              />
            ))}
          </View>

          {/* Evening */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌙</Text>
              <View>
                <Text style={styles.sectionTag}>{t('practice.eveningTag')}</Text>
                <Text style={styles.sectionTitle}>{t('practice.eveningTitle')}</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {EVENING_EXERCISES.filter((e) => completed.has(e.id)).length}/{EVENING_EXERCISES.length}
                </Text>
              </View>
            </View>
            {EVENING_EXERCISES.map((ex) => (
              <ExerciseItem
                key={ex.id}
                exercise={ex}
                completed={completed.has(ex.id)}
                onToggle={() => toggleExercise(ex.id)}
              />
            ))}
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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  scroll: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 8 },
  title: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.3 },

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

  // Exercise item
  exItem: {
    flexDirection: 'row', gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    alignItems: 'flex-start',
  },
  exItemDone: { opacity: 0.6 },
  exCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: 'rgba(196,169,106,0.35)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  exCheckDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  exCheckMark: { fontSize: 11, color: Colors.stone, fontWeight: '700' },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  exName: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.text },
  exNameDone: { textDecorationLine: 'line-through', color: Colors.muted },
  exDuration: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.muted, letterSpacing: 0.5 },
  exDesc: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.text2, lineHeight: 17 },

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
