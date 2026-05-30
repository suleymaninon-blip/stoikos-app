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
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';

// ─── Types ────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────
const CHAT_HISTORY_KEY = 'stoikos_chat_history';

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

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: 'Merhaba. Bugün sana nasıl yardımcı olabilirim? Yaşadığın zorluğu veya hissettiğin duyguyu bana anlat — birlikte Stoacı bir bakış açısı geliştirelim.\n\n[ALINTI: "Kendine dönük yolculuk, tüm yolculukların en uzunudur." — Seneca, Epistulae]',
  timestamp: new Date(),
};

const SUGGESTIONS = ['İşte başarısız oldum', 'Kaygı içindeyim', 'Birileri beni eleştiriyor', 'Geleceğim belirsiz', 'Öfkeyi nasıl yönetirim?'];

// ─── API ──────────────────────────────────────────────────
async function sendToClaudeText(messages: Message[]): Promise<string> {
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
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  });
  if (!response.ok) throw new Error(`API hatası: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

async function sendToClaudeAudio(base64Audio: string, prevMessages: Message[]): Promise<string> {
  const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
  const history = prevMessages.map((m) => ({ role: m.role, content: m.content }));
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'audio-1',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT + '\n\nKullanıcı sesli mesaj gönderdi. Sesi dikkatlice dinle, ne dediğini anla ve Stoacı rehber olarak yanıtla. Türkçe konuş.',
      messages: [
        ...history,
        {
          role: 'user',
          content: [
            {
              type: 'audio',
              source: {
                type: 'base64',
                media_type: 'audio/mp4',
                data: base64Audio,
              },
            },
          ],
        },
      ],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API hatası: ${response.status}`);
  }
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

function getSpeakableText(text: string): string {
  const { body, quote } = parseResponse(text);
  return quote ? `${body} Alıntı: ${quote}` : body;
}

