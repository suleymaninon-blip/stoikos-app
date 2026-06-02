import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { useLang } from '../../constants/i18n';

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      <View style={[styles.tabDot, focused && styles.tabDotActive]} />
    </View>
  );
}

export default function TabLayout() {
  const { t } = useLang();
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
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" label={t('tabs.home')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="☀" label={t('tabs.practice')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◎" label={t('tabs.coach')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wisdom"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◈" label={t('tabs.wisdom')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◷" label={t('tabs.progress')} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.stone,
    borderTopColor: 'rgba(194,168,120,0.10)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 66,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabIcon: {
    fontSize: 19,
    color: Colors.muted,
  },
  tabIconActive: {
    color: Colors.sand2,
  },
  tabDot: {
    width: 4, height: 4, borderRadius: 2, marginTop: 2,
    backgroundColor: 'transparent',
  },
  tabDotActive: {
    backgroundColor: Colors.sand,
  },
  tabLabel: {
    fontFamily: Fonts.jostMedium,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: Colors.sand2,
  },
});
