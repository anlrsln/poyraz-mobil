/**
 * app/api/push/route.ts  —  mevcut Next.js projesine eklenir (Vercel'de zaten çalışıyor).
 *
 * Sanity webhook'u bir "duyuru" dokümanı yayınlandığında burayı çağırır;
 * bu route tüm cihaz token'larını okur ve Expo Push API'sine gönderir.
 *
 * Gerekli env değişkenleri (Vercel → Settings → Environment Variables):
 *   SANITY_API_WRITE_TOKEN   (zaten var — token yazmak/sentAt güncellemek için)
 *   SANITY_WEBHOOK_SECRET    (Sanity webhook ayarında da aynı değer)
 */
import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient } from '@/lib/sanity/client'

const EXPO_ENDPOINT = 'https://exp.host/--/api/v2/push/send'

type Duyuru = {
  _id: string
  title: string
  body: string
  kind: string
  sendPush?: boolean
  sentAt?: string
  productSlug?: string
  collectionSlug?: string
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-webhook-secret') !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = await req.json()
  const id: string | undefined = payload?._id
  if (!id) return NextResponse.json({ error: 'missing _id' }, { status: 400 })

  const duyuru: Duyuru | null = await sanityWriteClient.fetch(
    `*[_type == "duyuru" && _id == $id][0]{
      _id, title, body, kind, sendPush, sentAt,
      "productSlug": product->slug.current,
      "collectionSlug": collection->slug.current
    }`,
    { id }
  )

  if (!duyuru) return NextResponse.json({ skipped: 'not found' })
  if (duyuru.sendPush === false) return NextResponse.json({ skipped: 'sendPush kapalı' })
  if (duyuru.sentAt) return NextResponse.json({ skipped: 'zaten gönderildi' })

  const tokens: string[] = await sanityWriteClient.fetch(
    `*[_type == "pushToken" && defined(token)].token`
  )
  if (!tokens.length) return NextResponse.json({ skipped: 'kayıtlı cihaz yok' })

  const data = {
    duyuruId: duyuru._id,
    kind: duyuru.kind,
    productSlug: duyuru.productSlug ?? null,
    collectionSlug: duyuru.collectionSlug ?? null,
  }

  const results: unknown[] = []
  // Expo tek istekte en fazla 100 mesaj kabul eder
  for (const group of chunk(tokens, 100)) {
    const res = await fetch(EXPO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(
        group.map((to) => ({
          to,
          title: duyuru.title,
          body: duyuru.body,
          sound: 'default',
          channelId: 'default',
          data,
        }))
      ),
    })
    results.push(await res.json())
  }

  await sanityWriteClient.patch(duyuru._id).set({ sentAt: new Date().toISOString() }).commit()

  return NextResponse.json({ sent: tokens.length, results })
}
