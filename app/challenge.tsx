import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, TextInput, StyleSheet,
  SafeAreaView, Modal, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';
import { listChallenge, likeChallenge, submitQuote, ChallengeQuote } from '../constants/api';
import { QuoteShareModal, ShareableQuote } from '../components/QuoteShareModal';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ChallengeScreen() {
  const { t, lang } = useLang();
  const [sort, setSort] = useState<'top' | 'new'>('top');
  const [items, setItems] = useState<ChallengeQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [share, setShare] = useState<ShareableQuote | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await listChallenge(lang, sort));
    setLoading(false);
  }, [lang, sort]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [sort]);

  async function toggleLike(q: ChallengeQuote) {
    const res = await likeChallenge(q.id);
    setItems((prev) => prev.map((x) => x.id === q.id ? { ...x, liked: res.liked, likes: res.likes } : x));
  }

  function renderItem({ item, index }: { item: ChallengeQuote; index: number }) {
    const rank = sort === 'top' ? index + 1 : null;
    const medal = rank && rank <= 3 ? MEDALS[rank - 1] : null;
    const shareable = sort === 'top' && rank !== null && rank <= 10;
    return (
      <View style={[styles.card, medal && styles.cardTop]}>
        <View style={styles.cardHead}>
          {rank !== null && (
            <Text style={[styles.rank, medal && styles.rankMedal]}>{medal || rank}</Text>
          )}
          <Text style={styles.quoteText}>"{item.text}"</Text>
        </View>
        <View style={styles.cardFoot}>
          <Text style={styles.author}>— {item.author || t('ch.anon')}</Text>
          <View style={styles.actions}>
            {shareable && (
              <TouchableOpacity onPress={() => setShare({ text: item.text, author: item.author || t('ch.anon'), source: t('ch.title') })} style={styles.iconBtn}>
                <Text style={styles.iconTxt}>↗</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => toggleLike(item)} style={[styles.likeBtn, item.liked && styles.likeBtnOn]}>
              <Text style={[styles.likeIcon, item.liked && styles.likeIconOn]}>♥</Text>
              <Text style={[styles.likeCount, item.liked && styles.likeIconOn]}>{item.likes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(212,146,74,0.07)', 'transparent']} style={styles.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.4 }} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setWriting(true)} style={styles.writeBtn}><Text style={styles.writeTxt}>{t('ch.write')}</Text></TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{t('ch.title')}</Text>
        <Text style={styles.subtitle}>{t('ch.subtitle')}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabBtn, sort === 'top' && styles.tabActive]} onPress={() => setSort('top')}>
          <Text style={[styles.tabTxt, sort === 'top' && styles.tabTxtActive]}>{t('ch.top')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, sort === 'new' && styles.tabActive]} onPress={() => setSort('new')}>
          <Text style={[styles.tabTxt, sort === 'new' && styles.tabTxtActive]}>{t('ch.new')}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.sand} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(q) => String(q.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<Text style={styles.hint}>{t('ch.hint')}</Text>}
          ListEmptyComponent={<Text style={styles.empty}>{t('ch.empty')}</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}

      <WriteModal visible={writing} onClose={() => setWriting(false)} onDone={load} lang={lang} t={t} />
      <QuoteShareModal quote={share} tagline={t('setup.tagline')} shareLabel={t('share.button')} closeLabel={t('wisdom.close')} onClose={() => setShare(null)} />
    </SafeAreaView>
  );
}

