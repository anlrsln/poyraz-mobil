import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, font } from '@/lib/theme'
import { useUnreadCount } from '@/lib/notifications'

const LOGO = require('@/assets/logo.png')

export function AppHeader({ back = false }: { back?: boolean }) {
  const { t, isDark, toggle } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const unread = useUnreadCount()

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 10,
        paddingHorizontal: 16,
        backgroundColor: t.card,
        borderBottomWidth: 1,
        borderBottomColor: t.line,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {back && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="arrow-back" size={20} color={t.ink} />
        </Pressable>
      )}

      <Image
        source={LOGO}
        style={{ width: 150, height: 56 }}
        contentFit="contain"
        tintColor={isDark ? '#FFFFFF' : undefined}
      />

      <View style={{ flex: 1 }} />

      <Pressable onPress={toggle} hitSlop={8} style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={21} color={t.sub} />
      </Pressable>

      <Pressable
        onPress={() => router.push('/bildirimler')}
        hitSlop={8}
        style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}
      >
        <MaterialIcons name="notifications-none" size={23} color={t.ink} />
        {unread > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              paddingHorizontal: 3,
              borderRadius: 8,
              backgroundColor: t.danger,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: font.sansHeavy, fontSize: 9, color: '#fff' }}>{unread}</Text>
          </View>
        )}
      </Pressable>
    </View>
  )
}
