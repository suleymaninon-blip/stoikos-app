import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Modal, Pressable,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';
import { getPrograms, getProgress, setDayDone, Program } from '../constants/programs';

export default function ProgramsScreen() {
  const { t, lang } = useLang();
  const programs = getPrograms(lang);
  const [progress, setProgress] = useState<Record<string, number[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    const entries = await Promise.all(programs.map(async (p) => [p.id, await getProgress(p.id)] as const));
    setProgress(Object.fromEntries(entries));
  }, [lang]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const open = openId ? programs.find((p) => p.id === openId) : null;

  async function toggleDay(pid: string, idx: number) {
    const done = (progress[pid] || []).includes(idx);
    const next = await setDayDone(pid, idx, !done);
    setProgress((prev) => ({ ...prev, [pid]: next }));
  }

  function isUnlocked(pid: string, idx: number): boolean {
    if (idx === 0) return true;
    return (progress[pid] || []).includes(idx - 1);
  }

  // ─── DETAY ───
  if (open) {
    const done = progress[open.id] || [];
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[open.color, 'transparent']} style={styles.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setOpenId(null)} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.detailIcon}>{open.icon}</Text>
          <Text style={styles.detailTitle}>{open.title}</Text>
          <Text style={styles.detailSub}>{open.subtitle}</Text>
          <Text style={styles.detailProgress}>{t('programs.progress', { done: done.length, total: open.dayCount })}</Text>
          {done.length === open.dayCount && <Text style={styles.finished}>{t('programs.finished')}</Text>}

          <View style={{ marginTop: 18 }}>
            {open.days.map((d, i) => {
              const unlocked = isUnlocked(open.id, i);
              const completed = done.includes(i);
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayRow, !unlocked && styles.dayRowLocked]}
                  onPress={() => unlocked && setDayIdx(i)}
                  activeOpacity={unlocked ? 0.7 : 1}
                >
                  <View style={[styles.dayNum, completed && styles.dayNumDone, !unlocked && styles.dayNumLocked]}>
                    <Text style={[styles.dayNumText, completed && styles.dayNumTextDone]}>{completed ? '✓' : unlocked ? i + 1 : '🔒'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayLabel}>{t('programs.day')} {i + 1}</Text>
                    <Text style={[styles.dayTitle, !unlocked && styles.dayTitleLocked]}>{unlocked ? d.title : t('programs.locked')}</Text>
                  </View>
                  {unlocked && <Text style={styles.dayChevron}>›</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Gün kartı */}
        <Modal transparent visible={dayIdx !== null} animationType="fade" onRequestClose={() => setDayIdx(null)}>
          <Pressable style={styles.modalOverlay} onPress={() => setDayIdx(null)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {dayIdx !== null && (() => {
                const d = open.days[dayIdx];
                const completed = done.includes(dayIdx);
                return (
                  <>
                    <Text style={styles.modalDayLabel}>{t('programs.dayOf', { n: dayIdx + 1, total: open.dayCount })}</Text>
                    <Text style={styles.modalTitle}>{d.title}</Text>
                    <View style={styles.modalDivider} />
                    <Text style={styles.modalBody}>{d.body}</Text>
                    <TouchableOpacity
                      style={[styles.modalBtn, completed && styles.modalBtnDone]}
                      onPress={() => toggleDay(open.id, dayIdx)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.modalBtnText, completed && styles.modalBtnTextDone]}>
                        {completed ? t('programs.undo') : t('programs.complete')}
                      </Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  // ─── LİSTE ───
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(196,169,106,0.06)', 'transparent']} style={styles.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('programs.title')}</Text>
        <Text style={styles.subtitle}>{t('programs.subtitle')}</Text>

        <View style={{ marginTop: 20, gap: 14 }}>
          {programs.map((p) => {
            const done = (progress[p.id] || []).length;
            const pct = done / p.dayCount;
            const label = done === 0 ? t('programs.start') : done === p.dayCount ? t('programs.review') : t('programs.continue');
            return (
              <TouchableOpacity key={p.id} style={[styles.card, { backgroundColor: p.color }]} onPress={() => setOpenId(p.id)} activeOpacity={0.85}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardIcon}>{p.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{p.title}</Text>
                    <Text style={styles.cardSub}>{p.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.cardTrack}><View style={[styles.cardFill, { width: `${pct * 100}%` }]} /></View>
                <View style={styles.cardFoot}>
                  <Text style={styles.cardProgress}>{t('programs.progress', { done, total: p.dayCount })}</Text>
                  <Text style={styles.cardCta}>{label} →</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },
  topBar: { paddingHorizontal: 16, paddingTop: 8, height: 44, justifyContent: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  backIcon: { fontSize: 26, color: Colors.sand2, marginTop: -3 },
  scroll: { padding: 24, paddingTop: 8, paddingBottom: 40 },
  title: { fontFamily: Fonts.cinzel, fontSize: 24, color: Colors.text, letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },

  // Liste kartı
  card: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  cardIcon: { fontSize: 30, color: Colors.sand2 },
  cardTitle: { fontFamily: Fonts.cinzel, fontSize: 17, color: Colors.text, letterSpacing: 0.3, marginBottom: 2 },
  cardSub: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.text2 },
  cardTrack: { height: 4, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  cardFill: { height: '100%', backgroundColor: Colors.sand, borderRadius: 2 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardProgress: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.muted },
  cardCta: { fontFamily: Fonts.cinzel, fontSize: 12, color: Colors.sand2, letterSpacing: 0.5 },

  // Detay
  detailIcon: { fontSize: 44, color: Colors.sand2, textAlign: 'center' },
  detailTitle: { fontFamily: Fonts.cinzel, fontSize: 24, color: Colors.text, textAlign: 'center', letterSpacing: 0.4, marginTop: 8 },
  detailSub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 4 },
  detailProgress: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand, textAlign: 'center', letterSpacing: 1, marginTop: 12 },
  finished: { fontFamily: Fonts.cormorantItalic, fontSize: 15, color: Colors.sand, textAlign: 'center', marginTop: 8 },

  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.stone2, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dayRowLocked: { opacity: 0.55 },
  dayNum: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'rgba(196,169,106,0.4)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dayNumDone: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayNumLocked: { borderColor: 'rgba(255,255,255,0.12)' },
  dayNumText: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.sand2 },
  dayNumTextDone: { color: Colors.stone },
  dayLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 1.5, color: Colors.muted, marginBottom: 2 },
  dayTitle: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.text },
  dayTitleLocked: { color: Colors.muted, fontFamily: Fonts.jost },
  dayChevron: { fontSize: 20, color: Colors.stone4 },

  // Gün modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  modalCard: { width: '100%', backgroundColor: Colors.stone2, borderRadius: 26, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)' },
  modalDayLabel: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 2, color: Colors.sand, marginBottom: 8 },
  modalTitle: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, textAlign: 'center', letterSpacing: 0.3 },
  modalDivider: { width: 40, height: 2, backgroundColor: 'rgba(196,169,106,0.4)', borderRadius: 1, marginVertical: 18 },
  modalBody: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.sand3, lineHeight: 26, textAlign: 'center', marginBottom: 26 },
  modalBtn: { width: '100%', backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  modalBtnDone: { backgroundColor: Colors.stone3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalBtnText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.stone },
  modalBtnTextDone: { color: Colors.muted },
});
