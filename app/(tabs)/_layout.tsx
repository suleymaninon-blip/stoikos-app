import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useAppDimensions } from '../../constants/layout';
import { Fonts } from '../../constants/theme';
import { useTheme, useStyles, type Palette } from '../../constants/themeContext';
import { useLang, upper } from '../../constants/i18n';
import { SunIcon } from '../../components/Icons';
import { useReduceMotion } from '../../hooks/useReduceMotion';

// Alt menü (19 Kasım 2026 yenilemesi; kullanıcının başka bir araçta yazdırdığı öneri, burada düzeltildi):
// seçili sekmede simgenin arkasında yumuşak bir hale belirir, simge hafifçe yükselip büyür, altında nokta.
// "Hareketi Azalt"ta yay hareketi yok, yalnız anında geçiş.
function TabIcon({ label, icon, focused, width }: { label: string; icon: string; focused: boolean; width: number }) {
  const styles = useStyles(makeStyles);
  const { C: Colors } = useTheme();
  const reduce = useReduceMotion();
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) { anim.setValue(focused ? 1 : 0); return; }
    Animated.spring(anim, { toValue: focused ? 1 : 0, useNativeDriver: true, speed: 20, bounciness: 5 }).start();
  }, [focused, anim, reduce]);

  const iconTranslateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });
  const iconScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const pillScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });

  return (
    <View style={[styles.tabItem, { width }]}>
      <View style={styles.iconWrap}>
        {/* Seçili sekmenin arkasında yumuşakça beliren hale */}
        <Animated.View style={[styles.activePill, { opacity: anim, transform: [{ scale: pillScale }] }]} />
        <Animated.View style={{ transform: [{ translateY: iconTranslateY }, { scale: iconScale }] }}>
          {/* ☀ iOS'ta renkli emoji olarak çiziliyordu (sarı güneş, diğer simgelerle uyumsuz) → çizim simge. */}
          {icon === '☀'
            ? <View style={styles.tabSvg}><SunIcon size={22} color={focused ? Colors.sand2 : Colors.muted} /></View>
            : <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>}
        </Animated.View>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>{label}</Text>
      <Animated.View style={[styles.tabDot, { opacity: anim, transform: [{ scale: anim }] }]} />
    </View>
  );
}

export default function TabLayout() {
  const styles = useStyles(makeStyles);
  const { t, lang } = useLang();
  const { width: screenW } = useAppDimensions();
  const itemW = Math.floor(screenW / 5); // her sekme = ekranın 1/5'i → etiket tek satıra sığar
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" label={upper(t('tabs.home'), lang)} focused={focused} width={itemW} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="☀" label={upper(t('tabs.practice'), lang)} focused={focused} width={itemW} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◎" label={upper(t('tabs.coach'), lang)} focused={focused} width={itemW} />,
        }}
      />
      <Tabs.Screen
        name="wisdom"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◈" label={upper(t('tabs.wisdom'), lang)} focused={focused} width={itemW} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◷" label={upper(t('tabs.progress'), lang)} focused={focused} width={itemW} />,
        }}
      />
    </Tabs>
  );
}

const makeStyles = (Colors: Palette) => StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.stone,
    // react-navigation kendi `borderColor`'ını (açık gri) veriyor; web'de borderTopColor onu ezmiyordu
    // ve her ekranın altında beyaz bir çizgi görünüyordu. İkisi birden aynı renk.
    borderColor: Colors.tint(0.10),
    borderTopColor: Colors.tint(0.10),
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 90 : 72,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    // Açık temalarda menünün üstünde çok hafif gölge (yalnız iOS/Android)
    ...(!Colors.isDark
      ? Platform.select({
          ios: { shadowColor: '#1D2A2F', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 10 },
          android: { elevation: 6 },
          default: {},
        })
      : {}),
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconWrap: { width: 48, height: 30, alignItems: 'center', justifyContent: 'center' },
  activePill: {
    position: 'absolute', width: 46, height: 30, borderRadius: 15,
    backgroundColor: Colors.tint(Colors.isDark ? 0.14 : 0.11),
  },
  tabIcon: { fontSize: 21, color: Colors.muted },
  tabSvg: { height: 26, justifyContent: 'center' },
  tabIconActive: { color: Colors.sand2 },
  tabDot: { width: 4, height: 4, borderRadius: 2, marginTop: 1, backgroundColor: Colors.sand },
  // En küçük yazı 11 px (UX denetimi kuralı); öneri 10,5 idi. Harf aralığı 0,5: Almanca "FORTSCHRITT" ancak sığıyor.
  tabLabel: { fontFamily: Fonts.jostMedium, fontSize: 11, letterSpacing: 0.5, color: Colors.muted, textAlign: 'center' },
  tabLabelActive: { color: Colors.sand2 },
});
