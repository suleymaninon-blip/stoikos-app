import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../../constants/theme';
import { useTheme, useStyles, type Palette } from '../../constants/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang, localeOf } from '../../constants/i18n';
import { router, useLocalSearchParams } from 'expo-router';
import { COACH_INITIAL, COACH_SUGGESTIONS } from '../../constants/content';
import { sendCoach, getCoachQuota, type CoachQuota } from '../../constants/api';
import { Paywall } from '../../components/Paywall';
import StoikosMark from '../../components/StoikosMark';
import { confirmAction } from '../../constants/dialog';
import { CoachWaiting, WAIT_CLOSE_MS } from '../../components/CoachWaiting';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { CalmPressable } from '../../components/CalmPressable';

// ─── Types ────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'stoikos_chat_history';

// ── Öneri çipleri için kademeli giriş ──
function StaggerChip({
  delay,
  label,
  onPress,
}: {
  delay: number;
  label: string;
  onPress: () => void;
}) {
  const styles = useStyles(makeStyles);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const reduce = useReduceMotion();

  useEffect(() => {
    if (reduce) { opacity.setValue(1); translateY.setValue(0); return; }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY, reduce]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <CalmPressable style={[styles.chip, styles.cardShadow]} onPress={onPress} pressScale={0.96}>
        <Text style={styles.chipText}>{label}</Text>
      </CalmPressable>
    </Animated.View>
  );
}

// ─── Helpers ──────────────────────────────────────────────
function parseResponse(text: string): { body: string; quote: string | null } {
  // 1) Eski biçim: [ALINTI: "..." — Yazar, Kaynak] (karşılama mesajı & eski geçmiş)
  // 2) Yeni biçim: '>' ile işaretli alıntı satır(lar)ı
  const quoteMatch = text.match(/\[ALINTI:\s*"([^"]+)"\s*—\s*([^\]]+)\]/);
  if (quoteMatch) {
    const body = text.replace(quoteMatch[0], '').trim();
    return { body, quote: `"${quoteMatch[1]}" — ${quoteMatch[2]}` };
  }
  const lines = text.split('\n');
  const isQuote = (l: string) => /^\s*>/.test(l);
  if (lines.some(isQuote)) {
    const quote = lines.filter(isQuote).map((l) => l.replace(/^\s*>\s?/, '')).join(' ').trim();
    const body = lines.filter((l) => !isQuote(l)).join('\n').trim();
    return { body, quote: quote || null };
  }
  return { body: text, quote: null };
}

/**
 * Koç bazen markdown yazıyor (11 Kasım 2026, kullanıcı ekran görüntüsü): "--" ayraç satırları,
 * `*vurgu*`, `**kalın**`, `# başlık`, `- madde`. Ham işaret görünmesin: ayraçlar boş satıra döner,
 * başlık işareti düşer, madde "•" olur; vurgu/kalın `inlineWords` ile biçime çevrilir.
 */
