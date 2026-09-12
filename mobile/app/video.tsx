import React from 'react'
import { View, Text, ScrollView, Pressable, Linking } from 'react-native'
import { Image } from 'expo-image'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { videoQuery, sized } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { Loader } from '@/components/ui'

type Data = {
  videoGallery?: { title: string; description?: string; tag?: string; thumbnail?: string; videoType?: string; videoUrl?: string }[]
}

export default function VideoGaleri() {
  const { t } = useTheme()
  const { data, loading } = useGroq<Data>(videoQuery)
  const videos = data?.videoGallery ?? []

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader back />
      {loading && !data ? (
        <Loader />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
          <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: t.accent }}>VİDEO GALERİ</Text>
          <Text style={{ marginTop: 9, fontFamily: font.serif, fontSize: 26, color: t.ink }}>Poyraz Mobilya Dünyasından</Text>

          <View style={{ marginTop: 16, gap: 14 }}>
            {videos.map((v, i) => (
              <Pressable
                key={`${v.videoUrl}-${i}`}
                onPress={() => v.videoUrl && Linking.openURL(v.videoUrl)}
                style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: t.line, backgroundColor: t.card }}
              >
                <View style={{ height: 220, backgroundColor: '#173257' }}>
                  <Image source={{ uri: sized(v.thumbnail, 900) }} style={{ width: '100%', height: '100%', opacity: 0.9 }} contentFit="cover" />
                  <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialIcons name="play-arrow" size={32} color={t.navy} />
                    </View>
                  </View>
                </View>
                <View style={{ padding: 15 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialIcons name={v.videoType === 'instagram' ? 'photo-camera' : 'play-circle-outline'} size={15} color={t.sub} />
                    <Text style={{ fontFamily: font.sansSemi, fontSize: 10.5, color: t.sub }}>
                      {v.tag || (v.videoType === 'instagram' ? 'Instagram' : 'YouTube')}
                    </Text>
                  </View>
                  <Text style={{ marginTop: 8, fontFamily: font.serif, fontSize: 16, color: t.ink }}>{v.title}</Text>
                  {!!v.description && (
                    <Text style={{ marginTop: 6, fontFamily: font.sans, fontSize: 12, lineHeight: 19, color: t.sub }}>{v.description}</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {videos.length === 0 && (
            <View style={{ marginTop: 40, alignItems: 'center', gap: 12 }}>
              <MaterialIcons name="videocam-off" size={40} color={t.sub} />
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: t.sub }}>Henüz video eklenmedi.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
