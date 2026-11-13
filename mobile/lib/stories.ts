/**
 * lib/stories.ts — ana sayfa story'leri: tipler, izlenme kaydı ve izleyici kuyruğu.
 * Story'ler homeQuery ile gelir (lib/sanity.ts); burada ağ isteği yok.
 */
import AsyncStorage from '@react-native-async-storage/async-storage'

export type StoryItem = { _key: string; _type: 'image' | 'video'; url?: string }

export type Story = {
  _id: string
  title: string
  publishedAt: string
  cover?: string
  items: StoryItem[]
  productSlug?: string
  collectionSlug?: string
}

const SEEN_KEY = 'poyraz.storiesSeen'

/** İzlenen story id'lerini okur; artık yayında olmayanları listeden atar. */
export async function loadSeen(activeIds: string[]): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY)
    const stored: string[] = raw ? JSON.parse(raw) : []
    const active = new Set(activeIds)
    const kept = stored.filter((id) => active.has(id))
    if (kept.length !== stored.length) await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(kept))
    return new Set(kept)
  } catch {
    return new Set()
  }
}

export async function markSeen(id: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY)
    const stored: string[] = raw ? JSON.parse(raw) : []
    if (!stored.includes(id)) await AsyncStorage.setItem(SEEN_KEY, JSON.stringify([...stored, id]))
  } catch {
    // izlenme kaydı yazılamazsa halka mavi kalır; kullanıcıya gösterilecek bir hata değil
  }
}

/** Ana sayfadaki sıra; izleyici bir story bitince sıradakine bununla geçer. */
let queue: Story[] = []
export const setStoryQueue = (stories: Story[]) => {
  queue = stories
}
export const getStoryQueue = () => queue

/** İzlenmemişler önce; her grup kendi içinde yeniden eskiye (sorgu zaten öyle sıralı). */
export const sortStories = (stories: Story[], seen: Set<string>) => [
  ...stories.filter((s) => !seen.has(s._id)),
  ...stories.filter((s) => seen.has(s._id)),
]
