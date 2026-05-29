import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
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
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" label="Ana" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="☀" label="Pratik" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◎" label="Koç" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wisdom"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◈" label="Bilgelik" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="◷" label="İlerleme" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.stone2,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 80 : 64,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.4,
    color: Colors.text2,
  },
  tabIconActive: {
    opacity: 1,
    color: Colors.sand,
  },
  tabLabel: {
    fontFamily: Fonts.jostMedium,
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.text2,
    opacity: 0.4,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    opacity: 1,
    color: Colors.sand,
  },
});
