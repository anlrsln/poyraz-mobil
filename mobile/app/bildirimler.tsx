import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { useTheme, font } from '@/lib/theme'
import { useGroq } from '@/lib/useGroq'
import { duyurularQuery } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { Loader, ErrorState } from '@/components/ui'
import { getRead, markRead } from '@/lib/notifications'
import { timeAgo, NOTIF_META } from '@/lib/links'

type Duyuru = {
  _id: string
  title: string
  body: string
  kind: string
  publishedAt?: string
  productSlug?: string
  collectionSlug?: string
}

export default function Bildirimler() {
  const { t } = useTheme()
  const router = useRouter()
  const { data, loading, refreshing, error, refresh } = useGroq<Duyuru[]>(duyurularQuery)
  const [read, setRead] = useState<Record<string, true>>({})

  useEffect(() => {
    getRead().then(setRead)
  }, [])

  const open = useCallback(
    async (d: Duyuru) => {
      await markRead([d._id])
      setRead((r) => ({ ...r, [d._id]: true }))
      if (d.productSlug) router.push(`/urun/${d.productSlug}`)
      else if (d.collectionSlug) router.push(`/koleksiyon/${d.collectionSlug}`)
    },
    [router]
  )

  const markAll = async () => {
    const ids = (data ?? []).map((d) => d._id)
    await markRead(ids)
    setRead(Object.fromEntries(ids.map((id) => [id, true])) as Record<string, true>)
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader back />

      {loading && !data ? (
        <Loader />
      ) : error && !data ? (
        <ErrorState onRetry={refresh} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={t.accent} />}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: font.serif, fontSize: 26, color: t.ink }}>Bildirimler</Text>
            {!!data?.length && (
              <Pressable onPress={markAll} hitSlop={8} style={{ paddingBottom: 4 }}>
                <Text style={{ fontFamily: font.sansBold, fontSize: 11.5, color: t.accent }}>Tümünü okundu işaretle</Text>
              </Pressable>
            )}
          </View>

          {data?.length === 0 && (
            <View style={{ marginTop: 40, alignItems: 'center', gap: 12 }}>
              <MaterialIcons name="notifications-none" size={40} color={t.sub} />
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: t.sub }}>Henüz duyuru yok.</Text>
            </View>
          )}

          <View style={{ marginTop: 16, gap: 10 }}>
            {(data ?? []).map((d) => {
              const meta = NOTIF_META[d.kind] ?? NOTIF_META.genel
              const unread = !read[d._id]
              const cta = d.productSlug ? 'Ürüne git' : d.collectionSlug ? 'Koleksiyonu gör' : ''
              return (
                <Pressable
                  key={d._id}
                  onPress={() => open(d)}
                  style={{
                    backgroundColor: t.card,
                    borderWidth: 1,
                    borderColor: unread ? t.accent : t.line,
                    borderRadius: 15,
                    padding: 14,
                    flexDirection: 'row',
                    gap: 12,
                  }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name={meta.icon as keyof typeof MaterialIcons.glyphMap} size={20} color={t.accent} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <Text style={{ fontFamily: font.sansBold, fontSize: 9, letterSpacing: 1.4, color: t.sub }}>{meta.tag}</Text>
                      {unread && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.danger }} />}
                      <View style={{ flex: 1 }} />
                      <Text style={{ fontFamily: font.sansSemi, fontSize: 10.5, color: t.sub }}>{timeAgo(d.publishedAt)}</Text>
                    </View>

                    <Text style={{ marginTop: 7, fontFamily: font.sansBold, fontSize: 13.5, lineHeight: 18, color: t.ink }}>{d.title}</Text>
                    <Text style={{ marginTop: 5, fontFamily: font.sans, fontSize: 12.5, lineHeight: 19, color: t.sub }}>{d.body}</Text>

                    {!!cta && (
                      <View style={{ marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Text style={{ fontFamily: font.sansBold, fontSize: 11.5, color: t.accent }}>{cta}</Text>
                        <MaterialIcons name="arrow-forward" size={14} color={t.accent} />
                      </View>
                    )}
                  </View>
                </Pressable>
              )
            })}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
