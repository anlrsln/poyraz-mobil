import React from 'react'
import { View, Text, ScrollView, Pressable, useWindowDimensions, RefreshControl } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { homeQuery, sized } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { SectionTitle, Loader, ErrorState, ProductCard, ProductCardData } from '@/components/ui'
import { call, PHONE_FALLBACK } from '@/lib/links'

type HomeData = {
  collections: { _id: string; name: string; slug: string; description?: string; cardImage?: string; heroImage?: string }[]
  home?: {
    heroImage?: string
    testimonials?: { quote: string; authorName: string; authorLocation: string }[]
    videoGallery?: { title: string; tag?: string; thumbnail?: string; videoType?: string; videoUrl?: string }[]
    featuredProducts?: ProductCardData[]
  }
  settings?: { whatsappNumber?: string; contactPhone?: string; contactEmail?: string }
}

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

export default function Home() {
  const { t } = useTheme()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { data, loading, refreshing, error, refresh } = useGroq<HomeData>(homeQuery)

  const featured = data?.home?.featuredProducts ?? []
  const collections = data?.collections ?? []
  const testimonial = data?.home?.testimonials?.[0]
  const video = data?.home?.videoGallery?.[0]
  const phone = data?.settings?.contactPhone || PHONE_FALLBACK
  const collW = (width - 32 - 12) / 2

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader />

      {loading && !data ? (
        <Loader />
      ) : error && !data ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.accent} />}
        >
          {/* Öne çıkanlar karuseli */}
          <View style={{ paddingHorizontal: 16, paddingTop: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <SectionTitle kicker="KOLEKSİYONDAN" title="Öne Çıkan Ürünler" />
            <Text style={{ fontFamily: font.sansSemi, fontSize: 11, color: t.sub, paddingBottom: 3 }}>
              {featured.length} ürün
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={274}
            decelerationRate="fast"
            contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 }}
          >
            {featured.map((p) => (
              <ProductCard key={p._id} p={p} width={262} imageHeight={176} showCollection />
            ))}
          </ScrollView>

          {/* İstatistikler */}
          <View style={{ marginHorizontal: 16, flexDirection: 'row', backgroundColor: t.line, borderRadius: 16, overflow: 'hidden', gap: 1 }}>
            {STATS.map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: t.card, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ fontFamily: font.serif, fontSize: 21, color: t.brand }}>{s.value}</Text>
                <Text style={{ marginTop: 6, fontFamily: font.sansSemi, fontSize: 9.5, letterSpacing: 1.4, color: t.sub }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Koleksiyonlar ızgarası */}
          <View style={{ paddingHorizontal: 16, paddingTop: 26 }}>
            <SectionTitle title="Koleksiyonlar" />
            <View style={{ width: 38, height: 2, backgroundColor: t.accent, marginTop: 9 }} />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, paddingBottom: 4 }}>
            {collections.map((c) => (
              <Pressable
                key={c._id}
                onPress={() => router.push(`/koleksiyon/${c.slug}`)}
                style={{ width: collW, height: 118, borderRadius: 14, overflow: 'hidden', backgroundColor: t.navy }}
              >
                <Image
                  source={{ uri: sized(c.cardImage || c.heroImage, 420) }}
                  style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.72 }}
                  contentFit="cover"
                />
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(9,22,46,0.45)' }} />
                <Text
                  numberOfLines={2}
                  style={{ position: 'absolute', left: 12, right: 12, bottom: 11, fontFamily: font.serif, fontSize: 14, color: '#fff' }}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Kurumsal kart */}
          <View style={{ margin: 16, marginTop: 26, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 18, overflow: 'hidden' }}>
            <View style={{ height: 164 }}>
              <Image source={{ uri: sized(data?.home?.heroImage, 800) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <View style={{ position: 'absolute', left: 0, bottom: 0, backgroundColor: t.navy, paddingHorizontal: 13, paddingVertical: 9 }}>
                <Text style={{ fontFamily: font.sansBold, fontSize: 11, color: '#fff' }}>Kuruluş 1972</Text>
                <Text style={{ fontFamily: font.sansSemi, fontSize: 9, letterSpacing: 1.2, color: 'rgba(255,255,255,0.75)' }}>
                  KAYSERİ, TÜRKİYE
                </Text>
              </View>
            </View>
            <View style={{ padding: 16, paddingBottom: 20 }}>
              <SectionTitle kicker="HAKKIMIZDA" title="Poyraz Mobilya" />
              <Text style={{ marginTop: 11, fontFamily: font.sans, fontSize: 13.5, lineHeight: 23, color: t.sub }}>
                1972 yılından bu yana toptan mobilya sektöründe edindiğimiz köklü tecrübe ile Türkiye'nin dört bir
                yanındaki bayilerimize hizmet veriyoruz.
              </Text>
              <View style={{ marginTop: 15, gap: 9 }}>
                {ADVANTAGES.map((a) => (
                  <View key={a} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                    <MaterialIcons name="check-circle" size={18} color={t.accent} />
                    <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: t.ink }}>{a}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={() => router.push('/kurumsal')} style={{ marginTop: 17, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: font.sansBold, fontSize: 12.5, color: t.accent }}>Daha Fazla Bilgi</Text>
                <MaterialIcons name="arrow-forward" size={16} color={t.accent} />
              </Pressable>
            </View>
          </View>

          {/* Yorum */}
          {!!testimonial && (
            <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
              <SectionTitle kicker="MÜŞTERİ GÖRÜŞLERİ" title="Bayilerimiz Ne Diyor?" />
              <View
                style={{
                  marginTop: 14,
                  backgroundColor: t.card,
                  borderWidth: 1,
                  borderColor: t.line,
                  borderTopWidth: 3,
                  borderTopColor: t.accent,
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <Text style={{ color: '#E8B33C', fontSize: 14, letterSpacing: 2 }}>★★★★★</Text>
                <Text style={{ marginTop: 11, fontFamily: font.serifRegular, fontSize: 14.5, lineHeight: 23, color: t.ink }}>
                  “{testimonial.quote}”
                </Text>
                <View style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: font.sansBold, fontSize: 12, color: t.brand }}>
                      {testimonial.authorName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: font.sansBold, fontSize: 12.5, color: t.ink }}>{testimonial.authorName}</Text>
                    <Text style={{ fontFamily: font.sansSemi, fontSize: 11, color: t.sub }}>{testimonial.authorLocation}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Video */}
          {!!video && (
            <View style={{ marginTop: 28, padding: 16, paddingBottom: 26, backgroundColor: t.deep }}>
              <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: '#6FC0EE' }}>VİDEO GALERİ</Text>
              <Text style={{ marginTop: 9, marginBottom: 15, fontFamily: font.serif, fontSize: 22, color: '#fff' }}>
                Poyraz Mobilya Dünyasından
              </Text>
              <Pressable onPress={() => router.push('/video')} style={{ height: 186, borderRadius: 14, overflow: 'hidden', backgroundColor: '#173257' }}>
                <Image source={{ uri: sized(video.thumbnail, 800) }} style={{ width: '100%', height: '100%', opacity: 0.85 }} contentFit="cover" />
                <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="play-arrow" size={30} color={t.navy} />
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          {/* Bayilik CTA */}
          <View style={{ padding: 16, paddingBottom: 34, backgroundColor: t.navy }}>
            <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: '#8FCDF2' }}>İŞ BİRLİĞİ</Text>
            <Text style={{ marginTop: 9, fontFamily: font.serif, fontSize: 24, color: '#fff' }}>Bayi Ağımıza Katılın</Text>
            <Text style={{ marginTop: 10, fontFamily: font.sans, fontSize: 13.5, lineHeight: 22, color: 'rgba(255,255,255,0.78)' }}>
              Türkiye'nin dört bir yanındaki bayilerimizle büyümeye devam ediyoruz.
            </Text>
            <Pressable
              onPress={() => router.push('/bayilik')}
              style={{ marginTop: 17, height: 50, borderRadius: 13, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontFamily: font.sansHeavy, fontSize: 13, letterSpacing: 1.2, color: '#fff' }}>BAYİLİK BAŞVURUSU</Text>
            </Pressable>
            <Pressable onPress={() => call(phone)} style={{ marginTop: 12 }}>
              <Text style={{ textAlign: 'center', fontFamily: font.sansSemi, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
                veya {phone}'yi arayın
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
