import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, SafeAreaView, Animated, Modal, Pressable, useWindowDimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../../constants/theme';
import { useLocalSearchParams } from 'expo-router';
import { useLang, Lang } from '../../constants/i18n';
import { getQuotes, getConcepts, AUTHORS, Quote, Concept, conceptAudioKey } from '../../constants/content';
import { hasAudio, playAudio, stopAudio } from '../../constants/audio';
import { QuoteShareModal } from '../../components/QuoteShareModal';
import { getFavorites, toggleFavorite } from '../../constants/favorites';

// ─── QuoteCard ─────────────────────────────────────────────
function QuoteItem({ quote, onShare, isFav, onFav }: {
  quote: Quote; onShare: (q: Quote) => void;
  isFav: boolean; onFav: (id: string) => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.quoteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <View style={styles.quoteMeta}>
        <View style={{ flex: 1 }}>
          <Text style={styles.quoteAuthor}>{quote.author}</Text>
          <Text style={styles.quoteSource}>{quote.source}</Text>
        </View>
        <TouchableOpacity onPress={() => onFav(quote.id)} style={[styles.listenBtn, isFav && styles.favBtnActive]}>
          <Text style={[styles.listenIcon, isFav && styles.favIconActive]}>{isFav ? '♥' : '♡'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare(quote)} style={styles.listenBtn}>
          <Text style={styles.listenIcon}>↗</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── ConceptCard ───────────────────────────────────────────
function ConceptCard({ concept, onPress, moreLabel }: { concept: Concept; onPress: () => void; moreLabel: string }) {
  return (
    <TouchableOpacity style={[styles.conceptCard, { backgroundColor: concept.color }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.conceptIcon}>{concept.icon}</Text>
      <Text style={styles.conceptLatin}>{concept.latin}</Text>
      <Text style={styles.conceptTr}>{concept.name}</Text>
      <Text style={styles.conceptPreview} numberOfLines={2}>{concept.desc}</Text>
      <Text style={styles.conceptMore}>{moreLabel}</Text>
    </TouchableOpacity>
  );
}

// ─── Concept Modal ─────────────────────────────────────────
function ConceptModal({ concept, onClose, exampleLabel, practiceLabel, closeLabel, lang, playingKey, onToggle }: {
  concept: Concept | null; onClose: () => void; exampleLabel: string; practiceLabel: string; closeLabel: string;
  lang: Lang; playingKey: string | null; onToggle: (key: string) => void;
}) {
  if (!concept) return null;
  const key = conceptAudioKey(concept.latin, lang);
  const audio = hasAudio(key);
  const playing = playingKey === key;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Text style={styles.modalIcon}>{concept.icon}</Text>
            <Text style={styles.modalLatin}>{concept.latin}</Text>
            <Text style={styles.modalTr}>{concept.name}</Text>
            {audio && (
              <TouchableOpacity onPress={() => onToggle(key)} style={[styles.modalListenBtn, playing && styles.listenBtnActive]}>
                <Text style={styles.listenIcon}>{playing ? '⏹' : '🔊'}</Text>
              </TouchableOpacity>
            )}
            <View style={styles.modalDivider} />
            <Text style={styles.modalDesc}>{concept.desc}</Text>
            {concept.example ? (
              <View style={styles.modalExampleBox}>
                <Text style={styles.modalExampleLabel}>{exampleLabel}</Text>
                <Text style={styles.modalExample}>{concept.example}</Text>
              </View>
            ) : null}
            {concept.practice ? (
              <View style={styles.modalPracticeBox}>
                <Text style={styles.modalPracticeLabel}>{practiceLabel}</Text>
                <Text style={styles.modalPractice}>{concept.practice}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Text style={styles.modalCloseText}>{closeLabel}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Ruh hali temaları ────────────────────────────────────
const MOOD_THEMES = ['kaygi', 'ofke', 'yas', 'kabul', 'kontrol', 'ic-huzur', 'cesaret', 'sukran', 'sadelik'];

// Yatay tekerlek (silindir) seçici — yalnız parmakla kaydırma; yanlar perspektifle bükülür.
// Hem ruh hali hem filozof seçimi için ortak kullanılır. `opts` parent'ta memoize edilmeli.
function WheelSelector({ opts, value, onChange, itemW = 132 }: {
  opts: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  itemW?: number;
}) {
  const { width } = useWindowDimensions();
  const n = opts.length;
  const ITEM_W = itemW;
  const BAR_W = width - 48;          // marginHorizontal 24 + 24
  const SIDE = Math.max(0, (BAR_W - ITEM_W) / 2);

  // Sonsuz döngü: listeyi çoğalt; her oturmada ortadaki kopyaya dikişsiz geri merkezle.
  const REPEATS = 9;
  const MID = 4;
  const data = useMemo(() => {
    const a: { id: string; label: string }[] = [];
    for (let c = 0; c < REPEATS; c++) for (let i = 0; i < n; i++) a.push(opts[i]);
    return a;
  }, [opts, n]);

  const idx = Math.max(0, opts.findIndex((o) => o.id === value));
  const valueRef = useRef(value); valueRef.current = value;
  const optsRef = useRef(opts); optsRef.current = opts;
  const nRef = useRef(n); nRef.current = n;

  const scrollX = useRef(new Animated.Value((MID * n + idx) * ITEM_W)).current;
  const ref = useRef<any>(null);
  const settle = useRef<any>(null);
  const programmatic = useRef(false);

  const jump = (virtualIndex: number) => {
    programmatic.current = true;
    const x = virtualIndex * ITEM_W;
    ref.current?.scrollTo({ x, animated: false });
    scrollX.setValue(x);
    setTimeout(() => { programmatic.current = false; }, 140);
  };

  // Mount + dış değişim (ana ekran kısayolu): orta kopyada ilgili moda konumlan
  useEffect(() => {
    jump(MID * nRef.current + idx);
  }, [idx, ITEM_W]);

  const applyAt = (x: number) => {
    const N = nRef.current;
    const i = Math.round(x / ITEM_W);
    const moodIdx = ((i % N) + N) % N;
    const id = optsRef.current[moodIdx].id;
    if (id !== valueRef.current) {
      onChange(id); // useEffect orta kopyaya geri merkezler
    } else {
      const target = MID * N + moodIdx; // aynı mod ama kenara kaymış → dikişsiz geri al
      if (i !== target) jump(target);
    }
  };

  // Kaydırma durduğunda (her platform için güvenilir): son frame'den ~150ms sonra uygula
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        if (settle.current) clearTimeout(settle.current);
        settle.current = setTimeout(() => { if (!programmatic.current) applyAt(x); }, 150);
      },
    }
  );
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (settle.current) clearTimeout(settle.current);
    if (!programmatic.current) applyAt(e.nativeEvent.contentOffset.x);
  };

  return (
    <View style={[styles.moodBar, { width: BAR_W }]}>
      <Animated.ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_W}
        disableIntervalMomentum
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onEnd}
        onScrollEndDrag={onEnd}
        contentContainerStyle={{ paddingHorizontal: SIDE }}
      >
        {data.map((o, i) => {
          const inR = [(i - 1) * ITEM_W, i * ITEM_W, (i + 1) * ITEM_W];
          const animStyle = {
            opacity: scrollX.interpolate({ inputRange: inR, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' }),
            transform: [
              { perspective: 800 },
              { rotateY: scrollX.interpolate({ inputRange: inR, outputRange: ['36deg', '0deg', '-36deg'], extrapolate: 'clamp' }) },
              { scale: scrollX.interpolate({ inputRange: inR, outputRange: [0.82, 1, 0.82], extrapolate: 'clamp' }) },
            ],
          };
          return (
            <View key={i} style={[styles.moodItem, { width: ITEM_W }]}>
              <Animated.Text style={[styles.moodCurrent, animStyle]} numberOfLines={1}>{o.label}</Animated.Text>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function WisdomScreen() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<'quotes' | 'concepts'>('quotes');
  const [filter, setFilter] = useState('all'); // 'all' veya authorId
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [shareQuote, setShareQuote] = useState<Quote | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const quotes = getQuotes(lang);
  const concepts = getConcepts(lang);

  useEffect(() => { getFavorites().then(setFavorites); }, []);

  // Ana ekrandaki "Nasıl hissediyorsun?" kısayolundan gelen ruh hali
  const params = useLocalSearchParams<{ mood?: string }>();
  useEffect(() => {
    const m = Array.isArray(params.mood) ? params.mood[0] : params.mood;
    if (m) { setTab('quotes'); setFilter(`mood:${m}`); }
  }, [params.mood]);

  async function onFav(id: string) {
    setFavorites(await toggleFavorite(id));
  }

  // Ekrandan çıkınca / dil değişince sesi durdur
  useEffect(() => { return () => { stopAudio(); }; }, []);
  useEffect(() => { stopAudio(); setPlayingKey(null); }, [lang]);

  function togglePlay(key: string) {
    if (playingKey === key) {
      stopAudio();
      setPlayingKey(null);
    } else {
      setPlayingKey(key);
      playAudio(key, () => setPlayingKey(null));
    }
  }

  // Tekerlek seçenekleri (referans kararlılığı için memoize) — WheelSelector bunu bekler.
  const moodOpts = useMemo(
    () => [{ id: 'all', label: t('wisdom.all') }, ...MOOD_THEMES.map((m) => ({ id: `mood:${m}`, label: t(`mood.${m}`) }))],
    [t]
  );
  const authorOpts = useMemo(
    () => [
      { id: 'all', label: t('wisdom.all') },
      { id: 'fav', label: `♥ ${t('wisdom.favorites')}` },
      ...AUTHORS.map((a) => ({ id: a.id, label: a.name[lang] ?? a.name.en ?? a.id })),
    ],
    [t, lang]
  );

  const filteredQuotes =
    filter === 'all' ? quotes :
    filter === 'fav' ? quotes.filter((q) => favorites.includes(q.id)) :
    filter.startsWith('mood:') ? quotes.filter((q) => q.theme === filter.slice(5)) :
    quotes.filter((q) => q.authorId === filter);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(196,169,106,0.05)', 'transparent']}
        style={styles.grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('wisdom.title')}</Text>
        <Text style={styles.subtitle}>{t('wisdom.subtitle')}</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'quotes' && styles.tabBtnActive]} onPress={() => setTab('quotes')}>
          <Text style={[styles.tabBtnText, tab === 'quotes' && styles.tabBtnTextActive]}>{t('wisdom.tabQuotes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'concepts' && styles.tabBtnActive]} onPress={() => setTab('concepts')}>
          <Text style={[styles.tabBtnText, tab === 'concepts' && styles.tabBtnTextActive]}>{t('wisdom.tabConcepts')}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'quotes' ? (
        <>
          {/* Filozofa göre — tekerlek (silindir) seçici */}
          <Text style={styles.moodTitle}>{t('wisdom.byAuthor')}</Text>
          <WheelSelector opts={authorOpts} value={filter} onChange={setFilter} itemW={168} />

          {/* Ruh haline göre — tekerlek (silindir) seçici */}
          <Text style={styles.moodTitle}>{t('mood.title')}</Text>
          <WheelSelector opts={moodOpts} value={filter} onChange={setFilter} />

          {/* Seçili filtrede gösterilen alıntı sayısı */}
          <Text style={styles.wheelCount}>{filteredQuotes.length}</Text>

          <FlatList
            data={filteredQuotes}
            keyExtractor={(q) => q.id}
            renderItem={({ item }) => <QuoteItem quote={item} onShare={setShareQuote} isFav={favorites.includes(item.id)} onFav={onFav} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<Text style={styles.attribution}>{t('wisdom.attribution')}</Text>}
          />
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conceptsGrid}>
          {concepts.map((c) => (
            <ConceptCard key={c.latin} concept={c} onPress={() => setSelectedConcept(c)} moreLabel={t('wisdom.more')} />
          ))}
        </ScrollView>
      )}

      <ConceptModal
        concept={selectedConcept}
        onClose={() => { stopAudio(); setPlayingKey(null); setSelectedConcept(null); }}
        exampleLabel={t('wisdom.exampleLabel')}
        practiceLabel={t('wisdom.practiceLabel')}
        closeLabel={t('wisdom.close')}
        lang={lang}
        playingKey={playingKey}
        onToggle={togglePlay}
      />

      <QuoteShareModal
        quote={shareQuote}
        tagline={t('setup.tagline')}
        shareLabel={t('share.button')}
        closeLabel={t('wisdom.close')}
        onClose={() => setShareQuote(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 18 },
  title: { fontFamily: Fonts.cormorantItalic, fontSize: 27, color: Colors.text, letterSpacing: 0.3, lineHeight: 33, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.2, lineHeight: 19 },

  tabs: {
    flexDirection: 'row', marginHorizontal: 24, marginBottom: 16,
    backgroundColor: Colors.stone2, borderRadius: 12,
    padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: Colors.stone3 },
  tabBtnText: { fontFamily: Fonts.cinzel, fontSize: 11, color: Colors.muted, letterSpacing: 0.5 },
  tabBtnTextActive: { color: Colors.sand2 },

  filterScroll: { maxHeight: 44, marginBottom: 12 },
  filterContent: { paddingHorizontal: 24, gap: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: Colors.stone2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  filterChipActive: { backgroundColor: 'rgba(196,169,106,0.15)', borderColor: 'rgba(196,169,106,0.3)' },
  filterChipText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted },
  filterChipTextActive: { color: Colors.sand2 },


  // Ruh hali (mood) seçici barı
  moodTitle: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 1.5, color: Colors.muted, paddingHorizontal: 24, marginBottom: 8, textTransform: 'uppercase' },
  moodBar: {
    alignSelf: 'center', marginBottom: 14,
    backgroundColor: Colors.stone2, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(159,176,196,0.22)',
    height: 52, overflow: 'hidden',
  },
  moodItem: { height: 52, alignItems: 'center', justifyContent: 'center' },
  moodCurrent: { fontFamily: Fonts.cinzel, fontSize: 16, letterSpacing: 0.5, color: Colors.sand2 },
  wheelCount: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 2, marginBottom: 10 },

  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  attribution: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.faint, textAlign: 'center', marginTop: 22, marginBottom: 8, paddingHorizontal: 20, lineHeight: 16 },
  quoteCard: {
    backgroundColor: Colors.stone2, borderRadius: 20, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 18,
    borderWidth: 1, borderColor: 'rgba(194,168,120,0.10)', overflow: 'hidden',
  },
  quoteMark: { fontFamily: Fonts.cormorant, fontSize: 64, color: Colors.sand, opacity: 0.25, height: 48, marginBottom: -4 },
  quoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 21, color: Colors.text2, lineHeight: 33, marginBottom: 16 },
  quoteMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  quoteAuthor: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand, letterSpacing: 0.3 },
  quoteSource: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.muted, fontStyle: 'italic' },
  listenBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(196,169,106,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)' },
  listenBtnActive: { backgroundColor: 'rgba(220,80,80,0.15)', borderColor: 'rgba(220,80,80,0.35)' },
  listenIcon: { fontSize: 14, color: Colors.sand },
  favBtnActive: { backgroundColor: 'rgba(212,146,74,0.2)', borderColor: Colors.accent },
  favIconActive: { color: Colors.accent },
  modalListenBtn: { alignSelf: 'center', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(196,169,106,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)', marginTop: 4, marginBottom: 4 },

  conceptsGrid: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  conceptCard: {
    borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  conceptIcon: { fontSize: 22, marginBottom: 10 },
  conceptLatin: { fontFamily: Fonts.cormorantItalic, fontSize: 24, color: Colors.sand2, marginBottom: 2 },
  conceptTr: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.5, marginBottom: 10 },
  conceptPreview: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.text2, lineHeight: 18, marginBottom: 10 },
  conceptMore: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.accent, letterSpacing: 0.3 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.stone2, borderRadius: 24, padding: 28, width: '100%', maxHeight: '85%',
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)',
  },
  modalIcon: { fontSize: 32, marginBottom: 12, textAlign: 'center' },
  modalLatin: { fontFamily: Fonts.cormorantItalic, fontSize: 28, color: Colors.sand2, textAlign: 'center', marginBottom: 4 },
  modalTr: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, textAlign: 'center', letterSpacing: 0.5, marginBottom: 16 },
  modalDivider: { height: 1, backgroundColor: 'rgba(196,169,106,0.15)', marginBottom: 16 },
  modalDesc: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2, lineHeight: 21, marginBottom: 16 },
  modalExampleBox: {
    backgroundColor: 'rgba(196,169,106,0.08)', borderRadius: 12, padding: 14,
    borderLeftWidth: 2, borderLeftColor: Colors.sand, marginBottom: 20,
  },
  modalExampleLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.sand, marginBottom: 6 },
  modalExample: { fontFamily: Fonts.cormorantItalic, fontSize: 13, color: Colors.sand3, lineHeight: 20 },
  modalPracticeBox: {
    backgroundColor: 'rgba(159,176,196,0.08)', borderRadius: 12, padding: 14,
    borderLeftWidth: 2, borderLeftColor: Colors.moon, marginBottom: 20,
  },
  modalPracticeLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.moon, marginBottom: 6 },
  modalPractice: { fontFamily: Fonts.cormorantItalic, fontSize: 14, color: Colors.text, lineHeight: 21 },
  modalClose: {
    backgroundColor: Colors.stone3, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  modalCloseText: { fontFamily: Fonts.cinzel, fontSize: 12, color: Colors.text2, letterSpacing: 1 },
});
