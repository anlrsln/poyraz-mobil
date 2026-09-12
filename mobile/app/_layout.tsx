import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'
import { PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemeProvider, useTheme } from '@/lib/theme'
import { useNotificationRouting, hasPushPermission } from '@/lib/notifications'
import Splash from '@/components/Splash'
import PermissionGate from '@/components/PermissionGate'

SplashScreen.preventAutoHideAsync()

const PERM_KEY = 'poyraz.permAsked'

function Root() {
  const { t, isDark } = useTheme()
  const [phase, setPhase] = useState<'splash' | 'perm' | 'app'>('splash')
  useNotificationRouting()

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  // Splash 2,3 sn; sonra izin ekranı (yalnızca ilk açılışta)
  useEffect(() => {
    if (!fontsLoaded) return
    const timer = setTimeout(async () => {
      const asked = await AsyncStorage.getItem(PERM_KEY)
      const granted = await hasPushPermission()
      setPhase(asked || granted ? 'app' : 'perm')
    }, 2300)
    return () => clearTimeout(timer)
  }, [fontsLoaded])

  if (!fontsLoaded) return null
  if (phase === 'splash') return <Splash />
  if (phase === 'perm')
    return (
      <PermissionGate
        onDone={async () => {
          await AsyncStorage.setItem(PERM_KEY, '1')
          setPhase('app')
        }}
      />
    )

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="urun/[slug]" />
        <Stack.Screen name="koleksiyon/[slug]" />
        <Stack.Screen name="bildirimler" />
        <Stack.Screen name="bayilik" />
        <Stack.Screen name="kurumsal" />
        <Stack.Screen name="bayiler" />
        <Stack.Screen name="video" />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
