import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, SafeAreaView, Animated, Easing, Modal, Pressable, Platform,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useAppDimensions } from '../../constants/layout';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../../constants/theme';
import { useTheme, useStyles, type Palette } from '../../constants/themeContext';
import { HeartIcon, ShareArrowIcon } from '../../components/Icons';
import { FirstTip } from '../../components/FirstTip';
import { useLocalSearchParams } from 'expo-router';
import { useLang, upper, localeOf } from '../../constants/i18n';
import { getQuotes, getConcepts, getPhilosophers, PHILOSOPHER_IDS, AUTHORS, MOOD_THEMES, Quote, Concept, Philosopher } from '../../constants/content';
import { QuoteShareModal } from '../../components/QuoteShareModal';
import { getFavorites, toggleFavorite } from '../../constants/favorites';
import { fetchHearts, HEART_MIN, type Hearts } from '../../constants/stoa';
import PhilosopherSymbol from '../../components/PhilosopherSymbol';
import { ConceptModal, TEXT_GLYPH } from '../../components/ConceptModal';
import { CalmPressable } from '../../components/CalmPressable';
import { StaggerSection } from '../../components/StaggerSection';
import { useReduceMotion } from '../../hooks/useReduceMotion';


// ─── QuoteCard ─────────────────────────────────────────────
function QuoteItem({ quote, onShare, isFav, onFav, onAuthor, hearts, weekTop }: {
  quote: Quote; onShare: (q: Quote) => void;
  hearts?: number; weekTop?: boolean;   // Stoa'nın nabzı: toplam kalp (HEART_MIN altında gösterilmez)
  isFav: boolean; onFav: (id: string) => void;
  onAuthor?: (authorId: string) => void; // filozof kartı varsa dokunulabilir
}) {
  const styles = useStyles(makeStyles);
  const { C: Colors } = useTheme();
  const { t, lang } = useLang();
  const favAddLabel = t('a11y.favAdd'), favRemoveLabel = t('a11y.favRemove'), shareLabel = t('a11y.share');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const isFirstFav = useRef(true);
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) { fadeAnim.setValue(1); slideAnim.setValue(0); return; }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // Kalbe dokununca kalp bir kez hafifçe yaylanır ("Hareketi Azalt"ta yok).
  useEffect(() => {
    if (isFirstFav.current) { isFirstFav.current = false; return; }
    if (reduce) return;
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.22, speed: 40, bounciness: 10, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, speed: 28, bounciness: 6, useNativeDriver: true }),
    ]).start();
  }, [isFav, heartScale, reduce]);

  return (
    <Animated.View style={[styles.quoteCard, styles.cardShadow, weekTop && styles.weekCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {weekTop && <Text style={styles.weekLabel}>{upper(t('stoa.weekTop'), lang)}</Text>}
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <View style={styles.quoteMeta}>
        <View style={{ flex: 1 }}>
          {onAuthor ? (
            <TouchableOpacity onPress={() => onAuthor(quote.authorId)} activeOpacity={0.6} hitSlop={6}>
              <Text style={[styles.quoteAuthor, styles.quoteAuthorLink]}>{quote.author} ›</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.quoteAuthor}>{quote.author}</Text>
          )}
          {quote.source && quote.source !== quote.author
            ? <Text style={styles.quoteSource}>{quote.source}</Text>
            : null}
        </View>
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <TouchableOpacity onPress={() => onFav(quote.id)} style={[styles.listenBtn, isFav && styles.favBtnActive]} hitSlop={4}
            accessibilityRole="button" accessibilityState={{ selected: isFav }} accessibilityLabel={isFav ? favRemoveLabel : favAddLabel}>
            <HeartIcon size={19} filled={isFav} color={isFav ? Colors.accent : Colors.sand2} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={() => onShare(quote)} style={styles.listenBtn} hitSlop={4} accessibilityRole="button" accessibilityLabel={shareLabel}>
          <ShareArrowIcon size={19} color={Colors.sand2} />
        </TouchableOpacity>
      </View>
      {hearts !== undefined && hearts >= HEART_MIN && (
        <Text style={styles.savedLine}>
          {isFav ? t('stoa.savedYou', { n: (hearts - 1).toLocaleString(localeOf(lang)) }) : t('stoa.savedBy', { n: hearts.toLocaleString(localeOf(lang)) })}
        </Text>
      )}
    </Animated.View>
  );
}

