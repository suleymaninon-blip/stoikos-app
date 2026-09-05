import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '../../constants/i18n';
import { COACH_INITIAL, COACH_SUGGESTIONS } from '../../constants/content';
import { sendCoach, getCoachQuota, type CoachQuota } from '../../constants/api';
import { Paywall } from '../../components/Paywall';

// ─── Types ────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'stoikos_chat_history';

// ─── Helpers ──────────────────────────────────────────────
function parseResponse(text: string): { body: string; quote: string | null } {
  // 1) Eski biçim: [ALINTI: "..." — Yazar, Kaynak] (karşılama mesajı & eski geçmiş)
  const quoteMatch = text.match(/\[ALINTI:\s*"([^"]+)"\s*—\s*([^\]]+)\]/);
  if (quoteMatch) {
    const body = text.replace(quoteMatch[0], '').trim();
    return { body, quote: `"${quoteMatch[1]}" — ${quoteMatch[2]}` };
  }
  // 2) Yeni biçim: '>' ile işaretli alıntı satır(lar)ı
  const lines = text.split('\n');
  const isQuote = (l: string) => /^\s*>/.test(l);
  if (lines.some(isQuote)) {
    const quote = lines.filter(isQuote).map((l) => l.replace(/^\s*>\s?/, '')).join(' ').trim();
    const body = lines.filter((l) => !isQuote(l)).join('\n').trim();
    return { body, quote: quote || null };
  }
  return { body: text, quote: null };
}

// ─── MessageBubble ────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  if (isUser) {
    return (
      <Animated.View style={[styles.userBubbleWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
        <Text style={styles.timeMeta}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    );
  }

  const { body, quote } = parseResponse(message.content);
  return (
    <Animated.View style={[styles.aiBubbleWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.aiLabel}>Ω  STOIKOS</Text>
      <View style={styles.aiBubble}>
        <Text style={styles.aiText}>{body}</Text>
        {quote && (
          <View style={styles.quoteInline}>
            <Text style={styles.quoteInlineText}>{quote}</Text>
          </View>
        )}
      </View>
      <Text style={styles.timeMeta}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );
}

// Nabız atan "Yanında" noktası
function PulseDot() {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[styles.statusDot, { opacity: pulse }]} />;
}