// ─── MessageBubble ────────────────────────────────────────
function MessageBubble({ message, voiceMode, onSpeak }: {
  message: Message;
  voiceMode: boolean;
  onSpeak: (text: string) => void;
}) {
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
      <View style={styles.aiLabelRow}>
        <Text style={styles.aiLabel}>Ω  STOIKOS</Text>
        {voiceMode && (
          <TouchableOpacity onPress={() => onSpeak(message.content)} style={styles.speakBtn}>
            <Text style={styles.speakIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>
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

function RecordingPulse() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.recordPulse, { transform: [{ scale: pulseAnim }] }]} />;
}

// ─── Main Screen ──────────────────────────────────────────
export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
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
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const saveMessages = useCallback((msgs: Message[]) => {
    AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs));
  }, []);

  // ─── Text send ──────────────────────────────────────────
  async function sendText(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    saveMessages(withUser);
    setLoading(true);
    try {
      const reply = await sendToClaudeText(withUser);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() };
      const final = [...withUser, aiMsg];
      setMessages(final);
      saveMessages(final);
      if (voiceMode && autoSpeak) speakText(reply);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Bağlantı hatası oluştu. Lütfen tekrar dene.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  // ─── Voice recording ────────────────────────────────────
  async function startRecording() {
    if (loading) return;
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
    } catch (e) {
      console.error('Kayıt başlatılamadı:', e);
    }
  }

  async function stopRecordingAndSend() {
    if (!recording || !isRecording) return;
    setIsRecording(false);
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) throw new Error('Ses dosyası alınamadı');

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: '🎙️ Sesli mesaj',
        timestamp: new Date(),
      };
      const withUser = [...messages, userMsg];
      setMessages(withUser);

      const reply = await sendToClaudeAudio(base64, messages);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() };
      const final = [...withUser, aiMsg];
      setMessages(final);
      saveMessages(final);
      if (autoSpeak) speakText(reply);
    } catch (e: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ses işlenemedi: ${e.message?.slice(0, 80) || 'bilinmeyen hata'}. Yazmayı deneyin.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setRecording(null);
    } finally {
      setLoading(false);
    }
  }

  // ─── TTS ────────────────────────────────────────────────
  function speakText(text: string) {
    Speech.stop();
    setIsSpeaking(true);
    Speech.speak(getSpeakableText(text), {
      language: 'tr-TR',
      rate: 0.9,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }

  function stopSpeaking() {
    Speech.stop();
    setIsSpeaking(false);
  }

  function clearChat() {
    Speech.stop();
    setIsSpeaking(false);
    setMessages([INITIAL_MESSAGE]);
    AsyncStorage.removeItem(CHAT_HISTORY_KEY);
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(212,146,74,0.05)', 'transparent']} style={styles.gradientTop} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Stoacı Koç</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => { setVoiceMode(!voiceMode); if (isSpeaking) stopSpeaking(); }}
              style={[styles.voiceToggle, voiceMode && styles.voiceToggleActive]}
            >
              <Text style={[styles.voiceToggleText, voiceMode && styles.voiceToggleTextActive]}>
                {voiceMode ? '🎙️ Ses' : '⌨️ Yazı'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Sıfırla</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.subtitleRow}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>AKTİF</Text>
          </View>
          {voiceMode && (
            <TouchableOpacity onPress={() => setAutoSpeak(!autoSpeak)} style={styles.autoSpeakBtn}>
              <Text style={styles.autoSpeakText}>{autoSpeak ? '🔊 Otomatik Oku' : '🔇 Sessiz'}</Text>
            </TouchableOpacity>
          )}
          {isSpeaking && (
            <TouchableOpacity onPress={stopSpeaking} style={styles.stopSpeakBtn}>
              <Text style={styles.stopSpeakText}>⏹ Durdur</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerSymbol}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} voiceMode={voiceMode} onSpeak={speakText} />
          ))}
          {loading && <TypingIndicator />}

          {messages.length <= 1 && !voiceMode && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>KONULAR</Text>
              <View style={styles.chipsWrap}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s} style={styles.chip} onPress={() => sendText(s)} activeOpacity={0.7}>
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.length <= 1 && voiceMode && (
            <View style={styles.voiceHint}>
              <Text style={styles.voiceHintIcon}>🎙️</Text>
              <Text style={styles.voiceHintText}>Mikrofon butonuna basılı tut ve konuş</Text>
              <Text style={styles.voiceHintSub}>Bırakınca otomatik gönderilir</Text>
            </View>
          )}
        </ScrollView>

        {voiceMode ? (
          <View style={styles.voiceInputArea}>
            <View style={styles.voiceInputRow}>
              <TextInput
                style={styles.input}
                placeholder="Yazmayı da kullanabilirsin..."
                placeholderTextColor={Colors.stone4}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => sendText()}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={() => sendText()}
                disabled={!input.trim() || loading}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              onPressIn={startRecording}
              onPressOut={stopRecordingAndSend}
              disabled={loading}
              activeOpacity={0.85}
            >
              {isRecording ? (
                <View style={styles.micBtnInner}>
                  <RecordingPulse />
                  <Text style={styles.micIcon}>🎙️</Text>
                  <Text style={styles.micLabel}>Dinliyorum... (bırak gönder)</Text>
                </View>
              ) : (
                <View style={styles.micBtnInner}>
                  {loading
                    ? <ActivityIndicator size="large" color={Colors.accent} />
                    : <Text style={styles.micIcon}>🎙️</Text>
                  }
                  <Text style={styles.micLabel}>{loading ? 'Yanıt bekleniyor...' : 'Bas & Konuş'}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
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
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                onPress={() => sendText()}
                disabled={!input.trim() || loading}
              >
                {loading ? <ActivityIndicator size="small" color={Colors.stone} /> : <Text style={styles.sendIcon}>➤</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontFamily: Fonts.cinzel, fontSize: 20, letterSpacing: 0.8, color: Colors.text },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(76,175,110,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(76,175,110,0.2)' },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { fontFamily: Fonts.jostMedium, fontSize: 8, letterSpacing: 1.5, color: Colors.success },
  clearBtn: { backgroundColor: Colors.stone3, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  clearBtnText: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.muted },
  voiceToggle: { backgroundColor: Colors.stone3, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  voiceToggleActive: { backgroundColor: 'rgba(212,146,74,0.2)', borderColor: Colors.accent },
  voiceToggleText: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.muted },
  voiceToggleTextActive: { color: Colors.accent },
  autoSpeakBtn: { backgroundColor: 'rgba(196,169,106,0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(196,169,106,0.2)' },
  autoSpeakText: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.sand },
  stopSpeakBtn: { backgroundColor: 'rgba(220,80,80,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(220,80,80,0.3)' },
  stopSpeakText: { fontFamily: Fonts.jost, fontSize: 10, color: '#e08080' },
  messages: { flex: 1 },
  messagesContent: { padding: 20, gap: 16, paddingBottom: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(196,169,106,0.12)' },
  dividerSymbol: { fontSize: 10, color: Colors.sand, opacity: 0.5 },
  userBubbleWrap: { alignItems: 'flex-end' },
  userBubble: { backgroundColor: Colors.stone4, borderRadius: 18, borderBottomRightRadius: 5, padding: 14, maxWidth: '82%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  userText: { fontFamily: Fonts.jost, fontSize: 13, lineHeight: 20, color: Colors.text },
  aiBubbleWrap: { alignItems: 'flex-start' },
  aiLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  aiLabel: { fontFamily: Fonts.cinzel, fontSize: 9, letterSpacing: 1.5, color: Colors.sand, opacity: 0.8 },
  speakBtn: { padding: 4 },
  speakIcon: { fontSize: 14 },
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
  voiceHint: { alignItems: 'center', marginTop: 48, gap: 12 },
  voiceHintIcon: { fontSize: 56 },
  voiceHintText: { fontFamily: Fonts.cinzel, fontSize: 14, color: Colors.text2, letterSpacing: 0.5, textAlign: 'center' },
  voiceHintSub: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.muted, textAlign: 'center' },
  inputArea: { padding: 16, paddingBottom: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  inputLabel: { fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.muted, marginBottom: 8, paddingLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: { flex: 1, backgroundColor: Colors.stone2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontFamily: Fonts.jost, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', maxHeight: 100, lineHeight: 20 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 16, color: Colors.stone },
  voiceInputArea: { padding: 16, paddingBottom: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', gap: 12 },
  voiceInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  micBtn: {
    backgroundColor: 'rgba(212,146,74,0.1)',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,146,74,0.35)',
  },
  micBtnActive: {
    backgroundColor: 'rgba(220,80,80,0.15)',
    borderColor: '#e08080',
  },
  micBtnInner: { alignItems: 'center', gap: 6 },
  micIcon: { fontSize: 36 },
  micLabel: { fontFamily: Fonts.cinzel, fontSize: 12, color: Colors.sand2, letterSpacing: 0.5 },
  recordPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(220,80,80,0.2)',
  },
});
