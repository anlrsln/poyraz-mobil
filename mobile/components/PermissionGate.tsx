import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, font } from '@/lib/theme'
import { registerForPush } from '@/lib/notifications'
import { PrimaryButton } from './ui'

const ITEMS: { icon: keyof typeof MaterialIcons.glyphMap; label: string }[] = [
  { icon: 'inventory-2', label: 'Koleksiyona eklenen yeni ürünler' },
  { icon: 'price-check', label: 'Bayilere özel fiyat duyuruları' },
  { icon: 'error-outline', label: 'Tükenme üzere olan modeller' },
  { icon: 'event', label: 'Fuar ve etkinlik tarihleri' },
]

export default function PermissionGate({ onDone }: { onDone: () => void }) {
  const { t } = useTheme()
  const insets = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)

  const allow = async () => {
    setBusy(true)
    await registerForPush().catch(() => null)
    onDone()
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.card, paddingTop: insets.top + 60, paddingBottom: insets.top + 20 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 26, flexGrow: 1 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: t.accent,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: t.accent,
            shadowOpacity: 0.32,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 10 },
            elevation: 5,
          }}
        >
          <MaterialIcons name="notifications-active" size={32} color="#fff" />
        </View>

        <Text style={{ marginTop: 26, fontFamily: font.serif, fontSize: 27, lineHeight: 33, color: t.ink }}>
          Yeni ürünlerden ilk siz haberdar olun
        </Text>
        <Text style={{ marginTop: 12, fontFamily: font.sans, fontSize: 14, lineHeight: 23, color: t.sub }}>
          Koleksiyona eklenen modeller, bayilere özel duyurular ve fuar tarihleri için bildirim gönderiyoruz.
        </Text>

        <View style={{ marginTop: 26, gap: 14 }}>
          {ITEMS.map((it) => (
            <View key={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <MaterialIcons name={it.icon} size={21} color={t.accent} />
              <Text style={{ fontFamily: font.sansSemi, fontSize: 13.5, color: t.ink, flex: 1 }}>{it.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 30 }} />

        <PrimaryButton label={busy ? 'Bekleyin…' : 'Bildirimlere İzin Ver'} onPress={allow} />

        <Pressable onPress={onDone} style={{ height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
          <Text style={{ fontFamily: font.sansSemi, fontSize: 13.5, color: t.sub }}>Şimdi Değil</Text>
        </Pressable>

        <Text style={{ textAlign: 'center', fontFamily: font.sans, fontSize: 11, lineHeight: 17, color: t.sub }}>
          Bildirim tercihinizi daha sonra Daha Fazla sekmesinden değiştirebilirsiniz.
        </Text>
      </ScrollView>
    </View>
  )
}