function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current, useRef(new Animated.Value(0.3)).current];
  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);
  return (
    <View style={styles.aiBubbleWrap}>
      <Text style={styles.aiLabel}>Ω  STOIKOS</Text>
      <View style={[styles.aiBubble, { paddingVertical: 16, paddingHorizontal: 20 }]}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {dots.map((dot, i) => (
            <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.sand, opacity: dot }} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function CoachScreen() {
  const { t, lang } = useLang();
  const makeInitial = useCallback((): Message => ({ id: '0', role: 'assistant', content: COACH_INITIAL[lang], timestamp: new Date() }), [lang]);

  const [messages, setMessages] = useState<Message[]>(() => [{ id: '0', role: 'assistant', content: COACH_INITIAL[lang], timestamp: new Date() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Kota yalnızca arayüz içindir; asıl kapı backend'de. null = bilinmiyor (ağ hatası).
  const [quota, setQuota] = useState<CoachQuota | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const exhausted = quota != null && !quota.subscribed && (quota.remaining ?? 1) <= 0;

  useEffect(() => {
    getCoachQuota().then(setQuota);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(CHAT_HISTORY_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>;
          setMessages(saved.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    setMessages((prev) => (prev.length === 1 && prev[0].id === '0' ? [makeInitial()] : prev));
  }, [lang, makeInitial]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const saveMessages = useCallback((msgs: Message[]) => {
    AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs));
  }, []);

  async function send(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    if (exhausted) { setPaywallOpen(true); return; }
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    saveMessages(withUser);
    setLoading(true);
    try {
      // Karşılama mesajını (id '0') çıkar — Claude ilk mesajın 'user' olmasını ister
      // Yükleme boyutunu küçük tut (uzun sohbette mobil veri israfı olmasın).
      // Asıl kırpma backend'de (MAX_HISTORY_MESSAGES); buradaki pencere kasten
      // daha geniş tutuldu ki ikisi çakışmasın.
      const payload = withUser
        .filter((m) => m.id !== '0')
        .slice(-24)
        .map((m) => ({ role: m.role, content: m.content }));
      const { reply, remaining, subscribed } = await sendCoach(lang, payload);
      setQuota((q) => (q ? { ...q, remaining, subscribed } : q));
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() };
      const final = [...withUser, aiMsg];
      setMessages(final);
      saveMessages(final);
    } catch (e: any) {
      // Hak bitti → sayacı sıfırla, duvarı aç. Sohbete balon EKLEME: açıklama
      // zaten duvarda ve orası 6 dilde; backend'in gerekçesi yalnız Türkçe.
      if (e?.quotaExceeded) {
        setQuota((q) => (q ? { ...q, remaining: 0 } : { subscribed: false, used: 0, limit: 0, remaining: 0 }));
        setPaywallOpen(true);
        return;
      }
      const content =
        e?.rateLimitScope === 'minute' ? t('coach.tooFast')
        : e?.rateLimitScope === 'day' ? t('coach.dailyLimit')
        : e?.userMessage || t('coach.connError');
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([makeInitial()]);
    AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  }

  const suggestions = COACH_SUGGESTIONS[lang];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(212,146,74,0.05)', 'transparent']} style={styles.gradientTop} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('coach.title')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {quota && !quota.subscribed ? (
              // Ücretsiz kullanıcı: kalan hak. Dokununca ödeme duvarı açılır.
              <TouchableOpacity
                style={[styles.quotaBadge, exhausted && styles.quotaBadgeEnded]}
                onPress={() => setPaywallOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quotaText, exhausted && styles.quotaTextEnded]}>
                  {exhausted ? t('coach.quotaEnded') : t('coach.remaining', { n: quota.remaining ?? 0 })}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statusBadge}>
                <PulseDot />
                <Text style={styles.statusText}>{t('coach.active')}</Text>
              </View>
            )}
            <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>{t('coach.reset')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>{t('coach.subtitle')}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerSymbol}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
          {loading && <TypingIndicator />}

          {messages.length <= 1 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>{t('coach.topics')}</Text>
              <View style={styles.chipsWrap}>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s} style={styles.chip} onPress={() => send(s)} activeOpacity={0.7}>
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {exhausted ? (
          // Hak bitti: yazma alanı yerine ödeme duvarına götüren tek bir eylem
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.unlockBtn} onPress={() => setPaywallOpen(true)} activeOpacity={0.85}>
              <Text style={styles.unlockIcon}>Ω</Text>
              <Text style={styles.unlockText}>{t('paywall.title')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View style={styles.inputArea}>
          <Text style={styles.inputLabel}>{t('coach.inputLabel')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={t('coach.placeholder')}
              placeholderTextColor={Colors.stone4}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={() => send()}
              disabled={!input.trim() || loading}
            >
              {loading ? <ActivityIndicator size="small" color={Colors.stone} /> : <Text style={styles.sendIcon}>➤</Text>}
            </TouchableOpacity>
          </View>
        </View>
        )}
      </KeyboardAvoidingView>

      {/* onSubscribe verilmedi → buton "yakında" durumunda. RevenueCat bağlanınca
          satın alma akışı buraya prop olarak geçilecek. */}
      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontFamily: Fonts.cinzel, fontSize: 20, letterSpacing: 0.8, color: Colors.text },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(76,175,110,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(76,175,110,0.2)' },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 0.4, color: Colors.success },
  quotaBadge: {
    backgroundColor: 'rgba(196,169,106,0.1)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.25)',
  },
  quotaBadgeEnded: { backgroundColor: 'rgba(196,169,106,0.2)', borderColor: 'rgba(196,169,106,0.45)' },
  quotaText: { fontFamily: Fonts.jostMedium, fontSize: 10, letterSpacing: 0.4, color: Colors.sand2 },
  quotaTextEnded: { color: Colors.sand3 },
  unlockBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 15,
  },
  unlockIcon: { fontFamily: Fonts.cinzel, fontSize: 16, color: Colors.stone },
  unlockText: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.stone, letterSpacing: 1 },
  clearBtn: { backgroundColor: Colors.stone3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  clearBtnText: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.muted },
  messages: { flex: 1 },
  messagesContent: { padding: 20, gap: 16, paddingBottom: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(196,169,106,0.12)' },
  dividerSymbol: { fontSize: 10, color: Colors.sand, opacity: 0.5 },
  userBubbleWrap: { alignItems: 'flex-end' },
  userBubble: { backgroundColor: Colors.stone3, borderRadius: 18, borderBottomRightRadius: 5, padding: 14, maxWidth: '82%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  userText: { fontFamily: Fonts.jost, fontSize: 14, lineHeight: 22, color: Colors.text },
  aiBubbleWrap: { alignItems: 'flex-start' },
  aiLabel: { fontFamily: Fonts.cinzel, fontSize: 9, letterSpacing: 1.5, color: Colors.sand, opacity: 0.8, marginBottom: 6 },
  aiBubble: { backgroundColor: 'rgba(194,168,120,0.09)', borderRadius: 18, borderBottomLeftRadius: 5, padding: 16, maxWidth: '90%', borderWidth: 1, borderColor: 'rgba(194,168,120,0.18)' },
  aiText: { fontFamily: Fonts.jost, fontSize: 14, lineHeight: 24, color: Colors.text },
  quoteInline: { marginTop: 12, paddingTop: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: Colors.sand, borderTopWidth: 1, borderTopColor: 'rgba(196,169,106,0.15)' },
  quoteInlineText: { fontFamily: Fonts.cormorantItalic, fontSize: 12, lineHeight: 18, color: Colors.sand2 },
  timeMeta: { fontFamily: Fonts.jost, fontSize: 9, color: Colors.muted, marginTop: 4, letterSpacing: 0.3 },
  suggestions: { marginTop: 16 },
  suggestionsLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.muted, marginBottom: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: Colors.stone2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)' },
  chipText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.text2 },
  inputArea: { padding: 16, paddingBottom: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  inputLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.muted, marginBottom: 8, paddingLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, backgroundColor: Colors.stone2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: 100, lineHeight: 20 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 16, color: Colors.stone },
});
