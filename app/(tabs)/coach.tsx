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
import { API_KEY_STORAGE } from '../setup';
import { useLang } from '../../constants/i18n';
import { coachSystemPrompt, COACH_INITIAL, COACH_SUGGESTIONS } from '../../constants/content';

// ─── Types ────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CHAT_HISTORY_KEY = 'stoikos_chat_history';

// ─── API ──────────────────────────────────────────────────
async function sendToClaudeText(messages: Message[], system: string): Promise<string> {
  const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system,
      messages: apiMessages,
    }),
  });
  if (!response.ok) throw new Error(`API hatası: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

// ─── Helpers ──────────────────────────────────────────────
function parseResponse(text: string): { body: string; quote: string | null } {
  const quoteMatch = text.match(/\[ALINTI:\s*"([^"]+)"\s*—\s*([^\]]+)\]/);
  if (quoteMatch) {
    const body = text.replace(quoteMatch[0], '').trim();
    return { body, quote: `"${quoteMatch[1]}" — ${quoteMatch[2]}` };
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
  const scrollRef = useRef<ScrollView>(null);

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
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    saveMessages(withUser);
    setLoading(true);
    try {
      const reply = await sendToClaudeText(withUser, coachSystemPrompt(lang));
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() };
      const final = [...withUser, aiMsg];
      setMessages(final);
      saveMessages(final);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: t('coach.connError'), timestamp: new Date() }]);
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
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t('coach.active')}</Text>
            </View>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontFamily: Fonts.cinzel, fontSize: 20, letterSpacing: 0.8, color: Colors.text },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(76,175,110,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(76,175,110,0.2)' },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { fontFamily: Fonts.jostMedium, fontSize: 8, letterSpacing: 1.5, color: Colors.success },
  clearBtn: { backgroundColor: Colors.stone3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  clearBtnText: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.muted },
  messages: { flex: 1 },
  messagesContent: { padding: 20, gap: 16, paddingBottom: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(196,169,106,0.12)' },
  dividerSymbol: { fontSize: 10, color: Colors.sand, opacity: 0.5 },
  userBubbleWrap: { alignItems: 'flex-end' },
  userBubble: { backgroundColor: Colors.stone4, borderRadius: 18, borderBottomRightRadius: 5, padding: 14, maxWidth: '82%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  userText: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 20, color: Colors.text },
  aiBubbleWrap: { alignItems: 'flex-start' },
  aiLabel: { fontFamily: Fonts.cinzel, fontSize: 9, letterSpacing: 1.5, color: Colors.sand, opacity: 0.8, marginBottom: 6 },
  aiBubble: { backgroundColor: 'rgba(212,146,74,0.08)', borderRadius: 18, borderBottomLeftRadius: 5, padding: 14, maxWidth: '88%', borderWidth: 1, borderColor: 'rgba(196,169,106,0.18)' },
  aiText: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 21, color: Colors.sand3 },
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
