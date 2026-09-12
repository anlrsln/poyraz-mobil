import React from 'react'
import { View, Text, ScrollView, Pressable, Linking } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { contactQuery } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { PrimaryButton } from '@/components/ui'
import { openWhatsApp, call, mail, maps, PHONE_FALLBACK } from '@/lib/links'

type ContactData = {
  contact?: { address?: string; phone?: string; email?: string; whatsappNumber?: string }
  settings?: { whatsappNumber?: string; contactPhone?: string; contactEmail?: string }
}

const SOCIALS: { icon: keyof typeof MaterialIcons.glyphMap; label: string; url: string }[] = [
  { icon: 'photo-camera', label: 'INSTAGRAM', url: 'https://www.instagram.com/poyrazzmobilyaa/' },
  { icon: 'thumb-up', label: 'FACEBOOK', url: 'https://www.facebook.com/p/Poyraz-Mobilya-100057153202779/?locale=tr_TR' },
  { icon: 'play-circle-outline', label: 'YOUTUBE', url: 'https://youtube.com/poyrazmobilya' },
]

export default function Iletisim() {
  const { t } = useTheme()
  const router = useRouter()
  const { data } = useGroq<ContactData>(contactQuery)
  const c = data?.contact
  const st = data?.settings

  // Şema kuralı: önce iletisimSayfasi, yoksa siteAyarlari
  const address = c?.address || 'Kayseri Organize Sanayi Bölgesi, Kayseri'
  const phone = c?.phone || st?.contactPhone || PHONE_FALLBACK
  const email = c?.email || st?.contactEmail || 'poyrazzmobilyaa@gmail.com'

  const rows: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string; onPress: () => void }[] = [
    { icon: 'location-on', label: 'ADRES', value: address, onPress: () => maps(address) },
    { icon: 'call', label: 'TELEFON', value: phone, onPress: () => call(phone) },
    { icon: 'mail-outline', label: 'E-POSTA', value: email, onPress: () => mail(email) },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={{ fontFamily: font.serif, fontSize: 26, color: t.ink }}>İletişim</Text>
        <Text style={{ marginTop: 9, fontFamily: font.sans, fontSize: 13, lineHeight: 21, color: t.sub }}>
          Toptan satış, bayilik ve proje talepleri için bize ulaşın.
        </Text>

        <View style={{ marginTop: 18, gap: 10 }}>
          <PrimaryButton label="WhatsApp ile Yazın" icon="chat" color={t.whatsapp} onPress={() => openWhatsApp(c?.whatsappNumber || st?.whatsappNumber)} />
          <PrimaryButton label="Hemen Ara" icon="call" onPress={() => call(phone)} />
        </View>

        <View style={{ marginTop: 16, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 16, overflow: 'hidden' }}>
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
                <Text style={{ fontFamily: font.sansBold, fontSize: 9.5, letterSpacing: 1.2, color: t.sub }}>{r.label}</Text>
                <Text style={{ marginTop: 6, fontFamily: font.sansSemi, fontSize: 13, lineHeight: 18, color: t.ink }}>{r.value}</Text>
              </View>
              <MaterialIcons name="north-east" size={19} color={t.sub} />
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16, flexDirection: 'row', gap: 10 }}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.label}
              onPress={() => Linking.openURL(s.url)}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 13,
                backgroundColor: t.card,
                borderWidth: 1,
                borderColor: t.line,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <MaterialIcons name={s.icon} size={19} color={t.brand} />
              <Text style={{ fontFamily: font.sansBold, fontSize: 9.5, color: t.sub }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ marginTop: 16, backgroundColor: t.navy, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontFamily: font.sansBold, fontSize: 9.5, letterSpacing: 1.6, color: '#8FCDF2' }}>BAYİLİK</Text>
          <Text style={{ marginTop: 8, fontFamily: font.serif, fontSize: 18, color: '#fff' }}>Bayi Ağımıza Katılın</Text>
          <Pressable
            onPress={() => router.push('/bayilik')}
            style={{ marginTop: 14, height: 46, borderRadius: 12, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: font.sansHeavy, fontSize: 12.5, letterSpacing: 1, color: '#fff' }}>BAŞVURU FORMU</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
