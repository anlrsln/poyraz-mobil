import React from 'react'
import { View, Text, ScrollView, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { bayilerQuery, sized } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { Loader } from '@/components/ui'

type Data = {
  mediaGallery?: { type?: string; imageUrl?: string; thumbnail?: string; videoUrl?: string; title?: string }[]
}

export default function Bayiler() {
  const { t } = useTheme()
  const { width } = useWindowDimensions()
  const { data, loading } = useGroq<Data>(bayilerQuery)

  const items = (data?.mediaGallery ?? []).filter((m) => m.imageUrl || m.thumbnail)
  const cardW = (width - 32 - 10) / 2

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader back />
      {loading && !data ? (
        <Loader />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
          <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: t.accent }}>MEDYA GALERİSİ</Text>
          <Text style={{ marginTop: 9, fontFamily: font.serif, fontSize: 26, color: t.ink }}>Bayiler</Text>

          {items.length === 0 ? (
            <View style={{ marginTop: 22, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 16, paddingVertical: 46, alignItems: 'center', gap: 12 }}>
              <MaterialIcons name="photo-library" size={40} color={t.sub} />
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: t.sub }}>Henüz medya eklenmedi.</Text>
            </View>
          ) : (
            <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {items.map((m, i) => (
                <View
                  key={`${m.imageUrl || m.thumbnail}-${i}`}
                  style={{ width: cardW, borderRadius: 13, overflow: 'hidden', borderWidth: 1, borderColor: t.line, backgroundColor: t.chip }}
                >
                  <Image source={{ uri: sized(m.imageUrl || m.thumbnail, 460) }} style={{ width: '100%', height: 118 }} contentFit="cover" />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