// ─── ConceptCard ───────────────────────────────────────────
function ConceptCard({ concept, onPress, moreLabel }: { concept: Concept; onPress: () => void; moreLabel: string }) {
  const styles = useStyles(makeStyles);
  return (
    <CalmPressable style={[styles.conceptCard, styles.cardShadow, { backgroundColor: concept.color }]} onPress={onPress}>
      <Text style={styles.conceptIcon}>{concept.icon + TEXT_GLYPH}</Text>
      <Text style={styles.conceptLatin}>{concept.latin}</Text>
      <Text style={styles.conceptTr}>{concept.name}</Text>
      <Text style={styles.conceptPreview} numberOfLines={2}>{concept.desc}</Text>
      {/* moreLabel metninde ok (→) zaten var */}
      <Text style={styles.conceptMore}>{moreLabel}</Text>
    </CalmPressable>
  );
}

// ─── Philosopher Card ──────────────────────────────────────
function PhilosopherCard({ philo, onPress }: { philo: Philosopher; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  return (
    <CalmPressable style={[styles.philoCard, styles.cardShadow, { backgroundColor: philo.color }]} onPress={onPress}>
      <View style={styles.philoSymbolBox}><PhilosopherSymbol id={philo.id} size={24} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.philoName}>{philo.name}</Text>
        <Text style={styles.philoEra}>{philo.era}</Text>
        <Text style={styles.philoOneLiner} numberOfLines={3}>{philo.oneLiner}</Text>
      </View>
    </CalmPressable>
  );
}

// ─── Philosopher Modal ─────────────────────────────────────
function PhilosopherModal({ philo, onClose, contributionLabel, closeLabel }: {
  philo: Philosopher | null; onClose: () => void; contributionLabel: string; closeLabel: string;
}) {
  const styles = useStyles(makeStyles);
  if (!philo) return null;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.philoModalSymbolBox}><PhilosopherSymbol id={philo.id} size={32} /></View>
            <Text style={styles.modalTr}>{philo.name}</Text>
            <Text style={styles.philoModalEra}>{philo.era}</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalDesc}>{philo.story}</Text>
            {philo.contribution ? (
              <View style={styles.modalPracticeBox}>
                <Text style={styles.modalPracticeLabel}>{contributionLabel}</Text>
                <Text style={styles.modalPractice}>{philo.contribution}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.modalClose} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.modalCloseText}>{closeLabel}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Ruh hali temaları ────────────────────────────────────

