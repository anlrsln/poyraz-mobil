import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, Switch, Linking } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { useTheme, font } from '@/lib/theme'
import { AppHeader } from '@/components/AppHeader'
import { hasPushPermission, registerForPush } from '@/lib/notifications'

const LOGO = require('@/assets/logo.png')

export default function DahaFazla() {
  const { t, isDark, toggle } = useTheme()
  const router = useRouter()
  const [pushOn, setPushOn] = useState(false)

  useEffect(() => {
    hasPushPermission().then(setPushOn)
  }, [])

  const rows: { icon: keyof typeof MaterialIcons.glyphMap; label: string; hint: string; onPress: () => void }[] = [
    { icon: 'apartment', label: 'Kurumsal', hint: '1972’den beri Kayseri’de üretim', onPress: () => router.push('/kurumsal') },
    { icon: 'storefront', label: 'Bayiler', hint: 'Bayi medya galerisi', onPress: () => router.push('/bayiler') },
    { icon: 'play-circle-outline', label: 'Video Galeri', hint: 'Poyraz Mobilya dünyasından', onPress: () => router.push('/video') },
    { icon: 'assignment', label: 'Bayilik Başvurusu', hint: 'Bayi ağımıza katılın', onPress: () => router.push('/bayilik') },
    { icon: 'policy', label: 'Gizlilik Sözleşmesi', hint: 'poyrazmobilya.com', onPress: () => Linking.openURL('https://www.poyrazmobilya.com/gizlilik-sozlesmesi') },
    { icon: 'shield', label: 'KVKK', hint: 'Kişisel verilerin korunması', onPress: () => Linking.openURL('https://www.poyrazmobilya.com/kvkk') },
  ]

  const onPushToggle = async (v: boolean) => {
    if (v) {
      const token = await registerForPush()
      setPushOn(!!token)
      if (!token) Linking.openSettings()
    } else {
      Linking.openSettings() // iOS/Android'de izin kapatma sistem ayarlarından yapılır
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={{ fontFamily: font.serif, fontSize: 26, color: t.ink, marginBottom: 16 }}>Daha Fazla</Text>

        <View style={{ backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 16, overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              onPress={r.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                padding: 15,
                borderBottomWidth: i === rows.length - 1 ? 0 : 1,
                borderBottomColor: t.line,
              }}
            >
              <MaterialIcons name={r.icon} size={21} color={t.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.sansBold, fontSize: 13.5, color: t.ink }}>{r.label}</Text>
                <Text style={{ marginTop: 3, fontFamily: font.sansSemi, fontSize: 11, color: t.sub }}>{r.hint}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={19} color={t.sub} />
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 14, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 16, padding: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={21} color={t.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.sansBold, fontSize: 13.5, color: t.ink }}>Karanlık Mod</Text>
              <Text style={{ marginTop: 3, fontFamily: font.sansSemi, fontSize: 11, color: t.sub }}>{isDark ? 'Açık' : 'Kapalı'}</Text>
            </View>
            <Switch value={isDark} onValueChange={toggle} trackColor={{ true: t.accent, false: '#D3DEEC' }} thumbColor="#fff" />
          </View>

          <View style={{ height: 1, backgroundColor: t.line, marginVertical: 14 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <MaterialIcons name="notifications-none" size={21} color={t.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.sansBold, fontSize: 13.5, color: t.ink }}>Bildirimler</Text>
              <Text style={{ marginTop: 3, fontFamily: font.sansSemi, fontSize: 11, color: t.sub }}>
                {pushOn ? 'Açık — yeni ürün ve duyurular' : 'Kapalı'}
              </Text>
            </View>
            <Switch value={pushOn} onValueChange={onPushToggle} trackColor={{ true: t.accent, false: '#D3DEEC' }} thumbColor="#fff" />
          </View>
        </View>

        <View style={{ marginTop: 22, alignItems: 'center', gap: 8 }}>
          <Image
            source={LOGO}
            style={{ width: 140, height: 52, opacity: 0.7 }}
            contentFit="contain"
            tintColor={isDark ? '#FFFFFF' : undefined}
          />
          <Text style={{ textAlign: 'center', fontFamily: font.sansSemi, fontSize: 10.5, lineHeight: 17, color: t.sub }}>
            Tasarım Bizim İşimiz, Toptan Sizin Gücünüz.{'\n'}© 2024 Poyraz Mobilya · Est. 1972 · v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
