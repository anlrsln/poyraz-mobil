import React from 'react'
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useRouter } from 'expo-router'
import { useTheme, font, Theme } from '@/lib/theme'
import { sized } from '@/lib/sanity'

export type ProductCardData = {
  _id: string
  name: string
  slug: string
  badge?: string
  cardImage?: string
  collection?: { name?: string; slug?: string }
}

export function ProductCard({
  p,
  width,
  imageHeight = 112,
  showCollection = false,
}: {
  p: ProductCardData
  width?: number | `${number}%`
  imageHeight?: number
  showCollection?: boolean
}) {
  const { t } = useTheme()
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`/urun/${p.slug}`)}
      style={({ pressed }) => [
        {
          width,
          backgroundColor: t.card,
          borderColor: t.line,
          borderWidth: 1,
          borderRadius: 14,
          overflow: 'hidden',
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={{ height: imageHeight, backgroundColor: t.chip }}>
        <Image
          source={{ uri: sized(p.cardImage, 460) }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={180}
        />
        {!!p.badge && (
          <View style={[s.badge, { backgroundColor: t.accent }]}>
            <Text style={s.badgeText}>{p.badge}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 11, paddingBottom: 12 }}>
        <Text numberOfLines={2} style={{ fontFamily: font.serif, fontSize: 13, lineHeight: 17, color: t.ink }}>
          {p.name}
        </Text>
        {showCollection && !!p.collection?.name && (
          <Text style={{ marginTop: 4, fontFamily: font.sans, fontSize: 10.5, color: t.sub }}>
            {p.collection.name}
          </Text>
        )}
        <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Text style={{ fontFamily: font.sansBold, fontSize: 10.5, color: t.accent }}>Detayları İncele</Text>
          <MaterialIcons name="arrow-forward" size={13} color={t.accent} />
        </View>
      </View>
    </Pressable>
  )
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  const { t } = useTheme()
  return (
    <View>
      {!!kicker && (
        <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: t.accent }}>{kicker}</Text>
      )}
      <Text style={{ marginTop: kicker ? 9 : 0, fontFamily: font.serif, fontSize: 22, lineHeight: 26, color: t.ink }}>
        {title}
      </Text>
    </View>
  )
}

export function Loader() {
  const { t } = useTheme()
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <ActivityIndicator color={t.accent} />
    </View>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTheme()
  return (
    <View style={{ padding: 30, alignItems: 'center', gap: 12 }}>
      <MaterialIcons name="cloud-off" size={36} color={t.sub} />
      <Text style={{ fontFamily: font.sansSemi, fontSize: 13, color: t.sub, textAlign: 'center' }}>
        İçerik yüklenemedi. İnternet bağlantınızı kontrol edin.
      </Text>
      <Pressable onPress={onRetry} style={{ backgroundColor: t.navy, height: 42, paddingHorizontal: 22, borderRadius: 11, justifyContent: 'center' }}>
        <Text style={{ fontFamily: font.sansBold, fontSize: 12.5, color: '#fff' }}>Tekrar dene</Text>
      </Pressable>
    </View>
  )
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  color,
  textColor = '#fff',
  outline,
}: {
  label: string
  onPress: () => void
  icon?: keyof typeof MaterialIcons.glyphMap
  color?: string
  textColor?: string
  outline?: boolean
}) {
  const { t } = useTheme()
  const bg = outline ? t.card : color || t.navy
  const fg = outline ? t.brand : textColor
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        height: 52,
        borderRadius: 13,
        backgroundColor: bg,
        borderWidth: outline ? 1 : 0,
        borderColor: t.brand,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      {!!icon && <MaterialIcons name={icon} size={20} color={fg} />}
      <Text style={{ fontFamily: font.sansHeavy, fontSize: 14, color: fg }}>{label}</Text>
    </Pressable>
  )
}

export const cardShadow = (t: Theme) => ({
  shadowColor: '#12244A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 5 },
  elevation: 2,
})

const s = StyleSheet.create({
  badge: { position: 'absolute', top: 7, left: 7, paddingHorizontal: 6, paddingVertical: 5, borderRadius: 5 },
  badgeText: { fontFamily: font.sansHeavy, fontSize: 8, letterSpacing: 0.5, color: '#fff' },
})
