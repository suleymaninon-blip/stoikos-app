import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts } from '../constants/theme';
import { useLang } from '../constants/i18n';
import { adminPending, adminModerate, ADMIN_KEY_STORAGE } from '../constants/api';

export default function ChallengeAdminScreen() {
  const { t } = useLang();
  const [key, setKey] = useState('');
  const [items, setItems] = useState<{ id: number; text: string; author: string | null; lang: string }[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(k: string) {
    setLoading(true);
    setItems(await adminPending(k));
    setLoading(false);
  }
  useEffect(() => {
    AsyncStorage.getItem(ADMIN_KEY_STORAGE).then((k) => { if (k) { setKey(k); load(k); } else setLoading(false); });
  }, []);

  async function act(id: number, action: 'approve' | 'reject') {
    setItems((prev) => prev.filter((x) => x.id !== id));
    await adminModerate(key, id, action);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>{t('ch.adminTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.sand} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {items.length === 0 && <Text style={styles.empty}>{t('ch.adminEmpty')}</Text>}
          {items.map((q) => (
            <View key={q.id} style={styles.card}>
              <Text style={styles.quote}>"{q.text}"</Text>
              <Text style={styles.meta}>{q.author || '—'} · {q.lang.toUpperCase()}</Text>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => act(q.id, 'reject')}>
                  <Text style={styles.rejectTxt}>{t('ch.reject')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => act(q.id, 'approve')}>
                  <Text style={styles.approveTxt}>{t('ch.approve')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.stone },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, height: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stone2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  backIcon: { fontSize: 26, color: Colors.sand2, marginTop: -3 },
  title: { fontFamily: Fonts.cinzel, fontSize: 17, color: Colors.text },
  list: { padding: 20, gap: 12 },
  empty: { fontFamily: Fonts.jost, fontSize: 14, color: Colors.muted, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: Colors.stone2, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  quote: { fontFamily: Fonts.cormorantItalic, fontSize: 17, lineHeight: 25, color: Colors.sand3, marginBottom: 8 },
  meta: { fontFamily: Fonts.jost, fontSize: 11, color: Colors.muted, marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center', borderWidth: 1 },
  approve: { backgroundColor: 'rgba(76,175,110,0.15)', borderColor: 'rgba(76,175,110,0.4)' },
  approveTxt: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.success },
  reject: { backgroundColor: Colors.stone3, borderColor: 'rgba(255,255,255,0.08)' },
  rejectTxt: { fontFamily: Fonts.jostMedium, fontSize: 13, color: Colors.muted },
});
