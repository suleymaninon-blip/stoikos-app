import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Animated, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../../constants/theme';

// ─── Data ─────────────────────────────────────────────────
const MORNING_EXERCISES = [
  {
    id: 'neg_vis',
    name: 'Negatif Görselleştirme',
    desc: 'Bugün kaybedebileceklerini düşün — sağlık, sevdiklerin, işin. Sahip olduklarının değerini hisset.',
    duration: '3 dk',
  },
  {
    id: 'intention',
    name: 'Sabah Niyeti',
    desc: 'Bugün kontrolümde olan tek şey kendi tepkilerim ve kararlarım. Dışarıdaki her şey benim değil.',
    duration: '2 dk',
  },
  {
    id: 'memento',
    name: 'Memento Mori',
    desc: 'Bu gün tekrar gelmeyecek. Nasıl yaşamak istiyorsun? Ne bırakmak istiyorsun?',
    duration: '2 dk',
  },
];

const EVENING_EXERCISES = [
  {
    id: 'review',
    name: 'Günün Muhasebesi',
    desc: 'Bugün kontrolündeki şeylerde nasıl davrandın? Nerede daha iyi olabilirdin?',
    duration: '5 dk',
  },
  {
    id: 'gratitude',
    name: 'Stoacı Şükran',
    desc: 'Bugün sıradan görünen ama aslında değerli olan üç şeyi hatırla.',
    duration: '3 dk',
  },
];

const CONCEPTS = [
  { latin: 'Amor Fati', tr: 'Kaderini Sev', desc: 'Her olayı — acı veren ya da keyifli — olması gerektiği gibi kabul et. Dirençten değil kabulden güç doğar.' },
  { latin: 'Memento Mori', tr: 'Ölümü Hatırla', desc: 'Ölümlülüğünü hatırlamak, her anı daha bilinçli yaşamanı sağlar. Bu bir karamsarlık değil, uyanıklıktır.' },
  { latin: 'Premeditatio Malorum', tr: 'Kötülükleri Önceden Düşün', desc: 'Olası zorlukları zihinsel olarak prova etmek, onlarla karşılaştığında hazırlıklı olmanı sağlar.' },
  { latin: 'Dichotomy of Control', tr: 'Kontrol Dairesi', desc: 'Her şeyi iki kategoriye ayır: kontrolündeki ve kontrolün dışındaki. Enerjini yalnızca birincisine ver.' },
  { latin: 'Eudaimonia', tr: 'Mutlu Yaşam', desc: 'Stoacılıkta mutluluk dış koşullara değil, erdemli yaşamaya dayanır. Gerçek huzur içten gelir.' },
  { latin: 'Sympatheia', tr: 'Evrensel Bağ', desc: 'Her şey birbirine bağlıdır. Başkalarına zarar vermek kendine zarar vermektir. Bütünün parçasısın.' },
  { latin: 'Logos', tr: 'Evrensel Akıl', desc: 'Evreni yöneten bir düzen vardır. Akla uygun yaşamak bu düzenle uyum içinde olmaktır.' },
];

const TODAY_CONCEPT_KEY = 'stoikos_concept_day';
const COMPLETED_KEY = 'stoikos_completed_';

// ─── ExerciseItem ──────────────────────────────────────────
function ExerciseItem({
  exercise, completed, onToggle,
}: {
  exercise: typeof MORNING_EXERCISES[0];
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
  const today = new Date().toDateString();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [concept, setConcept] = useState(CONCEPTS[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  async function loadData() {
    // Load completed exercises
    const raw = await AsyncStorage.getItem(COMPLETED_KEY + today);
    if (raw) setCompleted(new Set(JSON.parse(raw)));

    // Daily concept rotation
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setConcept(CONCEPTS[dayOfYear % CONCEPTS.length]);
  }

  async function toggleExercise(id: string) {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
    await AsyncStorage.setItem(COMPLETED_KEY + today, JSON.stringify([...next]));
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Günlük Pratik</Text>
            <Text style={styles.subtitle}>
              {isMorning ? 'Sabah egzersizleri' : 'Akşam yansıması'}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>BUGÜNKÜ İLERLEME</Text>
              <Text style={styles.progressCount}>{doneCount}/{totalCount}</Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            {doneCount === totalCount && doneCount > 0 && (
              <Text style={styles.allDoneText}>✦ Tüm pratikler tamamlandı — iyi iş!</Text>
            )}
          </View>

          {/* Morning */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌅</Text>
              <View>
                <Text style={styles.sectionTag}>SABAH</Text>
                <Text style={styles.sectionTitle}>Güne Başlarken</Text>
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
                <Text style={styles.sectionTag}>AKŞAM</Text>
                <Text style={styles.sectionTitle}>Günü Kapatırken</Text>
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

          {/* Concept of the day */}
          <View style={styles.conceptCard}>
            <Text style={styles.conceptTag}>GÜNÜN KAVRAMI</Text>
            <Text style={styles.conceptLatin}>{concept.latin}</Text>
            <Text style={styles.conceptTr}>{concept.tr}</Text>
            <View style={styles.conceptDivider} />
            <Text style={styles.conceptDesc}>{concept.desc}</Text>
          </View>

        </ScrollView>
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