// Yatay tekerlek (silindir) seçici — yalnız parmakla kaydırma; yanlar perspektifle bükülür.
// Hem ruh hali hem filozof seçimi için ortak kullanılır. `opts` parent'ta memoize edilmeli.
// Erişilebilirlik (UX denetimi K3): eskiden yalnız parmakla kaydırılarak seçiliyordu.
// Artık görünen öğeye dokunmak da seçer ve bileşen ekran okuyucuya "ayarlanabilir"
// olarak duyurulur (yukarı/aşağı kaydırma ile önceki/sonraki seçenek).
function WheelSelector({ opts, value, onChange, itemW = 132 }: {
  opts: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  itemW?: number;
}) {
  const styles = useStyles(makeStyles);
  const { width } = useAppDimensions();
  const n = opts.length;
  const ITEM_W = itemW;
  const BAR_W = width - 48;          // marginHorizontal 24 + 24
  const SIDE = Math.max(0, (BAR_W - ITEM_W) / 2);

  // Sonlu liste (21 Ekim 2026, kullanıcı isteği): eskiden liste 9 kez çoğaltılıp
  // sonsuz döndürülüyordu. Artık "Tümü" en başta, son seçenekte duruyor; görünüm
  // (ortadaki seçili, yanlar perspektifle silik) aynı.
  const MID = 0;
  const data = opts;

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
    const i = Math.min(N - 1, Math.max(0, Math.round(x / ITEM_W)));
    const id = optsRef.current[i].id;
    if (id !== valueRef.current) onChange(id);
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

  const { t } = useLang();
  const step = (d: number) => onChange(opts[Math.min(n - 1, Math.max(0, idx + d))].id);
  return (
    <View
      style={[styles.moodBar, styles.cardShadow, { width: BAR_W }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={t('a11y.wheel', { v: opts[idx]?.label ?? '' })}
      accessibilityValue={{ text: opts[idx]?.label ?? '' }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
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
            opacity: scrollX.interpolate({ inputRange: inR, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp' }),
            transform: [
              { perspective: 1000 },
              // hafif perspektif (okunabilirliği bozmasın diye düşük açı)
              { rotateY: scrollX.interpolate({ inputRange: inR, outputRange: ['14deg', '0deg', '-14deg'], extrapolate: 'clamp' }) },
              { scale: scrollX.interpolate({ inputRange: inR, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' }) },
              // yan öğeleri merkeze doğru çek → kenarda kırpılmasın, daha görünür olsun
              { translateX: scrollX.interpolate({ inputRange: inR, outputRange: [ITEM_W * 0.1, 0, -ITEM_W * 0.1], extrapolate: 'clamp' }) },
            ],
          };
          return (
            <Pressable key={i} style={[styles.moodItem, { width: ITEM_W }]} onPress={() => { if (o.id !== valueRef.current) onChange(o.id); }}>
              <Animated.Text style={[styles.moodCurrent, animStyle]} numberOfLines={1}>{o.label}</Animated.Text>
            </Pressable>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function WisdomScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const [tab, setTab] = useState<'quotes' | 'concepts' | 'philosophers'>('quotes');
  const [filter, setFilter] = useState('all'); // 'all' | 'fav' | authorId | 'mood:<tema>'
  const [mode, setMode] = useState<'author' | 'mood'>('author'); // tekerleğin gösterdiği boyut
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [selectedPhilo, setSelectedPhilo] = useState<Philosopher | null>(null);
  const [shareQuote, setShareQuote] = useState<Quote | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hearts, setHearts] = useState<Hearts | null>(null);
  useEffect(() => { fetchHearts().then(setHearts); }, []);

  const quotes = getQuotes(lang);
  const concepts = getConcepts(lang);
  const philosophers = getPhilosophers(lang);

  // Alıntıdaki yazar adına dokununca → filozof kartını aç, sekmeyi DEĞİŞTİRME (15 Kasım 2026, kullanıcı:
  // "kapat dediğimde Filozoflar'da kalıyor"). Kapatınca kişi aynı filtreli alıntı listesine, aynı yere döner.
  const openPhilosopher = useCallback((authorId: string) => {
    const p = philosophers.find((x) => x.id === authorId);
    if (p) setSelectedPhilo(p);
  }, [philosophers]);

  useEffect(() => { getFavorites().then(setFavorites); }, []);

  // Ana ekrandaki "Nasıl hissediyorsun?" kısayolundan gelen ruh hali
  const params = useLocalSearchParams<{ mood?: string }>();
  useEffect(() => {
    const m = Array.isArray(params.mood) ? params.mood[0] : params.mood;
    if (m) { setTab('quotes'); setMode('mood'); setFilter(`mood:${m}`); }
  }, [params.mood]);

  async function onFav(id: string) {
    setFavorites(await toggleFavorite(id));
    fetchHearts().then(setHearts);   // önbellek toggle'da güncellendi
  }

  // Tekerlek seçenekleri (referans kararlılığı için memoize) — WheelSelector bunu bekler.
  const moodOpts = useMemo(
    () => [{ id: 'all', label: t('wisdom.all') }, ...MOOD_THEMES.map((m) => ({ id: `mood:${m}`, label: t(`mood.${m}`) }))],
    [t]
  );
  const authorOpts = useMemo(
    () => [
      { id: 'all', label: t('wisdom.all') },
      ...AUTHORS.map((a) => ({ id: a.id, label: a.name[lang] ?? a.name.en ?? a.id })),
    ],
    [t, lang]
  );

  // Mod değiştir: yeni boyuta geçerken mevcut filtre o boyuta ait değilse 'all'a dön.
  const switchMode = (m: 'author' | 'mood') => {
    setMode(m);
    const belongs = m === 'mood' ? filter.startsWith('mood:') : (filter !== 'fav' && !filter.startsWith('mood:'));
    if (!belongs) setFilter('all');
  };

  // Katlanan başlık (21 Ekim 2026, kullanıcı isteği: "ekranın yarısını header kaplıyor").
  // Başlık + sekmeler + mod anahtarı kaydırınca yukarı katlanır, yalnız tekerlek kalır;
  // en başa dönünce açılır. Histerezis: 60'ta kapan, 8'in altında aç. Kapanmak için
  // listenin, başlık yüksekliği kadar fazladan kaydırma payı olmalı — yoksa kapanınca
  // görünüm büyür, konum başa sıkışır ve başlık açılıp kapanarak titrer.
  const [collapsed, setCollapsed] = useState(false);
  const collapsedRef = useRef(false);
  const collapseAnim = useRef(new Animated.Value(0)).current;
  const [headH, setHeadH] = useState(0);
  const headHRef = useRef(0);
  const setHeaderCollapsed = (c: boolean) => {
    if (collapsedRef.current === c) return;
    collapsedRef.current = c;
    setCollapsed(c);
    Animated.timing(collapseAnim, { toValue: c ? 1 : 0, duration: 280, useNativeDriver: false }).start();
  };
  const onListScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const y = contentOffset.y;
    if (!collapsedRef.current) {
      const room = contentSize.height - layoutMeasurement.height;
      if (y > 60 && room > headHRef.current + 80) setHeaderCollapsed(true);
    } else if (y < 8) {
      setHeaderCollapsed(false);
    }
  };
  useEffect(() => { setHeaderCollapsed(false); }, [tab]);
  // Filtre değişince yeni sonuçlar baştan gösterilir; kısa bir listede başlık
  // kapalı kalırsa kaydırarak açılamazdı.
  const listRef = useRef<FlatList<Quote>>(null);
  const rootRef = useRef<View>(null);
  const wheelRef = useRef<View>(null);
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    setHeaderCollapsed(false);
  }, [filter, mode]);

  const filteredQuotes =
    filter === 'all' ? quotes :
    filter === 'fav' ? quotes.filter((q) => favorites.includes(q.id)) :
    filter.startsWith('mood:') ? quotes.filter((q) => q.theme === filter.slice(5)) :
    quotes.filter((q) => q.authorId === filter);
  const weekQuote = hearts?.weekTop && hearts.weekTop.n >= HEART_MIN ? quotes.find((q) => q.id === hearts.weekTop!.id) ?? null : null;

  return (
    <SafeAreaView ref={rootRef} style={styles.container}>
      <LinearGradient
        colors={[Colors.tint(Colors.isDark ? 0.07 : 0.08), 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Katlanan bölüm: başlık + sekmeler + (Alıntılar'da) mod anahtarı */}
      <Animated.View
        style={[
          { overflow: 'hidden' },
          headH > 0 && {
            height: collapseAnim.interpolate({ inputRange: [0, 1], outputRange: [headH, 0] }),
            opacity: collapseAnim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0, 0] }),
          },
        ]}
        pointerEvents={collapsed ? 'none' : 'auto'}
        accessibilityElementsHidden={collapsed}
        importantForAccessibility={collapsed ? 'no-hide-descendants' : 'auto'}
      >
      <View onLayout={(e) => { const h = Math.round(e.nativeEvent.layout.height); headHRef.current = h; setHeadH(h); }}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.wisdom')}</Text>
        <Text style={styles.subtitle}>{t('wisdom.title')}</Text>
      </View>

      {/* Tab switcher */}
      <View style={[styles.tabs, styles.cardShadow]}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'quotes' && styles.tabBtnActive]} onPress={() => setTab('quotes')} activeOpacity={0.75}>
          <Text style={[styles.tabBtnText, tab === 'quotes' && styles.tabBtnTextActive]}>{t('wisdom.tabQuotes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'concepts' && styles.tabBtnActive]} onPress={() => setTab('concepts')} activeOpacity={0.75}>
          <Text style={[styles.tabBtnText, tab === 'concepts' && styles.tabBtnTextActive]}>{t('wisdom.tabConcepts')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'philosophers' && styles.tabBtnActive]} onPress={() => setTab('philosophers')} activeOpacity={0.75}>
          <Text style={[styles.tabBtnText, tab === 'philosophers' && styles.tabBtnTextActive]}>{t('wisdom.tabPhilosophers')}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'quotes' && (
          /* Filtre: mod anahtarı (Filozof | Ruh Hali) + ♥ favoriler */
          <View style={styles.filterRow}>
            <View style={[styles.segment, styles.cardShadow]}>
              <TouchableOpacity
                style={[styles.segBtn, mode === 'author' && styles.segBtnOn]}
                activeOpacity={0.8}
                onPress={() => switchMode('author')}
              >
                <Text style={[styles.segTxt, mode === 'author' && styles.segTxtOn]}>{t('wisdom.segAuthor')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segBtn, mode === 'mood' && styles.segBtnOn]}
                activeOpacity={0.8}
                onPress={() => switchMode('mood')}
              >
                <Text style={[styles.segTxt, mode === 'mood' && styles.segTxtOn]}>{t('wisdom.segMood')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.heartBtn, styles.cardShadow, filter === 'fav' && styles.heartBtnOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === 'fav' }}
              accessibilityLabel={t('wisdom.favorites')}
              activeOpacity={0.8}
              onPress={() => setFilter('fav')}
            >
              <HeartIcon size={20} filled color={filter === 'fav' ? Colors.accent : Colors.muted} />
            </TouchableOpacity>
          </View>
      )}
      </View>
      </Animated.View>

      {tab === 'quotes' ? (
        <>
          {/* Tek tekerlek — seçilen moda göre içerik (mod değişince remount) */}
          <View ref={wheelRef} collapsable={false}>
          <WheelSelector
            key={mode}
            opts={mode === 'author' ? authorOpts : moodOpts}
            value={filter}
            onChange={setFilter}
            itemW={mode === 'author' ? 144 : 124}
          />
          </View>

          <FlatList
            ref={listRef}
            data={filteredQuotes}
            keyExtractor={(q) => q.id}
            onScroll={onListScroll}
            scrollEventThrottle={16}
            // Seçili filtrede gösterilen alıntı sayısı — listeyle birlikte kayar
            ListHeaderComponent={
              <View>
                <Text style={styles.wheelCount}>{filteredQuotes.length} {t('wisdom.countLabel')}</Text>
                {/* Haftanın en sevilen sözü: yalnız "Tümü"nde ve yeterince kalp varsa */}
                {filter === 'all' && weekQuote && (
                  <QuoteItem quote={weekQuote} weekTop hearts={hearts?.counts[weekQuote.id]} onShare={setShareQuote} isFav={favorites.includes(weekQuote.id)} onFav={onFav} onAuthor={PHILOSOPHER_IDS.has(weekQuote.authorId) ? openPhilosopher : undefined} />
                )}
              </View>
            }
            renderItem={({ item }) => <QuoteItem quote={item} hearts={hearts?.counts[item.id]} onShare={setShareQuote} isFav={favorites.includes(item.id)} onFav={onFav} onAuthor={PHILOSOPHER_IDS.has(item.authorId) ? openPhilosopher : undefined} />}
            contentContainerStyle={filteredQuotes.length ? styles.listContent : styles.listEmpty}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>{filter === 'fav' ? '♡' : '⌕'}</Text>
                <Text style={styles.emptyText}>{t(filter === 'fav' ? 'wisdom.emptyFav' : 'wisdom.empty')}</Text>
              </View>
            }
            ListFooterComponent={filteredQuotes.length ? <Text style={styles.attribution}>{t('wisdom.attribution')}</Text> : null}
          />
        </>
      ) : tab === 'concepts' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conceptsGrid} onScroll={onListScroll} scrollEventThrottle={16}>
          {concepts.map((c, i) => (
            <StaggerSection key={c.latin} delay={Math.min(i * 55, 330)}>
              <ConceptCard concept={c} onPress={() => setSelectedConcept(c)} moreLabel={t('wisdom.more')} />
            </StaggerSection>
          ))}
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conceptsGrid} onScroll={onListScroll} scrollEventThrottle={16}>
          {philosophers.map((p, i) => (
            <StaggerSection key={p.id} delay={Math.min(i * 55, 330)}>
              <PhilosopherCard philo={p} onPress={() => setSelectedPhilo(p)} />
            </StaggerSection>
          ))}
          <Text style={styles.attribution}>{t('wisdom.attribution')}</Text>
        </ScrollView>
      )}

      <PhilosopherModal
        philo={selectedPhilo}
        onClose={() => setSelectedPhilo(null)}
        contributionLabel={t('wisdom.philoContribution')}
        closeLabel={t('wisdom.close')}
      />

      <ConceptModal concept={selectedConcept} onClose={() => setSelectedConcept(null)} />

      <QuoteShareModal
        quote={shareQuote}
        tagline={t('setup.tagline')}
        shareLabel={t('share.button')}
        closeLabel={t('wisdom.close')}
        onClose={() => setShareQuote(null)}
      />

      <FirstTip id="wisdom" text={t('tip.wisdom')} target={wheelRef} container={rootRef} enabled={tab === 'quotes'} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const makeStyles = (Colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },

  cardShadow: !Colors.isDark
    ? Platform.select({
        ios: {
          shadowColor: '#1D2A2F',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        android: { elevation: 2 },
        default: {},
      })
    : {},

  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 12 },
  title: { fontFamily: Fonts.cormorant, fontSize: 30, color: Colors.text, letterSpacing: 0.3, lineHeight: 34, marginBottom: 2 },
  subtitle: { fontFamily: Fonts.cormorantItalic, fontSize: 17, color: Colors.muted, letterSpacing: 0.2, lineHeight: 22 },

  tabs: {
    flexDirection: 'row', marginHorizontal: 24, marginBottom: 12,
    backgroundColor: Colors.stone2, borderRadius: 14,
    padding: 4, borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11 },
  tabBtnActive: { backgroundColor: Colors.stone3 },
  tabBtnText: { fontFamily: Fonts.cinzel, fontSize: 12, color: Colors.muted, letterSpacing: 0.5 },
  tabBtnTextActive: { color: Colors.sand2 },

  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, marginBottom: 12 },
  segment: { flex: 1, flexDirection: 'row', backgroundColor: Colors.stone2, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: Colors.overlay(0.05) },
  segBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 11 },
  segBtnOn: { backgroundColor: Colors.tint(0.16) },
  segTxt: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.muted },
  segTxtOn: { color: Colors.sand2 },
  heartBtn: {
    width: 46, height: 46, borderRadius: 14, borderWidth: 1, borderColor: Colors.tint(0.22),
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2,
  },
  heartBtnOn: { backgroundColor: Colors.tint(0.2), borderColor: Colors.accent },

  moodBar: {
    alignSelf: 'center', marginTop: 4, marginBottom: 10,
    backgroundColor: Colors.stone2, borderRadius: 16, borderWidth: 1, borderColor: Colors.moonA(0.22),
    height: 48, overflow: 'hidden',
  },
  moodItem: { height: 48, alignItems: 'center', justifyContent: 'center' },
  moodCurrent: { fontFamily: Fonts.cinzel, fontSize: 16, letterSpacing: 0.5, color: Colors.sand2 },

  weekCard: { borderWidth: 1.5, borderColor: Colors.sand },
  weekLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 1.4, color: Colors.sand, marginBottom: 2 },
  savedLine: { fontFamily: Fonts.jost, fontSize: 12.5, color: Colors.muted, marginTop: 8 },
  wheelCount: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 2, marginBottom: 10 },

  listContent: { paddingHorizontal: 20, paddingBottom: 48, gap: 14 },
  listEmpty: { flexGrow: 1, paddingHorizontal: 20 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 30, gap: 14 },
  emptyIcon: { fontFamily: Fonts.jost, fontSize: 40, color: Colors.muted, opacity: 0.5 },
  emptyText: { fontFamily: Fonts.cormorantItalic, fontSize: 18, color: Colors.muted, textAlign: 'center', lineHeight: 26 },
  attribution: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 22, marginBottom: 8, paddingHorizontal: 20, lineHeight: 16 },

  quoteCard: {
    backgroundColor: Colors.stone2, borderRadius: 24, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 20,
    borderWidth: 1, borderColor: Colors.tint(0.11), overflow: 'hidden',
  },
  quoteMark: { fontFamily: Fonts.cormorant, fontSize: 64, color: Colors.sand, opacity: 0.24, height: 48, marginBottom: -4 },
  quoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 21, color: Colors.text2, lineHeight: 33, marginBottom: 18 },
  quoteMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  quoteAuthor: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.sand, letterSpacing: 0.3 },
  quoteAuthorLink: { color: Colors.accent },
  quoteSource: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, fontStyle: 'italic' },
  listenBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.tint(0.12),
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.tint(0.35),
  },
  favBtnActive: { backgroundColor: Colors.tint(0.22), borderColor: Colors.accent },

  conceptsGrid: { paddingHorizontal: 20, paddingBottom: 48, gap: 14 },
  conceptCard: {
    borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  conceptIcon: { fontSize: 22, color: Colors.sand2, marginBottom: 10 },
  conceptLatin: { fontFamily: Fonts.cormorantItalic, fontSize: 24, color: Colors.sand2, marginBottom: 2 },
  conceptTr: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, letterSpacing: 0.5, marginBottom: 10 },
  conceptPreview: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text2, lineHeight: 21, marginBottom: 10 },
  conceptMore: { fontFamily: Fonts.jostMedium, fontSize: 14, color: Colors.accent, letterSpacing: 0.3 },

  philoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    borderRadius: 22, padding: 18,
    borderWidth: 1, borderColor: Colors.overlay(0.06),
  },
  philoSymbolBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)', borderWidth: 1, borderColor: Colors.tint(0.25),
  },
  philoName: { fontFamily: Fonts.cormorantItalic, fontSize: 22, color: Colors.sand2, marginBottom: 2 },
  philoEra: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3, marginBottom: 8 },
  philoOneLiner: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text2, lineHeight: 21 },

  philoModalSymbolBox: {
    alignSelf: 'center', width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    backgroundColor: Colors.tint(0.10), borderWidth: 1, borderColor: Colors.tint(0.28),
  },
  philoModalEra: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.muted, textAlign: 'center', letterSpacing: 0.3, marginTop: -10, marginBottom: 16 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.stone2, borderRadius: 26, padding: 28, width: '100%', maxHeight: '85%',
    borderWidth: 1, borderColor: Colors.tint(0.22),
  },
  modalTr: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, textAlign: 'center', letterSpacing: 0.5, marginBottom: 16 },
  modalDivider: { height: 1, backgroundColor: Colors.tint(0.15), marginBottom: 16 },
  modalDesc: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text2, lineHeight: 26, marginBottom: 16 },
  modalPracticeBox: {
    backgroundColor: Colors.moonA(0.08), borderRadius: 14, padding: 14,
    borderLeftWidth: 2, borderLeftColor: Colors.moon, marginBottom: 20,
  },
  modalPracticeLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.moon, marginBottom: 6 },
  modalPractice: { fontFamily: Fonts.jost, fontSize: 16, color: Colors.text, lineHeight: 25 },
  modalClose: {
    backgroundColor: Colors.stone3, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.overlay(0.07),
  },
  modalCloseText: { fontFamily: Fonts.cinzel, fontSize: 12, color: Colors.text2, letterSpacing: 1 },
});
