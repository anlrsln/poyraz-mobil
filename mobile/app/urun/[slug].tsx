import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, Modal, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { productQuery, sized } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { Loader, ErrorState, ProductCard, ProductCardData, PrimaryButton } from '@/components/ui'
import { openWhatsApp, call, PHONE_FALLBACK } from '@/lib/links'

type Data = {
  _id: string
  name: string
  badge?: string
  pieces?: string
  pieceNames?: string[]
  description?: string
  images?: string[]
  collection?: { name?: string; slug?: string }
  related?: ProductCardData[]
  settings?: { whatsappNumber?: string; contactPhone?: string }
  contact?: { whatsappNumber?: string; phone?: string }
}

export default function UrunDetay() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { t } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()

  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoom, setZoom] = useState(1)

  const { data: p, loading, refresh } = useGroq<Data>(productQuery, { slug })

  const images = p?.images?.length ? p.images : []
  const current = images[Math.min(index, images.length - 1)]
  // Şema kuralı: önce iletisimSayfasi, yoksa siteAyarlari
  const phone = p?.contact?.phone || p?.settings?.contactPhone || PHONE_FALLBACK
  const whatsapp = p?.contact?.whatsappNumber || p?.settings?.whatsappNumber

  if (loading && !p) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <AppHeader back />
        <Loader />
      </View>
    )
  }

  if (!p) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <AppHeader back />
        <ErrorState onRetry={refresh} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader back />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <Pressable onPress={() => setLightbox(true)} style={{ height: 274, backgroundColor: t.chip }}>
          <Image source={{ uri: sized(current, 900, 88) }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
          {!!p.badge && (
            <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: t.accent, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 }}>
              <Text style={{ fontFamily: font.sansHeavy, fontSize: 9.5, letterSpacing: 0.8, color: '#fff' }}>{p.badge}</Text>
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              height: 32,
              paddingHorizontal: 11,
              borderRadius: 9,
              backgroundColor: 'rgba(9,22,46,0.7)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <MaterialIcons name="zoom-in" size={17} color="#fff" />
            <Text style={{ fontFamily: font.sansBold, fontSize: 11, color: '#fff' }}>Büyüt</Text>
          </View>
        </Pressable>

        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 12 }}>
            {images.map((src, i) => (
              <Pressable
                key={`${src}-${i}`}
                onPress={() => setIndex(i)}
                style={{
                  width: 76,
                  height: 57,
                  borderRadius: 9,
                  overflow: 'hidden',
                  backgroundColor: t.chip,
                  borderWidth: 2,
                  borderColor: i === index ? t.accent : 'transparent',
                }}
              >
                <Image source={{ uri: sized(src, 220, 65) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={{ padding: 16, paddingTop: 14 }}>
          {!!p.collection?.slug && (
            <Pressable
              onPress={() => router.push(`/koleksiyon/${p.collection!.slug}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <MaterialIcons name="home-work" size={15} color={t.sub} />
              <Text style={{ fontFamily: font.sansSemi, fontSize: 11, color: t.sub }}>{p.collection?.name}</Text>
            </Pressable>
          )}

          <Text style={{ marginTop: 10, fontFamily: font.serif, fontSize: 28, lineHeight: 33, color: t.brand }}>{p.name}</Text>

          {!!p.description && (
            <Text style={{ marginTop: 10, fontFamily: font.sansSemi, fontSize: 12.5, lineHeight: 20, color: t.sub }}>{p.description}</Text>
          )}

          {!!p.pieces && (
            <View style={{ marginTop: 16, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: t.chip, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
              <MaterialIcons name="category" size={18} color={t.accent} />
              <Text style={{ fontFamily: font.sansBold, fontSize: 12, color: t.ink }}>{p.pieces}</Text>
            </View>
          )}

          {!!p.pieceNames?.length && (
            <View style={{ marginTop: 12, gap: 7 }}>
              {p.pieceNames.map((n) => (
                <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialIcons name="check" size={16} color={t.accent} />
                  <Text style={{ fontFamily: font.sansSemi, fontSize: 12.5, color: t.ink }}>{n}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 1, backgroundColor: t.line, marginVertical: 20 }} />

          <View style={{ gap: 10 }}>
            <PrimaryButton
              label="WhatsApp ile Ulaşın"
              icon="chat"
              color={t.whatsapp}
              onPress={() => openWhatsApp(whatsapp, `Merhaba, ${p.name} ürünü hakkında bilgi almak istiyorum.`)}
            />
            <PrimaryButton label={`Ara: ${phone}`} icon="call" outline onPress={() => call(phone)} />
          </View>

          <Text style={{ marginTop: 14, textAlign: 'center', fontFamily: font.sansSemi, fontSize: 11, color: t.sub }}>veya</Text>

          <Pressable onPress={() => router.push('/bayilik')} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <MaterialIcons name="storefront" size={19} color={t.brand} />
            <Text style={{ fontFamily: font.sansBold, fontSize: 13, color: t.brand }}>Bayimiz Olmak İster misiniz?</Text>
          </Pressable>

          <Text style={{ marginTop: 12, textAlign: 'center', fontFamily: font.sans, fontSize: 11, lineHeight: 17, color: t.sub }}>
            Yalnızca kurumsal müşterilere yönelik toptan fiyatlandırma
          </Text>

          <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 13, padding: 13 }}>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 9.5, letterSpacing: 1.4, color: t.sub }}>PARÇA SAYISI</Text>
              <Text style={{ marginTop: 7, fontFamily: font.serif, fontSize: 15, color: t.ink }}>{p.pieces || 'Belirtilmedi'}</Text>
            </View>
            <Pressable
              onPress={() => p.collection?.slug && router.push(`/koleksiyon/${p.collection.slug}`)}
              style={{ flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 13, padding: 13 }}
            >
              <Text style={{ fontFamily: font.sansSemi, fontSize: 9.5, letterSpacing: 1.4, color: t.sub }}>KOLEKSİYON</Text>
              <Text numberOfLines={2} style={{ marginTop: 7, fontFamily: font.serif, fontSize: 15, color: t.accent }}>
                {p.collection?.name}
              </Text>
            </Pressable>
          </View>

          {!!p.related?.length && (
            <View style={{ marginTop: 26 }}>
              <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: t.accent }}>KOLEKSİYONDAN</Text>
              <Text style={{ marginTop: 9, fontFamily: font.serif, fontSize: 20, color: t.ink }}>Bu Koleksiyondan Diğer Ürünler</Text>
            </View>
          )}
        </View>

        {!!p.related?.length && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
            {p.related!.map((r) => (
              <ProductCard key={r._id} p={r} width={152} imageHeight={104} />
            ))}
          </ScrollView>
        )}
      </ScrollView>

      {/* Tam ekran galeri */}
      <Modal visible={lightbox} animationType="fade" onRequestClose={() => setLightbox(false)} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#06101F', paddingTop: insets.top + 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 10 }}>
            <Pressable
              onPress={() => { setLightbox(false); setZoom(1) }}
              style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialIcons name="close" size={21} color="#fff" />
            </Pressable>
            <Text style={{ flex: 1, fontFamily: font.sansBold, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {p.name} · {index + 1}/{images.length}
            </Text>
            <Pressable
              onPress={() => setZoom((z) => Math.max(1, z - 0.5))}
              style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialIcons name="zoom-out" size={20} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => setZoom((z) => Math.min(3, z + 0.5))}
              style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialIcons name="zoom-in" size={20} color="#fff" />
            </Pressable>
          </View>

          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Pressable onPress={() => setZoom((z) => (z > 1 ? 1 : 2))}>
              <Image
                source={{ uri: sized(current, 1400, 90) }}
                style={{ width: width * zoom, height: width * zoom }}
                contentFit="contain"
              />
            </Pressable>
          </ScrollView>

          <Text style={{ textAlign: 'center', paddingHorizontal: 14, paddingBottom: 10, fontFamily: font.sansSemi, fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>
            Yakınlaştırmak için görsele dokunun veya iki parmakla açın
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingBottom: insets.bottom + 20 }}
          >
            {images.map((src, i) => (
              <Pressable
                key={`lb-${i}`}
                onPress={() => { setIndex(i); setZoom(1) }}
                style={{ width: 62, height: 47, borderRadius: 9, overflow: 'hidden', borderWidth: 2, borderColor: i === index ? '#2E9BD6' : 'transparent' }}
              >
                <Image source={{ uri: sized(src, 220, 65) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
