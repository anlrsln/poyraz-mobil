import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { collectionsQuery, searchQuery, sized } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { Loader, ErrorState, ProductCard, ProductCardData } from '@/components/ui'

type Coll = { _id: string; name: string; slug: string; description?: string; cardImage?: string; heroImage?: string }

export default function Koleksiyonlar() {
  const { t } = useTheme()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [q, setQ] = useState('')

  const { data: colls, loading, error, refresh } = useGroq<Coll[]>(collectionsQuery)
  const term = q.trim()
  const { data: results } = useGroq<ProductCardData[]>(searchQuery, { term: term ? `${term}*` : '\u0000' })

  const cardW = useMemo(() => (width - 32 - 12) / 2, [width])
  const searching = term.length > 0

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader />

      {loading && !colls ? (
        <Loader />
      ) : error && !colls ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontFamily: font.serif, fontSize: 26, color: t.ink }}>Koleksiyonlar</Text>
          <Text style={{ marginTop: 8, fontFamily: font.sans, fontSize: 13, lineHeight: 21, color: t.sub }}>
            Toptan fiyatlar için bayi temsilcinizle görüşün.
          </Text>

          <View
            style={{
              marginTop: 16,
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
              placeholder="Ürün veya koleksiyon ara"
              placeholderTextColor={t.sub}
              style={{ flex: 1, fontFamily: font.sansSemi, fontSize: 13.5, color: t.ink }}
              returnKeyType="search"
            />
            {searching && (
              <Pressable onPress={() => setQ('')} hitSlop={8}>
                <MaterialIcons name="close" size={19} color={t.sub} />
              </Pressable>
            )}
          </View>

          {searching ? (
            <>
              <Text style={{ marginTop: 18, marginBottom: 10, fontFamily: font.sansBold, fontSize: 10, letterSpacing: 1.8, color: t.sub }}>
                {(results?.length ?? 0)} SONUÇ · “{term}”
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {(results ?? []).map((p) => (
                  <ProductCard key={p._id} p={p} width={cardW} showCollection />
                ))}
              </View>
              {results?.length === 0 && (
                <Text style={{ marginTop: 24, textAlign: 'center', fontFamily: font.sansSemi, fontSize: 13, color: t.sub }}>
                  Sonuç bulunamadı.
                </Text>
              )}
            </>
          ) : (
            <View style={{ marginTop: 18, gap: 12 }}>
              {(colls ?? []).map((c) => (
                <Pressable
                  key={c._id}
                  onPress={() => router.push(`/koleksiyon/${c.slug}`)}
                  style={{ height: 132, borderRadius: 16, overflow: 'hidden', backgroundColor: t.navy }}
                >
                  <Image
                    source={{ uri: sized(c.heroImage || c.cardImage, 800) }}
                    style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.75 }}
                    contentFit="cover"
                  />
                  <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(9,22,46,0.55)' }} />
                  <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: font.serif, fontSize: 19, color: '#fff' }}>{c.name}</Text>
                    {!!c.description && (
                      <Text numberOfLines={2} style={{ marginTop: 6, width: '72%', fontFamily: font.sansSemi, fontSize: 11.5, lineHeight: 17, color: 'rgba(255,255,255,0.78)' }}>
                        {c.description}
                      </Text>
                    )}
                    <View style={{ marginTop: 11, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={{ fontFamily: font.sansBold, fontSize: 11, color: '#8FCDF2' }}>Koleksiyonu Gör</Text>
                      <MaterialIcons name="arrow-forward" size={15} color="#8FCDF2" />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}
