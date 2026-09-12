import { Linking, Platform } from 'react-native'

export const WHATSAPP_FALLBACK = '905465073816'
export const PHONE_FALLBACK = '+90 546 507 3816'

export const digits = (v?: string) => (v || '').replace(/[^0-9]/g, '')

export function openWhatsApp(number: string | undefined, message?: string) {
  const no = digits(number) || WHATSAPP_FALLBACK
  const url = `https://wa.me/${no}${message ? `?text=${encodeURIComponent(message)}` : ''}`
  Linking.openURL(url)
}

export function call(phone: string | undefined) {
  const no = digits(phone) || digits(PHONE_FALLBACK)
  Linking.openURL(`${Platform.OS === 'ios' ? 'telprompt' : 'tel'}:+${no}`)
}

export function mail(address: string | undefined) {
  Linking.openURL(`mailto:${address || 'poyrazzmobilyaa@gmail.com'}`)
}

export function maps(address: string | undefined) {
  Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address || 'Poyraz Mobilya Kayseri')}`)
}

export function timeAgo(iso?: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'az önce'
  if (h < 24) return `${h} sa`
  const d = Math.floor(h / 24)
  if (d === 1) return 'dün'
  if (d < 7) return `${d} gün`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w} hf`
  return new Date(iso).toLocaleDateString('tr-TR')
}

export const NOTIF_META: Record<string, { tag: string; icon: string }> = {
  urun: { tag: 'YENİ ÜRÜN', icon: 'inventory-2' },
  koleksiyon: { tag: 'YENİ KOLEKSİYON', icon: 'home-work' },
  kampanya: { tag: 'KAMPANYA', icon: 'price-check' },
  stok: { tag: 'STOK UYARISI', icon: 'error-outline' },
  etkinlik: { tag: 'FUAR & ETKİNLİK', icon: 'event' },
  genel: { tag: 'DUYURU', icon: 'campaign' },
}
