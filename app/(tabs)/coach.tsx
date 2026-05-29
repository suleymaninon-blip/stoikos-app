import React, { useState, useRef, useEffect } from 'react';
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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Sen Stoikos'sun — antik Stoacı felsefesini modern hayata taşıyan bir bilgelik rehberisin.

Görevin:
- Kullanıcının sorunlarını, kaygılarını veya duygularını Stoacı perspektifle ele almak
- Marcus Aurelius, Epiktetos ve Seneca'nın öğretilerini pratik tavsiyeye dönüştürmek
- Her yanıta uygun bir Stoacı alıntı eklemek (Türkçe)
- Kısa, öz ve derin yanıtlar vermek — vaaz değil, rehberlik

Temel Stoacı kavramlar:
- Dichotomy of Control: Kontrolündeki vs. kontrolün dışındaki
- Negative Visualization: Kaybetme ihtimalini düşünmek
- Memento Mori: Ölümlülüğü hatırlamak
- Amor Fati: Kaderini sevmek
- Premeditatio Malorum: Kötülükleri önceden düşünmek

Yanıt formatı:
1. Empati ile başla (1-2 cümle)
2. Stoacı çerçeve sun (2-3 cümle)
3. Pratik tavsiye ver (1-2 cümle)
4. Alıntı ekle şu formatta: [ALINTI: "alıntı metni" — Yazar, Kaynak]

Türkçe yaz. Sıcak ama güçlü bir ton kullan.`;

async function sendToClaudeAPI(messages: Message[]): Promise<string> {
  const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  });

  if (!response.ok) throw new Error(`API hatası: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

function parseResponse(text: string): { body: string; quote: string | null } {
  const quoteMatch = text.match(/\[ALINTI:\s*"([^"]+)"\s*—\s*([^\]]+)\]/);
  if (quoteMatch) {
    const body = text.replace(quoteMatch[0], '').trim();
    return { body, quote: `"${quoteMatch[1]}" — ${quoteMatch[2]}` };
  }
  return { body: text, quote: null };
}

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
          {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
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
        {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
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

const SUGGESTIONS = ['İşte başarısız oldum', 'Kaygı içindeyim', 'Birileri beni eleştiriyor', 'Geleceğim belirsiz', 'Öfkeyi nasıl yönetirim?'];

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Merhaba. Bugün sana nasıl yardımcı olabilirim? Yaşadığın zorluğu veya hissettiğin duyguyu bana anlat — birlikte Stoacı bir bakış açısı geliştirelim.\n\n[ALINTI: "Kendine dönük yolculuk, tüm yolculukların en uzunudur." — Seneca, Epistulae]',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await sendToClaudeAPI([...messages, userMsg]);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Bağlantı hatası oluştu. Lütfen tekrar dene.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(212,146,74,0.05)', 'transparent']} style={styles.gradientTop} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Stoacı Koç</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AKTİF</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Epiktetos'un bilgeliğiyle rehberlik</Text>
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
              <Text style={styles.suggestionsLabel}>KONULAR</Text>
              <View style={styles.chipsWrap}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s} style={styles.chip} onPress={() => send(s)} activeOpacity={0.7}>
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <Text style={styles.inputLabel}>DÜŞÜNCENI YAZ</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Bugün ne hissediyorsun?"
              placeholderTextColor={Colors.stone4}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} onPress={() => send()} disabled={!input.trim() || loading} activeOpacity={0.8}>
              {loading ? <ActivityIndicator size="small" color={Colors.stone} /> : <Text style={styles.sendIcon}>➤</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  title: { fontFamily: Fonts.cinzel, fontSize: 20, letterSpacing: 0.8, color: Colors.text },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(76,175,110,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(76,175,110,0.2)' },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success, shadowColor: Colors.success, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 3 },
  statusText: { fontFamily: Fonts.jostMedium, fontSize: 8, letterSpacing: 1.5, color: Colors.success },
  subtitle: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, letterSpacing: 0.3 },
  messages: { flex: 1 },
  messagesContent: { padding: 20, gap: 16, paddingBottom: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(196,169,106,0.12)' },
  dividerSymbol: { fontSize: 10, color: Colors.sand, opacity: 0.5 },
  userBubbleWrap: { alignItems: 'flex-end' },
  userBubble: { backgroundColor: Colors.stone4, borderRadius: 18, borderBottomRightRadius: 5, padding: 14, maxWidth: '82%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  userText: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 20, color: Colors.text },
  aiBubbleWrap: { alignItems: 'flex-start' },
  aiLabel: { fontFamily: Fonts.cinzel, fontSize: 9, letterSpacing: 1.5, color: Colors.sand, marginBottom: 6, opacity: 0.8 },
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
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  sendBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  sendIcon: { fontSize: 16, color: Colors.stone },
});