function WriteModal({ visible, onClose, onDone, lang, t }: any) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function submit() {
    if (text.trim().length < 8) return;
    setBusy(true); setResult(null);
    const r = await submitQuote(lang, text.trim(), author.trim());
    setBusy(false);
    if (r.status === 'pending') {
      setResult({ ok: true, msg: t('ch.pending') });
      setText(''); setAuthor('');
      onDone();
    } else {
      setResult({ ok: false, msg: `${t('ch.rejected')} ${r.reason || ''}` });
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.writeCard} onPress={() => {}}>
            <Text style={styles.writeTitle}>{t('ch.writeTitle')}</Text>
            <TextInput style={styles.writeInput} placeholder={t('ch.placeholder')} placeholderTextColor={Colors.stone4}
              value={text} onChangeText={(v) => { setText(v); setResult(null); }} multiline maxLength={220} textAlignVertical="top" />
            <TextInput style={styles.authorInput} placeholder={t('ch.authorPlaceholder')} placeholderTextColor={Colors.stone4}
              value={author} onChangeText={setAuthor} maxLength={40} />
            {result && <Text style={[styles.result, result.ok ? styles.resultOk : styles.resultErr]}>{result.msg}</Text>}
            <TouchableOpacity style={[styles.submitBtn, (text.trim().length < 8 || busy) && styles.submitDim]} onPress={submit} disabled={text.trim().length < 8 || busy}>
              {busy ? <ActivityIndicator size="small" color={Colors.stone} /> : <Text style={styles.submitTxt}>{t('ch.submit')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}><Text style={styles.closeTxt}>{t('wisdom.close')}</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, height: 48 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  backIcon: { fontSize: 26, color: Colors.sand2, marginTop: -3 },
  writeBtn: { backgroundColor: Colors.accent, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  writeTxt: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.stone, letterSpacing: 0.5 },
  header: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 10 },
  title: { fontFamily: Fonts.cinzel, fontSize: 24, color: Colors.text, letterSpacing: 0.5 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, marginTop: 2 },
  tabs: { flexDirection: 'row', marginHorizontal: 24, marginBottom: 8, backgroundColor: Colors.stone2, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.stone4 },
  tabTxt: { fontFamily: Fonts.cinzel, fontSize: 12, color: Colors.muted, letterSpacing: 0.5 },
  tabTxtActive: { color: Colors.sand2 },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  hint: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, lineHeight: 18, marginBottom: 6, paddingHorizontal: 2 },
  empty: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: Colors.stone2, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardTop: { borderColor: 'rgba(196,169,106,0.4)', backgroundColor: 'rgba(212,146,74,0.07)' },
  cardHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  rank: { fontFamily: Fonts.cinzel, fontSize: 16, color: Colors.muted, width: 28, textAlign: 'center', marginTop: 2 },
  rankMedal: { fontSize: 20 },
  quoteText: { flex: 1, fontFamily: Fonts.cormorantItalic, fontSize: 17, lineHeight: 25, color: Colors.sand3 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  author: { flex: 1, fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(196,169,106,0.1)', borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)' },
  iconTxt: { fontSize: 14, color: Colors.sand },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.stone3, borderRadius: 17, paddingHorizontal: 12, height: 34, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  likeBtnOn: { backgroundColor: 'rgba(212,146,74,0.18)', borderColor: Colors.accent },
  likeIcon: { fontSize: 14, color: Colors.muted },
  likeIconOn: { color: Colors.accent },
  likeCount: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.text2 },
  // write modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 26 },
  writeCard: { width: '100%', backgroundColor: Colors.stone2, borderRadius: 22, padding: 24, borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)', alignItems: 'center' },
  writeTitle: { fontFamily: Fonts.cinzel, fontSize: 18, color: Colors.sand2, marginBottom: 16, textAlign: 'center' },
  writeInput: { width: '100%', minHeight: 90, backgroundColor: Colors.stone3, borderRadius: 12, padding: 14, fontFamily: Fonts.cormorantItalic, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 10 },
  authorInput: { width: '100%', backgroundColor: Colors.stone3, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 12 },
  result: { fontFamily: Fonts.jost, fontSize: 12.5, marginBottom: 12, lineHeight: 18, alignSelf: 'flex-start' },
  resultOk: { color: Colors.success }, resultErr: { color: '#e08080' },
  submitBtn: { width: '100%', backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  submitDim: { opacity: 0.4 },
  submitTxt: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1, color: Colors.stone },
  closeTxt: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.muted },
});