function cleanMarkdown(text: string): string {
  return text
    .split('\n')
    .map((l) => {
      if (/^\s*([-—–_*=]\s*){2,}$/.test(l)) return '';
      return l.replace(/^\s*#{1,6}\s+/, '').replace(/^(\s*)[-*•]\s+/, '$1• ');
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type Word = { w: string; em: boolean; strong: boolean };
function inlineWords(para: string): Word[] {
  const out: Word[] = [];
  // Lookbehind yok: eski iOS Safari onu ayrıştıramıyor (beyaz ekran dersi).
  const re = /\*\*(.+?)\*\*|\*(?!\s)(.+?)\*/g;
  const push = (s: string, em: boolean, strong: boolean) =>
    s.split(' ').filter(Boolean).forEach((w) => out.push({ w, em, strong }));
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(para))) {
    push(para.slice(last, m.index), false, false);
    if (m[1] != null) push(m[1], false, true);
    else push(m[2], true, false);
    last = m.index + m[0].length;
  }
  push(para.slice(last), false, false);
  return out;
}

function FormattedText({ text, style, em, strong }: { text: string; style: any; em: any; strong: any }) {
  const paras = useMemo(() => text.split('\n').map(inlineWords), [text]);
  return (
    <Text style={style}>
      {paras.map((words, pi) => (
        <React.Fragment key={pi}>
          {pi > 0 && '\n'}
          {words.map((x, wi) => (
            <Text key={wi} style={x.strong ? strong : x.em ? em : undefined}>
              {(wi > 0 ? ' ' : '') + x.w}
            </Text>
          ))}
        </React.Fragment>
      ))}
    </Text>
  );
}

// ─── MessageBubble ────────────────────────────────────────
// Yeni koç cevabı kelime kelime belirir (10 Kasım 2026): 6 px aşağıdan, 32 ms arayla, en geç 1,4 sn.
// Ekran okuyucu metni tek seferde okur.
function RevealText({ text, style, em, strong }: { text: string; style: any; em: any; strong: any }) {
  const paras = useMemo(() => text.split('\n').map(inlineWords), [text]);
  const total = paras.reduce((n, p) => n + p.length, 0);
  const vals = useRef(Array.from({ length: total }, () => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.parallel(
      vals.map((v, i) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 420,
          delay: Math.min(i * 32, 1400),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);
  let k = 0;
  return (
    <View accessible accessibilityLabel={text}>
      {paras.map((words, pi) =>
        words.length === 0 ? (
          <View key={pi} style={{ height: 12 }} />
        ) : (
          <View key={pi} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {words.map((w, wi) => {
              const v = vals[k++];
              return (
                <Animated.Text
                  key={wi}
                  style={[
                    style,
                    w.strong ? strong : w.em ? em : null,
                    {
                      marginRight: 4.5,
                      opacity: v,
                      transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
                    },
                  ]}
                >
                  {w.w}
                </Animated.Text>
              );
            })}
          </View>
        )
      )}
    </View>
  );
}

function MessageBubble({
  message,
  reveal,
  onLayout,
}: {
  message: Message;
  reveal?: boolean;
  onLayout?: (y: number) => void;
}) {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const isUser = message.role === 'user';
  const reduce = useReduceMotion();
  const animate = !!reveal && !reduce;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(animate ? 0 : 10)).current;
  const scaleAnim = useRef(new Animated.Value(animate ? 0.86 : 1)).current;

  useEffect(() => {
    const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animate ? 420 : 300,
        easing: animate ? ease : undefined,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 420, easing: ease, useNativeDriver: true }),
    ]).start();
  }, []);

  if (isUser) {
    return (
      <Animated.View style={[styles.userBubbleWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.userBubble, styles.cardShadow]}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
        <Text style={styles.timeMeta}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    );
  }

  const parsed = parseResponse(message.content);
  const body = cleanMarkdown(parsed.body);
  const quote = parsed.quote && parsed.quote.replace(/\*\*|\*/g, '');
  return (
    <Animated.View
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.y) : undefined}
      style={[
        styles.aiBubbleWrap,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }], transformOrigin: 'left top' },
      ]}
    >
      <View style={styles.aiLabelRow}>
        <StoikosMark size={12} variant="line" color={Colors.sand} />
        <Text style={styles.aiLabel}>STOIKOS</Text>
      </View>
      <View style={[styles.aiBubble, styles.cardShadow]}>
        {animate ? (
          <RevealText text={body} style={styles.aiText} em={styles.aiEm} strong={styles.aiStrong} />
        ) : (
          <FormattedText text={body} style={styles.aiText} em={styles.aiEm} strong={styles.aiStrong} />
        )}
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
  const styles = useStyles(makeStyles);
  const pulse = useRef(new Animated.Value(0.5)).current;
  const reduce = useReduceMotion();
  useEffect(() => {
    if (reduce) { pulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduce]);
  return <Animated.View style={[styles.statusDot, { opacity: pulse }]} />;
}

