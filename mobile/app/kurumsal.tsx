import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { homeQuery, sized } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'

const STATS = [
  { value: '50+', label: 'DENEYİM' },
  { value: '4.000m²', label: 'DEPO' },
  { value: '500+', label: 'ÜRÜN' },
]

const ADVANTAGES = [
  'Fabrikadan Direkt Fiyat',
  'Hızlı Lojistik Ağı',
  'Geniş Ürün Yelpazesi',
  'Kurumsal Proje Desteği',
]

export default function Kurumsal() {
  const { t } = useTheme()
  const { data } = useGroq<{ home?: { heroImage?: string } }>(homeQuery)

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader back />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <Image source={{ uri: sized(data?.home?.heroImage, 900) }} style={{ width: '100%', height: 186 }} contentFit="cover" />

        <View style={{ padding: 16 }}>
          <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: t.accent }}>HAKKIMIZDA</Text>
          <Text style={{ marginTop: 9, fontFamily: font.serif, fontSize: 26, color: t.ink }}>Poyraz Mobilya</Text>

          <Text style={{ marginTop: 13, fontFamily: font.sans, fontSize: 13.5, lineHeight: 24, color: t.sub }}>
            1972 yılından bu yana toptan mobilya sektöründe edindiğimiz köklü tecrübe ile Türkiye'nin dört bir
            yanındaki bayilerimize hizmet veriyoruz. Kalite, estetik ve fonksiyonelliği bir araya getiren
            tasarımlarımızla sektörde öncü konumdayız.
          </Text>
          <Text style={{ marginTop: 12, fontFamily: font.sans, fontSize: 13.5, lineHeight: 24, color: t.sub }}>
            Kayseri Organize Sanayi Bölgesi'nde yer alan 4.000 m² modern üretim tesisimiz, güçlü stok kapasitemiz ve
            1.000 m² showroomumuz ile iş ortaklarımızın rekabet gücünü artırmaya devam ediyoruz.
          </Text>

          <View style={{ marginTop: 20, flexDirection: 'row', gap: 1, backgroundColor: t.line, borderRadius: 14, overflow: 'hidden' }}>
            {STATS.map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: t.card, paddingVertical: 15, alignItems: 'center' }}>
                <Text style={{ fontFamily: font.serif, fontSize: 20, color: t.brand }}>{s.value}</Text>
                <Text style={{ marginTop: 6, fontFamily: font.sansSemi, fontSize: 9, letterSpacing: 1.2, color: t.sub }}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20, gap: 10 }}>
            {ADVANTAGES.map((a) => (
              <View
                key={a}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 12, padding: 13 }}
              >
                <MaterialIcons name="check-circle" size={19} color={t.accent} />
                <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: t.ink }}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
