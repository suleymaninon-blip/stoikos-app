import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  StyleSheet, SafeAreaView, Animated, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../../constants/theme';

// ─── Data ─────────────────────────────────────────────────
const PHILOSOPHERS = ['Tümü', 'Marcus Aurelius', 'Epiktetos', 'Seneca'];

const QUOTES = [
  { id: '1', text: 'Bugün ölebilirdin; bunun yerine hâlâ hayattasın. Bu zamanı bilgelikle kullan.', author: 'Marcus Aurelius', source: 'Meditationes' },
  { id: '2', text: 'İnsanları rahatsız eden şeyler değil, şeyler hakkındaki düşünceleridir.', author: 'Epiktetos', source: 'Enchiridion' },
  { id: '3', text: 'Hayatını değiştirmek istiyorsan, düşüncelerini değiştir. Bu kadar basit, bu kadar zor.', author: 'Marcus Aurelius', source: 'Meditationes' },
  { id: '4', text: 'Kendine dönük yolculuk, tüm yolculukların en uzunudur.', author: 'Seneca', source: 'Epistulae Morales' },
  { id: '5', text: 'Özgürlük, istediğini elde etmek değil; istemediğin şeyden korkmamaktır.', author: 'Epiktetos', source: 'Discourses' },
  { id: '6', text: 'Kayıplarını değil, sahip olduklarını say.', author: 'Marcus Aurelius', source: 'Meditationes' },
  { id: '7', text: 'Vakit en değerli şeydir; onu harcarken bile tasarruflu ol.', author: 'Seneca', source: 'Epistulae Morales' },
  { id: '8', text: 'Başkalarının söyledikleri onların kontrolünde; onlara nasıl tepki vereceğin senin.', author: 'Epiktetos', source: 'Enchiridion' },
  { id: '9', text: 'Gelecek için kaygılanmak, henüz yaşanmamış bir acıyı iki kez yaşamaktır.', author: 'Seneca', source: 'Epistulae Morales' },
  { id: '10', text: 'Kendi ruhunu değiştirmek, dünyanın geri kalanını değiştirmekten daha zordur.', author: 'Marcus Aurelius', source: 'Meditationes' },
  { id: '11', text: 'Az isteyen çok sahiptir. Çok isteyen hiçbir zaman yeterince sahip değildir.', author: 'Seneca', source: 'De Vita Beata' },
  { id: '12', text: 'Bilgelik; neyin senin kontrolünde olduğunu, neyin olmadığını bilmektir.', author: 'Epiktetos', source: 'Discourses' },
];

const CONCEPTS = [
  {
    latin: 'Amor Fati',
    tr: 'Kaderini Sev',
    icon: '♾',
    color: 'rgba(212,146,74,0.15)',
    desc: 'Her olayı — acı veren ya da keyifli — olması gerektiği gibi kabul etmek. Nietzsche\'nin Stoacılıktan aldığı bu kavram, dirençten değil kabulden güç doğduğunu söyler.',
    example: 'İşini kaybettiğinde "Bu beni nasıl daha güçlü yapabilir?" diye sormak Amor Fati\'dir.',
  },
  {
    latin: 'Memento Mori',
    tr: 'Ölümü Hatırla',
    icon: '⧗',
    color: 'rgba(180,120,80,0.15)',
    desc: 'Ölümlülüğünü hatırlamak seni karamsarlığa değil, uyanıklığa iter. Sınırlı zamanın olduğunu bilmek, her anı daha değerli kılar.',
    example: '"Bu sabah uyandığımda ölmemiştim" — bu düşünce her günü hediye olarak görmeni sağlar.',
  },
  {
    latin: 'Premeditatio Malorum',
    tr: 'Kötülükleri Önceden Düşün',
    icon: '◈',
    color: 'rgba(100,140,180,0.15)',
    desc: 'Olası zorlukları zihinsel olarak prova etmek, onlarla karşılaştığında hazırlıklı olmanı sağlar. Bu korku değil, hazırlıktır.',
    example: 'Bir sunum öncesi "Ya yanılırsam? Ya teknik aksaklık olursa?" diye sormak — ve cevabını düşünmek.',
  },
  {
    latin: 'Dichotomy of Control',
    tr: 'Kontrol Dairesi',
    icon: '◎',
    color: 'rgba(80,160,120,0.15)',
    desc: 'Her şeyi iki kategoriye ayır: kontrolündeki (düşünceler, kararlar, tepkiler) ve kontrolün dışındaki (başkalarının eylemleri, sonuçlar, geçmiş). Enerjini yalnızca birincisine ver.',
    example: 'Trafik sıkışıklığı kontrolünde değil. Ama sakin kalıp müzik dinlemek senin elinde.',
  },
  {
    latin: 'Eudaimonia',
    tr: 'İyi Yaşam',
    icon: '✦',
    color: 'rgba(196,169,106,0.15)',
    desc: 'Stoacılıkta mutluluk dış koşullara değil, erdemli yaşamaya dayanır. Gerçek huzur sahip olduklarından değil, kim olduğundan gelir.',
    example: 'Zenginlik, ün veya güzellik olmadan da tam bir insan olunabilir — erdemi seçmek yeterli.',
  },
  {
    latin: 'Sympatheia',
    tr: 'Evrensel Bağ',
    icon: '∞',
    color: 'rgba(160,100,180,0.15)',
    desc: 'Her şey birbirine bağlıdır. Başkalarına zarar vermek kendine zarar vermektir. Evrenin küçük ama önemli bir parçasısın.',
    example: 'Birine yardım ettiğinde sadece onu değil, bütünün dengesini iyileştiriyorsun.',
  },
];