// ─── Main Screen ──────────────────────────────────────────
export default function CoachScreen() {
  const { C: Colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const makeInitial = useCallback(
    (): Message => ({ id: '0', role: 'assistant', content: COACH_INITIAL[lang], timestamp: new Date() }),
    [lang]
  );

  const [messages, setMessages] = useState<Message[]>(() => [
    { id: '0', role: 'assistant', content: COACH_INITIAL[lang], timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  // Kontrol Eleği'nden "Bunu koçla konuş": elinde olan maddeler yazı alanına taslak olarak gelir, gönderilmez.
  const { draft } = useLocalSearchParams<{ draft?: string }>();
  useEffect(() => {
    if (!draft) return;
    setInput(String(draft));
    router.setParams({ draft: '' });
  }, [draft]);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [revealId, setRevealId] = useState<string | null>(null);
  const closeWait = () => {
    setClosing(true);
    return new Promise((r) => setTimeout(r, WAIT_CLOSE_MS));
  };
  // Kota yalnızca arayüz içindir; asıl kapı backend'de. null = bilinmiyor (ağ hatası).
  const [quota, setQuota] = useState<CoachQuota | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const exhausted = quota != null && !quota.subscribed && (quota.remaining ?? 1) <= 0;
  const weekly = quota?.period === 'week';
  const resetDay = quota?.resetsAt
    ? new Date(quota.resetsAt).toLocaleDateString(localeOf(lang), { weekday: 'long' })
    : '';
  const badgeText = !quota
    ? ''
    : weekly
    ? exhausted
      ? t('coach.resetsOn', { day: resetDay })
      : quota.remaining === 1
      ? t('coach.weekLast')
      : t('coach.weekLeft', { n: quota.remaining ?? 0 })
    : exhausted
    ? t('coach.quotaEnded')
    : t('coach.remaining', { n: quota.remaining ?? 0 });

  // Gönder düğmesinin metin girilince canlanması
  const sendReady = input.trim().length > 0 && !loading;
  const sendScale = useRef(new Animated.Value(sendReady ? 1 : 0.92)).current;
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    if (reduceMotion) { sendScale.setValue(1); return; }
    Animated.spring(sendScale, {
      toValue: sendReady ? 1 : 0.92,
      speed: 24,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [sendReady, sendScale, reduceMotion]);

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

  // Yeni mesajda sona kaydır — ama koçun yeni cevabında değil: uzun cevapta kişi metnin sonunda
  // kalıyordu (10 Kasım 2026). O cevap yerleşince başına kaydırılır (onRevealLayout).
  const revealScrolled = useRef<string | null>(null);
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!loading && last?.role === 'assistant' && last.id === revealId) return;
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const onRevealLayout = (id: string) => (y: number) => {
    if (revealScrolled.current === id) return;
    revealScrolled.current = id;
    setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true }), 60);
  };

  const saveMessages = useCallback((msgs: Message[]) => {
    AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs));
  }, []);

  async function send(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    if (exhausted) {
      setPaywallOpen(true);
      return;
    }
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    saveMessages(withUser);
    setLoading(true);
    try {
      // Karşılama mesajı (id '0') çıkar — Claude ilk mesajın 'user' olmasını ister.
      // Asıl kırpma backend'de (MAX_HISTORY_MESSAGES); buradaki pencere kasten daha geniş.
      const payload = withUser
        .filter((m) => m.id !== '0')
        .slice(-24)
        .map((m) => ({ role: m.role, content: m.content }));
      const { reply, remaining, subscribed, ...rest } = await sendCoach(lang, payload);
      setQuota((q) =>
        q ? { ...q, remaining, subscribed, period: rest.period ?? q.period, resetsAt: rest.resetsAt ?? q.resetsAt } : q
      );
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() };
      await closeWait();
      setRevealId(aiMsg.id);
      const final = [...withUser, aiMsg];
      setMessages(final);
      saveMessages(final);
    } catch (e: any) {
      // Hak bitti → sohbete balon EKLEME: açıklama duvarda/kartta ve 6 dilde; backend'in gerekçesi yalnız Türkçe.
      if (e?.quotaExceeded) {
        setQuota((q) => ({
          ...(q ?? { subscribed: false, used: 0, limit: 0 }),
          remaining: 0,
          period: e.period ?? q?.period,
          resetsAt: e.resetsAt ?? q?.resetsAt,
        }));
        // Haftalık hakta duvar açılmaz: yazma alanının yerindeki kart ne zaman açılacağını söyler.
        if (e.period !== 'week') setPaywallOpen(true);
        return;
      }
      const errContent =
        e?.rateLimitScope === 'minute'
          ? t('coach.tooFast')
          : e?.rateLimitScope === 'day'
          ? t('coach.dailyLimit')
          : e?.userMessage || t('coach.connError');
      await closeWait();
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: errContent, timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
      setClosing(false);
    }
  }

  // Onaysız silmek tek dokunuşta konuşmayı kaybettiriyordu; mesaj sunucu hafızasının ayrıca Ayarlar'dan silindiğini söyler.
  async function clearChat() {
    if (messages.length > 1) {
      const ok = await confirmAction({
        title: t('coach.resetTitle'),
        message: t('coach.resetMsg'),
        confirmText: t('progress.reset'),
        cancelText: t('progress.cancel'),
        destructive: true,
      });
      if (!ok) return;
    }
    setMessages([makeInitial()]);
    AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  }

  const suggestions = COACH_SUGGESTIONS[lang];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.tint(Colors.isDark ? 0.07 : 0.08), 'transparent']}
        style={styles.gradientTop}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('coach.title')}</Text>
          <View style={styles.headActions}>
            {quota && !quota.subscribed ? (
              <TouchableOpacity
                style={[styles.quotaBadge, exhausted && styles.quotaBadgeEnded]}
                onPress={() => setPaywallOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quotaText, exhausted && styles.quotaTextEnded]}>{badgeText}</Text>
              </TouchableOpacity>
            ) : quota?.subscribed ? (
              <View style={styles.statusBadge}>
                <PulseDot />
                <Text style={styles.statusText}>{t('coach.active')}</Text>
              </View>
            ) : null /* kota bilinmiyorsa (ağ hatası) yeşil "Yanında" gösterme: yanıltıcıydı */}
            <TouchableOpacity onPress={clearChat} style={styles.clearBtn} activeOpacity={0.75}>
              <Text style={styles.clearBtnText}>{t('coach.reset')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>{t('coach.subtitle')}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerSymbol}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              reveal={msg.id === revealId}
              onLayout={msg.id === revealId ? onRevealLayout(msg.id) : undefined}
            />
          ))}
          {loading && <CoachWaiting closing={closing} />}

          {messages.length <= 1 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>{t('coach.topics')}</Text>
              <View style={styles.chipsWrap}>
                {suggestions.map((s, i) => (
                  <StaggerChip key={s} delay={80 + i * 55} label={s} onPress={() => send(s)} />
                ))}
              </View>
              {/* İlk kez gelen kişi neyle konuştuğunu ve yazdığının nereye gittiğini bilmeli */}
              <Text style={styles.disclaimer}>{t('coach.disclaimer')}</Text>
            </View>
          )}
        </ScrollView>

        {exhausted && weekly ? (
          <View style={[styles.weekCard, styles.cardShadow]}>
            <Text style={styles.weekTitle}>{t('coach.weekEndedTitle', { n: quota?.limit ?? 3 })}</Text>
            <Text style={styles.weekBody}>{t('coach.weekEndedBody', { day: resetDay })}</Text>
            <CalmPressable style={styles.weekPlus} onPress={() => setPaywallOpen(true)}>
              <Text style={styles.weekPlusText}>{t('coach.plusCta')}</Text>
            </CalmPressable>
            <Text style={styles.weekWaitLabel}>{t('coach.whileWaiting')}</Text>
            <View style={styles.weekRow}>
              <CalmPressable style={[styles.weekAlt, styles.weekAltMoon]} onPress={() => router.push('/practice')}>
                <Text style={[styles.weekAltText, { color: Colors.moon }]}>{t('coach.writeReflection')}</Text>
              </CalmPressable>
              <CalmPressable style={styles.weekAlt} onPress={() => router.push('/programs')}>
                <Text style={styles.weekAltText}>{t('coach.continueProgram')}</Text>
              </CalmPressable>
            </View>
          </View>
        ) : exhausted ? (
          <View style={styles.inputArea}>
            <CalmPressable style={styles.unlockBtn} onPress={() => setPaywallOpen(true)}>
              <StoikosMark size={20} variant="line" color={Colors.stone} />
              <Text style={styles.unlockText}>{t('paywall.title')}</Text>
            </CalmPressable>
          </View>
        ) : (
          <View style={styles.inputArea}>
            {weekly && quota?.remaining === 1 && !quota.subscribed && quota.resetsAt ? (
              <Text style={styles.lastWarning}>{t('coach.lastWarning', { day: resetDay })}</Text>
            ) : null}
            <Text style={styles.inputLabel}>{t('coach.inputLabel')}</Text>
            <View style={styles.inputRow}>
              <TextInput
                keyboardAppearance={Colors.isDark ? 'dark' : 'light'}
                style={[styles.input, inputFocused && styles.inputFocused]}
                placeholder={t('coach.placeholder')}
                placeholderTextColor={Colors.muted}
                value={input}
                onChangeText={setInput}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                multiline
                maxLength={500}
              />
              <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <CalmPressable
                  style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                  onPress={() => send()}
                  disabled={!input.trim() || loading}
                  pressScale={0.94}
                  accessibilityLabel={t('coach.inputLabel')}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.stone} />
                  ) : (
                    <Text style={styles.sendIcon}>➤</Text>
                  )}
                </CalmPressable>
              </Animated.View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* onSubscribe verilmedi → buton "yakında" durumunda; RevenueCat bağlanınca buraya geçilecek. */}
      <Paywall visible={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const makeStyles = (Colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },

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

    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors.overlay(0.06),
    },
    // Uzun dillerde (RU/DE) rozet iki satıra iner; Sıfırla düğmesi taşmaz.
    headActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
    title: { flexShrink: 1, fontFamily: Fonts.cinzel, fontSize: 20, letterSpacing: 0.8, color: Colors.text },
    subtitle: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, letterSpacing: 0.3 },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(76,175,110,0.1)',
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: 'rgba(76,175,110,0.22)',
    },
    statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success },
    statusText: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 0.4, color: Colors.success },
    quotaBadge: {
      flexShrink: 1,
      backgroundColor: Colors.tint(0.1),
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: Colors.tint(0.25),
    },
    quotaBadgeEnded: { backgroundColor: Colors.tint(0.2), borderColor: Colors.tint(0.45) },
    quotaText: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 0.4, color: Colors.sand2, textAlign: 'center' },
    quotaTextEnded: { color: Colors.sand3 },
    unlockBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: Colors.accent,
      borderRadius: 18,
      paddingVertical: 15,
    },
    unlockText: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.stone, letterSpacing: 1 },
    clearBtn: {
      backgroundColor: Colors.stone3,
      borderRadius: 14,
      paddingHorizontal: 14,
      minHeight: 44,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.overlay(0.07),
    },
    clearBtnText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.text2 },

    messages: { flex: 1 },
    messagesContent: { padding: 20, gap: 18, paddingBottom: 14 },
    divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.tint(0.12) },
    dividerSymbol: { fontSize: 12, color: Colors.sand, opacity: 0.5 },

    userBubbleWrap: { alignItems: 'flex-end' },
    userBubble: {
      backgroundColor: Colors.stone3,
      borderRadius: 20,
      borderBottomRightRadius: 6,
      paddingHorizontal: 16,
      paddingVertical: 13,
      maxWidth: '82%',
      borderWidth: 1,
      borderColor: Colors.overlay(0.06),
    },
    userText: { fontFamily: Fonts.jost, fontSize: 16, lineHeight: 24, color: Colors.text },

    aiBubbleWrap: { alignItems: 'flex-start' },
    aiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6, opacity: 0.85 },
    aiLabel: { fontFamily: Fonts.cinzel, fontSize: 11, letterSpacing: 1.5, color: Colors.sand },
    aiBubble: {
      backgroundColor: Colors.tint(Colors.isDark ? 0.09 : 0.07),
      borderRadius: 22,
      borderBottomLeftRadius: 6,
      padding: 18,
      maxWidth: '90%',
      borderWidth: 1,
      borderColor: Colors.tint(0.18),
    },
    aiText: { fontFamily: Fonts.jost, fontSize: 16, lineHeight: 26, color: Colors.text },
    aiEm: { fontStyle: 'italic', color: Colors.sand2 },
    aiStrong: { fontFamily: Fonts.jostMedium },
    quoteInline: {
      marginTop: 14,
      paddingTop: 12,
      paddingLeft: 12,
      borderLeftWidth: 2,
      borderLeftColor: Colors.sand,
      borderTopWidth: 1,
      borderTopColor: Colors.tint(0.15),
    },
    quoteInlineText: { fontFamily: Fonts.cormorantItalic, fontSize: 17, lineHeight: 24, color: Colors.sand2 },
    timeMeta: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, marginTop: 5, letterSpacing: 0.3 },

    suggestions: { marginTop: 18 },
    disclaimer: { fontFamily: Fonts.jost, fontSize: 12, lineHeight: 18, color: Colors.muted, marginTop: 18 },
    suggestionsLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.muted, marginBottom: 12 },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
    chip: {
      backgroundColor: Colors.stone2,
      borderRadius: 22,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: Colors.tint(0.22),
    },
    chipText: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.text2 },

    lastWarning: { fontFamily: Fonts.jost, fontSize: 13, color: Colors.sand2, marginBottom: 8 },
    weekCard: {
      margin: 16,
      marginTop: 8,
      padding: 20,
      gap: 12,
      borderRadius: 24,
      backgroundColor: Colors.stone2,
      borderWidth: 1,
      borderColor: Colors.tint(0.28),
    },
    weekTitle: { fontFamily: Fonts.cormorant, fontSize: 22, color: Colors.text },
    weekBody: { fontFamily: Fonts.jost, fontSize: 15, lineHeight: 22, color: Colors.text2, marginTop: -6 },
    weekPlus: {
      minHeight: 50,
      borderRadius: 16,
      backgroundColor: Colors.sand,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    weekPlusText: { fontFamily: Fonts.jostMedium, fontSize: 15, color: Colors.bg, textAlign: 'center' },
    weekWaitLabel: { fontFamily: Fonts.jostMedium, fontSize: 12, letterSpacing: 2, color: Colors.muted, marginTop: 2 },
    weekRow: { flexDirection: 'row', gap: 8 },
    weekAlt: {
      flex: 1,
      minHeight: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: Colors.tint(0.3),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    weekAltMoon: { borderColor: Colors.moonA(0.3) },
    weekAltText: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.sand2, textAlign: 'center' },

    inputArea: {
      padding: 16,
      paddingBottom: 10,
      borderTopWidth: 1,
      borderTopColor: Colors.overlay(0.06),
    },
    inputLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 2, color: Colors.muted, marginBottom: 8, paddingLeft: 4 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
    input: {
      flex: 1,
      backgroundColor: Colors.stone2,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontFamily: Fonts.jost,
      fontSize: 16,
      color: Colors.text,
      borderWidth: 1,
      borderColor: Colors.overlay(0.08),
      maxHeight: 110,
      lineHeight: 22,
    },
    inputFocused: {
      borderColor: Colors.tint(0.42),
    },
    sendBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: Colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.38 },
    sendIcon: { fontSize: 16, color: Colors.stone },
  });
