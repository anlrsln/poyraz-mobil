/**
 * app/api/push-token/route.ts — uygulama açılışında cihaz token'ını kaydeder.
 * Yazma token'ı sunucuda kalır; mobil uygulama sadece bu endpoint'i çağırır.
 */
import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient } from '@/lib/sanity/client'

export async function POST(req: NextRequest) {
  const { token, platform } = await req.json()
  if (typeof token !== 'string' || !token.startsWith('ExponentPushToken')) {
    return NextResponse.json({ error: 'geçersiz token' }, { status: 400 })
  }

  // Token'ı _id olarak kullanmak mükerrer kaydı imkânsız kılar
  const _id = 'pushToken.' + token.replace(/[^a-zA-Z0-9]/g, '')

  await sanityWriteClient.createOrReplace({
    _id,
    _type: 'pushToken',
    token,
    platform: platform === 'ios' ? 'ios' : 'android',
    lastSeenAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}