const PHILOSOPHER_META: Record<string, { icon: string; count: number }> = {
  'Tümü':           { icon: '◈', count: QUOTES.length },
  'Marcus Aurelius': { icon: 'M', count: QUOTES.filter(q => q.author === 'Marcus Aurelius').length },
  'Epiktetos':      { icon: 'E', count: QUOTES.filter(q => q.author === 'Epiktetos').length },
  'Seneca':         { icon: 'S', count: QUOTES.filter(q => q.author === 'Seneca').length },
};

// ─── Filter Dropdown ───────────────────────────────────────
function FilterDropdown({ filter, setFilter }: { filter: string; setFilter: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = open ? 0 : 1;
    setOpen(!open);
    Animated.timing(animHeight, { toValue, duration: 200, useNativeDriver: false }).start();
  };

  const select = (p: string) => {
    setFilter(p);
    setOpen(false);
    Animated.timing(animHeight, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  };

  const meta = PHILOSOPHER_META[filter];

  return (
    <View style={styles.filterWrapper}>
      <TouchableOpacity style={styles.filterButton} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.filterButtonLeft}>
          <Text style={styles.filterButtonIcon}>{meta?.icon}</Text>
          <Text style={styles.filterButtonLabel}>{filter}</Text>
        </View>
        <View style={styles.filterButtonRight}>
          <Text style={styles.filterCount}>{meta?.count} alıntı</Text>
          <Text style={[styles.filterArrow, open && styles.filterArrowOpen]}>›</Text>
        </View>
      </TouchableOpacity>

      {open && (
        <View style={styles.filterDropdown}>
          {PHILOSOPHERS.map((p, i) => {
            const m = PHILOSOPHER_META[p];
            const isActive = p === filter;
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.filterOption,
                  i < PHILOSOPHERS.length - 1 && styles.filterOptionBorder,
                  isActive && styles.filterOptionActive,
                ]}
                onPress={() => select(p)}
                activeOpacity={0.7}
              >
                <View style={styles.filterOptionLeft}>
                  <View style={[styles.filterOptionDot, isActive && styles.filterOptionDotActive]}>
                    <Text style={[styles.filterOptionDotText, isActive && styles.filterOptionDotTextActive]}>{m.icon}</Text>
                  </View>
                  <Text style={[styles.filterOptionText, isActive && styles.filterOptionTextActive]}>{p}</Text>
                </View>
                <Text style={styles.filterOptionCount}>{m.count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── QuoteCard ─────────────────────────────────────────────
function QuoteItem({ quote }: { quote: typeof QUOTES[0] }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <View style={styles.quoteMeta}>
        <Text style={styles.quoteAuthor}>{quote.author}</Text>
        <Text style={styles.quoteSource}>{quote.source}</Text>
      </View>
    </Animated.View>
  );
}

// ─── ConceptCard ───────────────────────────────────────────
function ConceptCard({ concept, onPress }: { concept: typeof CONCEPTS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.conceptCard, { backgroundColor: concept.color }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.conceptIcon}>{concept.icon}</Text>
      <Text style={styles.conceptLatin}>{concept.latin}</Text>
      <Text style={styles.conceptTr}>{concept.tr}</Text>
      <Text style={styles.conceptPreview} numberOfLines={2}>{concept.desc}</Text>
      <Text style={styles.conceptMore}>Daha fazla →</Text>
    </TouchableOpacity>
  );
}

// ─── Concept Modal ─────────────────────────────────────────
function ConceptModal({ concept, onClose }: { concept: typeof CONCEPTS[0] | null; onClose: () => void }) {
  if (!concept) return null;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalIcon}>{concept.icon}</Text>
          <Text style={styles.modalLatin}>{concept.latin}</Text>
          <Text style={styles.modalTr}>{concept.tr}</Text>
          <View style={styles.modalDivider} />
          <Text style={styles.modalDesc}>{concept.desc}</Text>
          <View style={styles.modalExampleBox}>
            <Text style={styles.modalExampleLabel}>ÖRNEK</Text>
            <Text style={styles.modalExample}>{concept.example}</Text>
          </View>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Text style={styles.modalCloseText}>Kapat</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main ──────────────────────────────────────────────────
export default function WisdomScreen() {
  const [tab, setTab] = useState<'quotes' | 'concepts'>('quotes');
  const [filter, setFilter] = useState('Tümü');
  const [selectedConcept, setSelectedConcept] = useState<typeof CONCEPTS[0] | null>(null);

  const filteredQuotes = filter === 'Tümü'
    ? QUOTES
    : QUOTES.filter((q) => q.author === filter);

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
        <Text style={styles.title}>Bilgelik</Text>
        <Text style={styles.subtitle}>Antik öğretiler, modern hayat</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'quotes' && styles.tabBtnActive]}
          onPress={() => setTab('quotes')}
        >
          <Text style={[styles.tabBtnText, tab === 'quotes' && styles.tabBtnTextActive]}>Alıntılar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'concepts' && styles.tabBtnActive]}
          onPress={() => setTab('concepts')}
        >
          <Text style={[styles.tabBtnText, tab === 'concepts' && styles.tabBtnTextActive]}>Kavramlar</Text>
        </TouchableOpacity>
      </View>

      {tab === 'quotes' ? (
        <>
          {/* Filter dropdown */}
          <FilterDropdown filter={filter} setFilter={setFilter} />

          <FlatList
            data={filteredQuotes}
            keyExtractor={(q) => q.id}
            renderItem={({ item }) => <QuoteItem quote={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conceptsGrid}>
          {CONCEPTS.map((c) => (
            <ConceptCard key={c.latin} concept={c} onPress={() => setSelectedConcept(c)} />
          ))}
        </ScrollView>
      )}

      <ConceptModal concept={selectedConcept} onClose={() => setSelectedConcept(null)} />
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

  // Tabs
  tabs: {
    flexDirection: 'row', marginHorizontal: 24, marginBottom: 16,
    backgroundColor: Colors.stone2, borderRadius: 12,
    padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: Colors.stone4 },
  tabBtnText: { fontFamily: Fonts.cinzel, fontSize: 11, color: Colors.muted, letterSpacing: 0.5 },
  tabBtnTextActive: { color: Colors.sand2 },

  // Filter dropdown
  filterWrapper: { marginHorizontal: 20, marginBottom: 14 },
  filterButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.stone2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.15)',
  },
  filterButtonLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterButtonIcon: {
    fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand,
    width: 26, height: 26, textAlign: 'center', lineHeight: 26,
    backgroundColor: 'rgba(196,169,106,0.12)', borderRadius: 6,
  },
  filterButtonLabel: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.text2 },
  filterButtonRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterCount: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted },
  filterArrow: { fontFamily: Fonts.cinzel, fontSize: 18, color: Colors.muted, transform: [{ rotate: '90deg' }] },
  filterArrowOpen: { transform: [{ rotate: '-90deg' }] },
  filterDropdown: {
    marginTop: 4, backgroundColor: Colors.stone2, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.15)',
    overflow: 'hidden',
  },
  filterOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  filterOptionBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  filterOptionActive: { backgroundColor: 'rgba(196,169,106,0.07)' },
  filterOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterOptionDot: {
    width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.stone3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  filterOptionDotActive: { backgroundColor: 'rgba(196,169,106,0.2)', borderColor: 'rgba(196,169,106,0.3)' },
  filterOptionDotText: { fontFamily: Fonts.cinzel, fontSize: 11, color: Colors.muted },
  filterOptionDotTextActive: { color: Colors.sand },
  filterOptionText: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2 },
  filterOptionTextActive: { color: Colors.sand2, fontFamily: Fonts.jostMedium },
  filterOptionCount: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted },

  // Quote list
  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  quoteCard: {
    backgroundColor: Colors.stone2, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  quoteText: { fontFamily: Fonts.cormorantItalic, fontSize: 16, color: Colors.sand3, lineHeight: 26, marginBottom: 12 },
  quoteMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quoteAuthor: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.sand, letterSpacing: 0.3 },
  quoteSource: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.muted, fontStyle: 'italic' },

  // Concepts grid
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

  // Modal
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
