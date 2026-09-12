import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { collectionQuery, sized } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { Loader, ErrorState, ProductCard, ProductCardData } from '@/components/ui'

type Coll = {
  _id: string
  name: string
  description?: string
  heroImage?: string
  cardImage?: string
  products: ProductCardData[]
}

export default function KoleksiyonDetay() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { t } = useTheme()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [q, setQ] = useState('')

  const { data, loading, error, refresh } = useGroq<Coll>(collectionQuery, { slug })

  const cardW = useMemo(() => (width - 32 - 12) / 2, [width])
  const term = q.trim().toLocaleLowerCase('tr')
  const products = useMemo(
    () => (data?.products ?? []).filter((p) => (term ? p.name.toLocaleLowerCase('tr').includes(term) : true)),
    [data, term]
  )

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader back />

      {loading && !data ? (
        <Loader />
      ) : error || !data ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={{ height: 158, backgroundColor: t.navy }}>
            <Image
              source={{ uri: sized(data.heroImage || data.cardImage, 900) }}
              style={{ width: '100%', height: '100%', opacity: 0.8 }}
              contentFit="cover"
            />
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(9,22,46,0.5)' }} />
            <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
              <Text style={{ fontFamily: font.sansBold, fontSize: 9.5, letterSpacing: 1.8, color: '#8FCDF2' }}>KOLEKSİYON</Text>
              <Text style={{ marginTop: 8, fontFamily: font.serif, fontSize: 25, color: '#fff' }}>{data.name}</Text>
            </View>
          </View>

          <View style={{ padding: 16 }}>
            {!!data.description && (
              <Text style={{ fontFamily: font.sans, fontSize: 13, lineHeight: 22, color: t.sub }}>{data.description}</Text>
            )}

            <View
              style={{
                marginTop: 15,
                height: 46,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 9,
                backgroundColor: t.card,
                borderWidth: 1,
                borderColor: t.line,
                borderRadius: 13,
                paddingHorizontal: 13,
              }}
            >
              <MaterialIcons name="search" size={20} color={t.sub} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder={`${data.name} içinde ara`}
                placeholderTextColor={t.sub}
                style={{ flex: 1, fontFamily: font.sansSemi, fontSize: 13.5, color: t.ink }}
              />
              {!!q && (
                <Pressable onPress={() => setQ('')} hitSlop={8}>
                  <MaterialIcons name="close" size={19} color={t.sub} />
                </Pressable>
              )}
            </View>

            <View style={{ marginTop: 16, marginBottom: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 1.8, color: t.sub }}>
                {products.length} ÜRÜN
              </Text>
              <Text style={{ fontFamily: font.sansSemi, fontSize: 10.5, color: t.sub }}>
                Fiyatlar yalnızca kurumsal müşterilere
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {products.map((p) => (
                <ProductCard key={p._id} p={p} width={cardW} />
              ))}
            </View>

            <View
              style={{
                marginTop: 22,
                backgroundColor: t.card,
                borderWidth: 1,
                borderColor: t.line,
                borderStyle: 'dashed',
                borderRadius: 16,
                padding: 20,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontFamily: font.sansBold, fontSize: 9.5, letterSpacing: 1.8, color: t.accent }}>TOPTAN SATIŞ</Text>
              <Text style={{ marginTop: 9, fontFamily: font.serif, fontSize: 19, color: t.ink, textAlign: 'center' }}>
                Aradığınızı Bulamadınız mı?
              </Text>
              <Text style={{ marginTop: 9, textAlign: 'center', fontFamily: font.sans, fontSize: 12.5, lineHeight: 20, color: t.sub }}>
                Bayi temsilcinizle iletişime geçin, size özel fiyat ve çözümler sunalım.
              </Text>
              <Pressable
                onPress={() => router.push('/iletisim')}
                style={{ marginTop: 14, height: 42, paddingHorizontal: 22, borderRadius: 11, borderWidth: 1, borderColor: t.brand, justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: font.sansBold, fontSize: 12.5, color: t.brand }}>Bize Ulaşın</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
