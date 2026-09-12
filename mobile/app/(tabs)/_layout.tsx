import React from 'react'
import { Tabs } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme, font } from '@/lib/theme'

export default function TabsLayout() {
  const { t } = useTheme()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.sub,
        tabBarStyle: {
          backgroundColor: t.card,
          borderTopColor: t.line,
          height: 84,
          paddingTop: 9,
          paddingBottom: 28,
        },
        tabBarLabelStyle: { fontFamily: font.sansBold, fontSize: 9.5 },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Ana Sayfa', tabBarIcon: ({ color }) => <MaterialIcons name="home" size={23} color={color} /> }}
      />
      <Tabs.Screen
        name="koleksiyonlar"
        options={{ title: 'Koleksiyonlar', tabBarIcon: ({ color }) => <MaterialIcons name="grid-view" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="iletisim"
        options={{ title: 'İletişim', tabBarIcon: ({ color }) => <MaterialIcons name="call" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="daha-fazla"
        options={{ title: 'Daha Fazla', tabBarIcon: ({ color }) => <MaterialIcons name="more-horiz" size={24} color={color} /> }}
      />
    </Tabs>
  )
}
