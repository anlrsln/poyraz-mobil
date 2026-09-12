import { defineType, defineField } from 'sanity'

/**
 * Push bildirimleri için TEK yeni doküman tipi.
 * sanity/schemaTypes/duyuru.ts olarak kaydedin ve index.ts'e ekleyin.
 */
export const duyuru = defineType({
  name: 'duyuru',
  title: 'Duyurular (Push Bildirim)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Bildirim Başlığı',
      type: 'string',
      description: 'Telefon ekranında kalın görünen satır. En fazla ~50 karakter.',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'body',
      title: 'Bildirim Metni',
      type: 'text',
      rows: 3,
      description: 'En fazla ~120 karakter tavsiye edilir.',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'kind',
      title: 'Tür',
      type: 'string',
      options: {
        list: [
          { title: 'Yeni ürün', value: 'urun' },
          { title: 'Yeni koleksiyon', value: 'koleksiyon' },
          { title: 'Kampanya / özel fiyat', value: 'kampanya' },
          { title: 'Stok uyarısı', value: 'stok' },
          { title: 'Fuar & etkinlik', value: 'etkinlik' },
          { title: 'Genel duyuru', value: 'genel' },
        ],
        layout: 'radio',
      },
      initialValue: 'genel',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'product',
      title: 'İlgili Ürün (opsiyonel)',
      type: 'reference',
      to: [{ type: 'urun' }],
      description: 'Seçilirse bildirime dokunan kullanıcı doğrudan bu ürün sayfasına gider.',
    }),
    defineField({
      name: 'collection',
      title: 'İlgili Koleksiyon (opsiyonel)',
      type: 'reference',
      to: [{ type: 'koleksiyon' }],
      description: 'Ürün seçilmediyse kullanılır.',
    }),
    defineField({
      name: 'image',
      title: 'Görsel (opsiyonel)',
      type: 'image',
      options: { hotspot: true },
      description: 'Bildirim merkezinde kart görseli olarak gösterilir.',
    }),
    defineField({
      name: 'sendPush',
      title: 'Push bildirimi gönder',
      type: 'boolean',
      initialValue: true,
      description: 'Kapatırsanız duyuru sadece uygulama içi bildirim merkezinde görünür, telefonlara push gitmez.',
    }),
    defineField({
      name: 'sentAt',
      title: 'Gönderim Zamanı (otomatik)',
      type: 'datetime',
      readOnly: true,
      description: 'Push gönderildiğinde sunucu tarafından doldurulur. Aynı duyurunun iki kez gönderilmesini engeller.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Yayın Tarihi',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    { title: 'En yeni', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'kind', media: 'image' },
  },
})

/**
 * Cihaz push token'ları. Uygulama açılışında kaydedilir.
 * sanity/schemaTypes/pushToken.ts
 */
export const pushToken = defineType({
  name: 'pushToken',
  title: 'Cihaz Token’ları',
  type: 'document',
  fields: [
    defineField({ name: 'token', title: 'Expo Push Token', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: { list: [{ title: 'iOS', value: 'ios' }, { title: 'Android', value: 'android' }] },
    }),
    defineField({ name: 'lastSeenAt', title: 'Son Görülme', type: 'datetime' }),
  ],
  preview: { select: { title: 'token', subtitle: 'platform' } },
})
