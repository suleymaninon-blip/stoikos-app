import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../constants/theme';
import { useLang, LANGUAGES } from '../constants/i18n';

export const API_KEY_STORAGE = 'stoikos_api_key';

async function validateKey(key: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    return res.status === 200 || res.status === 400; // 400 = wrong format but key valid
  } catch {
    return false;
  }
}

export default function SetupScreen() {
  const { t, lang, setLang } = useLang();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  async function handleSave() {
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError(t('setup.errFormat'));
      return;
    }
    setError('');
    setLoading(true);
    const valid = await validateKey(trimmed);
    setLoading(false);
    if (!valid) {
      setError(t('setup.errInvalid'));
      return;
    }
    await AsyncStorage.setItem(API_KEY_STORAGE, trimmed);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(212,146,74,0.08)', 'transparent']}
        style={styles.grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <Text style={styles.omega}>Ω</Text>
          <Text style={styles.appName}>STOIKOS</Text>
          <Text style={styles.tagline}>{t('setup.tagline')}</Text>

          {/* Dil seçici */}
          <View style={styles.langRow}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                onPress={() => setLang(l.code)}
                style={[styles.langChip, lang === l.code && styles.langChipActive]}
                activeOpacity={0.8}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divSym}>✦</Text>
            <View style={styles.divLine} />
          </View>

          {/* Açıklama */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('setup.startTitle')}</Text>
            <Text style={styles.infoText}>{t('setup.startInfo')}</Text>
            <TouchableOpacity
              onPress={() => {
                const { Linking } = require('react-native');
                Linking.openURL('https://console.anthropic.com/');
              }}
              style={styles.linkBtn}
            >
              <Text style={styles.linkText}>{t('setup.getKey')}</Text>
            </TouchableOpacity>
          </View>

          {/* Input */}
          <Text style={styles.inputLabel}>{t('setup.keyLabel')}</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="sk-ant-api03-..."
              placeholderTextColor={Colors.stone4}
              value={key}
              onChangeText={(txt) => { setKey(txt); setError(''); }}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(!showKey)}>
              <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Kaydet */}
          <TouchableOpacity
            style={[styles.saveBtn, (!key.trim() || loading) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!key.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.stone} />
            ) : (
              <Text style={styles.saveBtnText}>{t('setup.verify')}</Text>
            )}
          </TouchableOpacity>

          {/* Güvenlik notu */}
          <Text style={styles.secNote}>{t('setup.secNote')}</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  grad: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scroll: { padding: 32, paddingTop: 60, alignItems: 'center' },
  omega: { fontFamily: Fonts.cinzel, fontSize: 72, color: Colors.sand, opacity: 0.15, lineHeight: 80 },
  appName: { fontFamily: Fonts.cinzelBold, fontSize: 32, letterSpacing: 6, color: Colors.sand2, marginTop: -10 },
  tagline: { fontFamily: Fonts.jostLight, fontSize: 12, letterSpacing: 2, color: Colors.muted, marginTop: 6, marginBottom: 20 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 24 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.stone2, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  langChipActive: { backgroundColor: 'rgba(212,146,74,0.18)', borderColor: Colors.accent },
  langFlag: { fontSize: 14 },
  langLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, color: Colors.muted },
  langLabelActive: { color: Colors.accent },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 28 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(196,169,106,0.15)' },
  divSym: { fontSize: 10, color: Colors.sand, opacity: 0.5 },
  infoCard: {
    width: '100%', backgroundColor: Colors.stone2,
    borderRadius: 16, padding: 20, marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(196,169,106,0.15)',
  },
  infoTitle: { fontFamily: Fonts.cinzel, fontSize: 13, color: Colors.sand2, letterSpacing: 0.5, marginBottom: 8 },
  infoText: { fontFamily: Fonts.jost, fontSize: 12, color: Colors.text2, lineHeight: 19, marginBottom: 12 },
  linkBtn: { alignSelf: 'flex-start' },
  linkText: { fontFamily: Fonts.jostMedium, fontSize: 12, color: Colors.accent, letterSpacing: 0.3 },
  inputLabel: { alignSelf: 'flex-start', fontFamily: Fonts.jostMedium, fontSize: 9, letterSpacing: 2, color: Colors.muted, marginBottom: 8 },
  inputWrap: { width: '100%', position: 'relative', marginBottom: 8 },
  input: {
    width: '100%', backgroundColor: Colors.stone2,
    borderRadius: 14, paddingHorizontal: 16, paddingRight: 48, paddingVertical: 14,
    fontFamily: Fonts.jost, fontSize: 13, color: Colors.text,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeIcon: { fontSize: 16 },
  error: { alignSelf: 'flex-start', fontFamily: Fonts.jost, fontSize: 11, color: '#e06c6c', marginBottom: 12 },
  saveBtn: {
    width: '100%', backgroundColor: Colors.accent,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    marginTop: 8, marginBottom: 16,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  saveBtnText: { fontFamily: Fonts.cinzel, fontSize: 14, letterSpacing: 1.5, color: Colors.stone },
  secNote: { fontFamily: Fonts.jost, fontSize: 10, color: Colors.muted, textAlign: 'center', lineHeight: 16 },
});
