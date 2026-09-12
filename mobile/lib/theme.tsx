import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const light = {
  bg: '#F2F6FB',
  card: '#FFFFFF',
  ink: '#12244A',
  sub: '#5C6E8C',
  line: '#E3EAF4',
  chip: '#EAF2FB',
  brand: '#1B3A6B',
  accent: '#2E9BD6',
  navy: '#1B3A6B',
  deep: '#0F2444',
  whatsapp: '#25D366',
  danger: '#E0483B',
  onNavy: '#FFFFFF',
  logoTint: undefined as string | undefined,
}

export const dark: typeof light = {
  ...light,
  bg: '#0B1524',
  card: '#14243B',
  ink: '#E9F1FA',
  sub: '#93A6C2',
  line: '#22344F',
  chip: '#1B2E4A',
  brand: '#9CD3F5',
  logoTint: '#FFFFFF',
}

export type Theme = typeof light

export const font = {
  serif: 'PlayfairDisplay_600SemiBold',
  serifRegular: 'PlayfairDisplay_500Medium',
  sans: 'Manrope_500Medium',
  sansSemi: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
  sansHeavy: 'Manrope_800ExtraBold',
}

type Ctx = { t: Theme; isDark: boolean; toggle: () => void }
const ThemeCtx = createContext<Ctx>({ t: light, isDark: false, toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('poyraz.theme').then((v) => {
      if (v === 'dark') setIsDark(true)
    })
  }, [])

  const toggle = () => {
    setIsDark((d) => {
      AsyncStorage.setItem('poyraz.theme', d ? 'light' : 'dark')
      return !d
    })
  }

  return (
    <ThemeCtx.Provider value={{ t: isDark ? dark : light, isDark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)
