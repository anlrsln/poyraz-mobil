import React, { useState } from 'react'
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme, font } from '@/lib/theme'
import { submitBayilik } from '@/lib/sanity'
import { AppHeader } from '@/components/AppHeader'
import { PrimaryButton } from '@/components/ui'

type FieldKey = 'firstName' | 'lastName' | 'companyName' | 'city' | 'ilce' | 'phone' | 'email' | 'message'

const FIELDS: { key: FieldKey; label: string; ph: string; keyboard?: 'default' | 'phone-pad' | 'email-address' }[] = [
  { key: 'firstName', label: 'AD *', ph: 'Adınız' },
  { key: 'lastName', label: 'SOYAD *', ph: 'Soyadınız' },
  { key: 'companyName', label: 'FİRMA ADI *', ph: 'Firma adı' },
  { key: 'city', label: 'ŞEHİR *', ph: 'Şehir' },
  { key: 'ilce', label: 'İLÇE *', ph: 'İlçe' },
  { key: 'phone', label: 'TELEFON *', ph: '+90 5xx xxx xx xx', keyboard: 'phone-pad' },
  { key: 'email', label: 'E-POSTA *', ph: 'ornek@firma.com', keyboard: 'email-address' },
]

const WHY: { icon: keyof typeof MaterialIcons.glyphMap; title: string; body: string }[] = [
  { icon: 'inventory-2', title: 'Geniş Ürün Yelpazesi', body: '500+ farklı mobilya ürünüyle çok seçenek.' },
  { icon: 'local-shipping', title: 'Hızlı Teslimat', body: 'Güçlü lojistik ağı ile zamanında teslimat.' },
  { icon: 'price-check', title: 'Fabrikadan Direkt Fiyat', body: 'Rekabetçi toptan fiyatlarla karlılık.' },
  { icon: 'support-agent', title: 'Kurumsal Destek', body: 'Satış ve proje süreçlerinde yanınızdayız.' },
]

const EMPTY: Record<FieldKey, string> = {
  firstName: '', lastName: '', companyName: '', city: '', ilce: '', phone: '', email: '', message: '',
}

export default function Bayilik() {
  const { t } = useTheme()
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: FieldKey, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    const missing = FIELDS.filter((f) => !form[f.key].trim())
    if (missing.length) {
      setError('Lütfen zorunlu alanları doldurun.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await submitBayilik(form)
      setSent(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const inputStyle = {
    height: 46,
    borderWidth: 1,
    borderColor: t.line,
    backgroundColor: t.card,
    borderRadius: 12,
    paddingHorizontal: 13,
    fontFamily: font.sansSemi,
    fontSize: 13.5,
    color: t.ink,
  } as const

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <AppHeader back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={{ fontFamily: font.sansBold, fontSize: 10, letterSpacing: 2, color: t.accent }}>İŞ BİRLİĞİ</Text>
          <Text style={{ marginTop: 9, fontFamily: font.serif, fontSize: 26, color: t.ink }}>Bayilik Başvurusu</Text>
          <Text style={{ marginTop: 10, fontFamily: font.sans, fontSize: 13, lineHeight: 21, color: t.sub }}>
            Türkiye'nin dört bir yanındaki bayi ağımıza katılın. Kaliteli ürünlerimizi müşterilerinize sunun.
          </Text>

          {sent ? (
            <View style={{ marginTop: 22, backgroundColor: t.card, borderWidth: 1, borderColor: t.accent, borderRadius: 16, padding: 26, alignItems: 'center' }}>
              <MaterialIcons name="task-alt" size={38} color={t.accent} />
              <Text style={{ marginTop: 12, fontFamily: font.serif, fontSize: 20, color: t.ink }}>Başvurunuz alındı</Text>
              <Text style={{ marginTop: 9, textAlign: 'center', fontFamily: font.sans, fontSize: 12.5, lineHeight: 20, color: t.sub }}>
                Ekibimiz en kısa sürede sizinle iletişime geçecek.
              </Text>
              <Pressable onPress={() => { setForm(EMPTY); setSent(false) }} style={{ marginTop: 16 }}>
                <Text style={{ fontFamily: font.sansBold, fontSize: 12.5, color: t.accent }}>Yeni başvuru</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {WHY.map((w) => (
                  <View key={w.title} style={{ flexGrow: 1, flexBasis: '46%', backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 13, padding: 13 }}>
                    <MaterialIcons name={w.icon} size={20} color={t.accent} />
                    <Text style={{ marginTop: 9, fontFamily: font.sansBold, fontSize: 12, lineHeight: 15, color: t.ink }}>{w.title}</Text>
                    <Text style={{ marginTop: 5, fontFamily: font.sans, fontSize: 10.5, lineHeight: 16, color: t.sub }}>{w.body}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ marginTop: 24, fontFamily: font.serif, fontSize: 20, color: t.ink }}>Başvuru Formu</Text>
              <Text style={{ marginTop: 4, fontFamily: font.sans, fontSize: 12, lineHeight: 19, color: t.sub }}>
                Formu doldurun, ekibimiz en kısa sürede sizinle iletişime geçsin.
              </Text>

              <View style={{ marginTop: 16, gap: 12 }}>
                {FIELDS.map((f) => (
                  <View key={f.key} style={{ gap: 6 }}>
                    <Text style={{ fontFamily: font.sansBold, fontSize: 10.5, letterSpacing: 1, color: t.sub }}>{f.label}</Text>
                    <TextInput
                      value={form[f.key]}
                      onChangeText={(v) => set(f.key, v)}
                      placeholder={f.ph}
                      placeholderTextColor={t.sub}
                      keyboardType={f.keyboard ?? 'default'}
                      autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                      style={inputStyle}
                    />
                  </View>
                ))}

                <View style={{ gap: 6 }}>
                  <Text style={{ fontFamily: font.sansBold, fontSize: 10.5, letterSpacing: 1, color: t.sub }}>EK MESAJ</Text>
                  <TextInput
                    value={form.message}
                    onChangeText={(v) => set('message', v)}
                    placeholder="İletmek istediğiniz bilgi"
                    placeholderTextColor={t.sub}
                    multiline
                    numberOfLines={4}
                    style={[inputStyle, { height: 110, paddingTop: 12, textAlignVertical: 'top' }]}
                  />
                </View>

                {!!error && (
                  <Text style={{ fontFamily: font.sansSemi, fontSize: 12, color: t.danger }}>{error}</Text>
                )}

                <PrimaryButton label={busy ? 'Gönderiliyor…' : 'Başvuruyu Gönder'} onPress={submit} />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
