import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, SafeAreaView, Animated, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../../constants/theme';
import { useLang, Lang } from '../../constants/i18n';
import { getQuotes, getConcepts, AUTHORS, Quote, Concept, quoteAudioKey, conceptAudioKey } from '../../constants/content';
import { hasAudio, playAudio, stopAudio } from '../../constants/audio';
import { QuoteShareModal } from '../../components/QuoteShareModal';
import { getFavorites, toggleFavorite } from '../../constants/favorites';

// ─── QuoteCard ─────────────────────────────────────────────
function QuoteItem({ quote, lang, playingKey, onToggle, onShare, isFav, onFav }: {
  quote: Quote; lang: Lang; playingKey: string | null; onToggle: (key: string) => void; onShare: (q: Quote) => void;
  isFav: boolean; onFav: (id: string) => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const key = quoteAudioKey(quote.id, lang);
  const audio = hasAudio(key);
  const playing = playingKey === key;

  return (
    <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <View style={styles.quoteMeta}>
        <View style={{ flex: 1 }}>
          <Text style={styles.quoteAuthor}>{quote.author}</Text>
          <Text style={styles.quoteSource}>{quote.source}</Text>
        </View>
        <TouchableOpacity onPress={() => onFav(quote.id)} style={[styles.listenBtn, isFav && styles.favBtnActive]}>
          <Text style={[styles.listenIcon, isFav && styles.favIconActive]}>{isFav ? '♥' : '♡'}</Text>
        </TouchableOpacity>
        {audio && (
          <TouchableOpacity onPress={() => onToggle(key)} style={[styles.listenBtn, playing && styles.listenBtnActive]}>
            <Text style={styles.listenIcon}>{playing ? '⏹' : '🔊'}</Text>
          </TouchableOpacity>
        )}
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
function ConceptModal({ concept, onClose, exampleLabel, closeLabel, lang, playingKey, onToggle }: {
  concept: Concept | null; onClose: () => void; exampleLabel: string; closeLabel: string;
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
          <View style={styles.modalExampleBox}>
            <Text style={styles.modalExampleLabel}>{exampleLabel}</Text>
            <Text style={styles.modalExample}>{concept.example}</Text>
          </View>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>{closeLabel}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
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

  // Filtre chip'leri: Tümü + Favoriler + kanıt düzeyine göre sıralı yazarlar
  const filterChips = [
    { id: 'all', label: t('wisdom.all') },
    { id: 'fav', label: '♥ ' + t('wisdom.favorites') },
    ...AUTHORS.map((a) => ({ id: a.id, label: a.name[lang] })),
  ];

  const filteredQuotes =
    filter === 'all' ? quotes :
    filter === 'fav' ? quotes.filter((q) => favorites.includes(q.id)) :
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
          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {filterChips.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.filterChip, filter === p.id && styles.filterChipActive]}
                onPress={() => setFilter(p.id)}
              >
                <Text style={[styles.filterChipText, filter === p.id && styles.filterChipTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList
            data={filteredQuotes}
            keyExtractor={(q) => q.id}
            renderItem={({ item }) => <QuoteItem quote={item} lang={lang} playingKey={playingKey} onToggle={togglePlay} onShare={setShareQuote} isFav={favorites.includes(item.id)} onFav={onFav} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
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
  container: { flex: 1, backgroundColor: Colors.stone },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  title: { fontFamily: Fonts.cinzel, fontSize: 22, color: Colors.text, letterSpacing: 0.5, marginBottom: 4 },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.3 },

  tabs: {
    flexDirection: 'row', marginHorizontal: 24, marginBottom: 16,
    backgroundColor: Colors.stone2, borderRadius: 12,
    padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: Colors.stone4 },
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

  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  quoteCard: {
    backgroundColor: Colors.stone2, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  quoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 16, color: Colors.sand3, lineHeight: 26, marginBottom: 12 },
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
    backgroundColor: Colors.stone2, borderRadius: 24, padding: 28, width: '100%',
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
  modalClose: {
    backgroundColor: Colors.stone3, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  modalCloseText: { fontFamily: Fonts.cinzel, fontSize: 12, color: Colors.text2, letterSpacing: 1 },
});
