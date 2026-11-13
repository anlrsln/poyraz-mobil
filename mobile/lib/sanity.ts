/**
 * lib/sanity.ts — Expo uygulaması için Sanity istemcisi ve GROQ sorguları.
 * Alan adları poyraz-web reposundaki sanity/schemaTypes/* ile birebir aynıdır.
 *
 * Kurulum:  npx expo install @sanity/client
 */
import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'xwyz0p0q',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // mobilde CDN şart: hızlı ve ucuz
})

/** asset->url dönen sorgular için boyutlandırma. w: kart 460, detay 900, lightbox 1400 */
export const sized = (url?: string, w = 800, q = 80) =>
  !url ? undefined : `${url}${url.includes('?') ? '&' : '?'}w=${w}&q=${q}&auto=format&fit=max`

const PRODUCT_CARD = `
  _id, name, "slug": slug.current, badge, pieces,
  "cardImage": mediaGallery[type == "image"][0].imageAsset.asset->url,
  collection->{ _id, name, "slug": slug.current }
`

const PRODUCT_FULL = `
  _id, name, "slug": slug.current, badge, pieces, pieceNames, description,
  "images": mediaGallery[type == "image"].imageAsset.asset->url,
  "videos": mediaGallery[type == "video"].videoUrl,
  collection->{ _id, name, "slug": slug.current }
`

/** Koleksiyon listesi — site ile aynı sıralama */
export const collectionsQuery = `*[_type == "koleksiyon"] | order(order asc) {
  _id, name, "slug": slug.current, description,
  "cardImage": cardImage.asset->url,
  "heroImage": heroImage.asset->url
}`

/** Yayında olan story'ler: publishedAt'ten itibaren 7 gün. Yalnızca uygulamada gösterilir. */
export const storiesQuery = `*[_type == "story"
  && dateTime(publishedAt) <= dateTime(now())
  && dateTime(publishedAt) > dateTime(now()) - 60*60*24*7
] | order(publishedAt desc) {
  _id, title, publishedAt,
  "cover": coalesce(
    cover.asset->url,
    items[_type == "image"][0].asset->url,
    product->mediaGallery[type == "image"][0].imageAsset.asset->url
  ),
  // Yüklenen kareler önce, seçilen ürünün görselleri arkasına; toplam en fazla 10.
  "items": (
    coalesce(items[]{ _key, _type, "url": asset->url }, []) +
    coalesce(product->mediaGallery[type == "image"]{ "_key": "urun-" + _key, "_type": "image", "url": imageAsset.asset->url }, [])
  )[0...10],
  "productSlug": product->slug.current,
  "collectionSlug": collection->slug.current
}`

/** Ana Sayfa: koleksiyonlar + öne çıkanlar + yorumlar + video galeri + ayarlar */
export const homeQuery = `{
  "collections": ${collectionsQuery},
  "home": *[_type == "anaSayfa"][0] {
    "heroImage": heroBackgroundImage.asset->url,
    testimonials[]{ quote, authorName, authorLocation },
    videoGallery[]{ title, description, tag, "thumbnail": thumbnail.asset->url, videoType, videoUrl },
    "featuredProducts": featuredProducts[]->{ ${PRODUCT_CARD} }
  },
  "settings": *[_type == "siteAyarlari"][0] {
    whatsappNumber, contactPhone, contactEmail
  },
  "stories": ${storiesQuery}
}`

/** Koleksiyon detay + içindeki ürünler */
export const collectionQuery = `*[_type == "koleksiyon" && slug.current == $slug][0]{
  _id, name, "slug": slug.current, description,
  "heroImage": heroImage.asset->url,
  "cardImage": cardImage.asset->url,
  "products": *[_type == "urun" && references(^._id)] | order(orderRank asc, name asc) { ${PRODUCT_CARD} }
}`

/** Ürün detay + aynı koleksiyondan diğerleri — tek istek */
export const productQuery = `*[_type == "urun" && slug.current == $slug][0]{
  ${PRODUCT_FULL},
  "related": *[_type == "urun" && slug.current != $slug && collection._ref == ^.collection._ref]
    | order(orderRank asc, name asc)[0...8] { ${PRODUCT_CARD} },
  "settings": *[_type == "siteAyarlari"][0]{ whatsappNumber, contactPhone },
  "contact": *[_type == "iletisimSayfasi"][0]{ whatsappNumber, phone }
}`

/** Ürün adında arama. $term = kullanıcı girdisi + '*' */
export const searchQuery = `*[_type == "urun" && name match $term] | order(orderRank asc)[0...24]{ ${PRODUCT_CARD} }`

/** İletişim + bayiler medya galerisi */
export const contactQuery = `{
  "contact": *[_type == "iletisimSayfasi"][0]{ address, phone, email, whatsappNumber, mapEmbedUrl },
  "settings": *[_type == "siteAyarlari"][0]{ whatsappNumber, contactPhone, contactEmail }
}`

export const bayilerQuery = `*[_type == "bayilerSayfasi"][0]{
  mediaGallery[]{ type, "imageUrl": imageAsset.asset->url, "thumbnail": thumbnail.asset->url, videoUrl, title }
}`

export const videoQuery = `*[_type == "anaSayfa"][0]{
  videoGallery[]{ title, description, tag, "thumbnail": thumbnail.asset->url, videoType, videoUrl }
}`

/** Bildirim merkezi — YENİ duyuru tipi */
export const duyurularQuery = `*[_type == "duyuru"] | order(publishedAt desc)[0...50]{
  _id, title, body, kind, publishedAt,
  "image": image.asset->url,
  "productSlug": product->slug.current,
  "collectionSlug": collection->slug.current
}`

/** Okunmadı sayacı için — yalnızca kimlikler (AppHeader her ekranda çalışıyor) */
export const duyuruIdsQuery = `*[_type == "duyuru"] | order(publishedAt desc)[0...50]{ _id }`

/** Bayilik başvurusu — mevcut Next.js route'u üzerinden (yazma token'ı sunucuda kalır) */
export async function submitBayilik(form: {
  firstName: string
  lastName: string
  companyName: string
  city: string
  ilce: string
  phone: string
  email: string
  message?: string
}) {
  const res = await fetch('https://www.poyrazmobilya.com/api/bayilik-basvuru', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || 'Başvuru gönderilemedi')
  return json
}
