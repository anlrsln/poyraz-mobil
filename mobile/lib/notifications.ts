/**
 * lib/notifications.ts — Expo push kaydı, bildirime dokunma yönlendirmesi,
 * ve uygulama içi "okunmadı" sayacı.
 *
 * Kurulum:
 *   npx expo install expo-notifications expo-device expo-constants
 *   app.json → plugins: ["expo-notifications"]
 *   Uzak push yalnızca EAS build ile çalışır (Expo Go'da çalışmaz).
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { sanity, duyurularQuery } from './sanity'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

const TOKEN_ENDPOINT = 'https://www.poyrazmobilya.com/api/push-token'
const READ_KEY = 'poyraz.readDuyurular'

/** İzin ister, Expo push token'ını alır ve sunucuya kaydeder. */
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Duyurular',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E9BD6',
    })
  }

  const existing = await Notifications.getPermissionsAsync()
  let status = existing.status
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status
  if (status !== 'granted') return null

  const projectId =
    (Constants.expoConfig?.extra as any)?.eas?.projectId ?? (Constants as any).easConfig?.projectId
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data

  await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform: Platform.OS }),
  }).catch(() => {})

  return token
}

export async function hasPushPermission() {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

/** Bildirime dokunulduğunda ilgili ürün/koleksiyon ekranına götürür. */
export function useNotificationRouting() {
  const handled = useRef<string | null>(null)

  useEffect(() => {
    const open = (data: any) => {
      if (!data) return
      if (data.productSlug) router.push(`/urun/${data.productSlug}`)
      else if (data.collectionSlug) router.push(`/koleksiyon/${data.collectionSlug}`)
      else router.push('/bildirimler')
    }

    Notifications.getLastNotificationResponseAsync().then((res) => {
      const id = res?.notification.request.identifier
      if (res && id && handled.current !== id) {
        handled.current = id
        open(res.notification.request.content.data)
      }
    })

    const sub = Notifications.addNotificationResponseReceivedListener((res) => {
      open(res.notification.request.content.data)
    })
    return () => sub.remove()
  }, [])
}

/* ── Uygulama içi okunmadı takibi ─────────────────────────────── */

let listeners: Array<() => void> = []
const notifyAll = () => listeners.forEach((fn) => fn())

export async function getRead(): Promise<Record<string, true>> {
  const raw = await AsyncStorage.getItem(READ_KEY)
  return raw ? JSON.parse(raw) : {}
}

export async function markRead(ids: string[]) {
  const read = await getRead()
  ids.forEach((id) => (read[id] = true))
  await AsyncStorage.setItem(READ_KEY, JSON.stringify(read))
  notifyAll()
}

/** Başlıktaki rozet için okunmamış duyuru sayısı. */
export function useUnreadCount() {
  const [count, setCount] = useState(0)

  const recount = useCallback(async () => {
    try {
      const [ids, read] = await Promise.all([
        sanity.fetch<{ _id: string }[]>(duyurularQuery),
        getRead(),
      ])
      setCount(ids.filter((d) => !read[d._id]).length)
    } catch {
      setCount(0)
    }
  }, [])

  useEffect(() => {
    recount()
    listeners.push(recount)
    const sub = Notifications.addNotificationReceivedListener(() => recount())
    return () => {
      listeners = listeners.filter((fn) => fn !== recount)
      sub.remove()
    }
  }, [recount])

  return count
}
