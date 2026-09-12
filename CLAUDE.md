# Poyraz Mobilya — Mobil Uygulama: Claude Code Devir Notu

Bu dosya, projeyi devralan Claude Code oturumu içindir. Tasarım ve ilk kod üretimi
tamamlandı; buradan sonrası **çalıştırma, derleme hatalarını giderme ve yayına alma**.

---

## 1. Durum

Müşteri: Poyraz Mobilya (Kayseri, 1972 kuruluş) — toptan mobilya üreticisi.
Mevcut web sitesi `https://www.poyrazmobilya.com` (Next.js App Router + Sanity, Vercel'de canlı).
Repo: `anlrsln/poyraz-web`, branch `main`.

Müşteri mobil uygulama istedi. **Asıl motivasyon push bildirim göndermek.**
Uygulamanın içerik ve tasarımı siteyle aynı olacak; sitede olmayan hiçbir özellik eklenmeyecek
(fiyat gösterimi, sepet, üyelik, favori yok — Sanity şemasında karşılığı olmayan hiçbir şey).

Bu klasörde iki parça var:

```
mobile/      → Expo (React Native) uygulaması — yeni proje
sanity/      → poyraz-web reposuna eklenecek yeni şema dosyası
next-api/    → poyraz-web reposuna eklenecek iki API route
```

**Önemli:** Bu kod yazıldı ama **hiç derlenmedi, hiç çalıştırılmadı.** Tip hataları,
paket sürüm uyuşmazlıkları ve RN'e özgü stil sorunları beklenir. İlk işin bunları gidermek.

---

## 2. Mimari

```
Sanity Studio ──(duyuru yayınla)──▶ Sanity webhook
                                        │
                        POST /api/push  ▼   (poyrazmobilya.com, Vercel)
                                   token listesi okunur
                                        │
                                        ▼
                              Expo Push API  ──▶  iOS + Android cihazlar
                                        │
                          bildirime dokunulur → /urun/[slug]

Okuma:  Expo app ──GROQ──▶ apicdn.sanity.io  (useCdn: true, public read)
Yazma:  Expo app ──POST──▶ poyrazmobilya.com/api/*  ──▶ Sanity (write token sunucuda)
```

Yazma token'ı **asla** mobil uygulamaya gömülmez. Bayilik formu ve cihaz token kaydı
mevcut/yeni Next.js route'ları üzerinden geçer.

Sanity projesi: `projectId: xwyz0p0q`, `dataset: production`, `apiVersion: 2024-01-01`.

---

## 3. Mobil uygulama: ne var

Expo Router (file-based routing), TypeScript, `expo-image`, `@expo/vector-icons` (MaterialIcons),
`@sanity/client`, `expo-notifications`, `AsyncStorage`.

```
mobile/
├── app/
│   ├── _layout.tsx              splash → izin ekranı → uygulama akışı, font yükleme, tema
│   ├── (tabs)/
│   │   ├── _layout.tsx          4 sekme: Ana Sayfa, Koleksiyonlar, İletişim, Daha Fazla
│   │   ├── index.tsx            öne çıkanlar karuseli, istatistik şeridi, koleksiyon ızgarası,
│   │   │                        kurumsal kart, yorum, video, bayilik CTA
│   │   ├── koleksiyonlar.tsx    koleksiyon listesi + ürün araması (GROQ match)
│   │   ├── iletisim.tsx         WhatsApp / ara / adres / sosyal / bayilik CTA
│   │   └── daha-fazla.tsx       Kurumsal, Bayiler, Video, Bayilik, KVKK + tema & bildirim anahtarı
│   ├── koleksiyon/[slug].tsx    koleksiyon detay, 2 kolon ürün ızgarası, koleksiyon içi arama
│   ├── urun/[slug].tsx          galeri + thumbnail şeridi + tam ekran Modal zoom,
│   │                            WhatsApp + Ara, parça sayısı, ilgili ürünler
│   ├── bildirimler.tsx          duyuru listesi, okundu takibi, dokununca ürüne yönlendirme
│   ├── bayilik.tsx              başvuru formu → POST /api/bayilik-basvuru
│   ├── kurumsal.tsx             statik metin + istatistikler
│   ├── bayiler.tsx              bayi medya galerisi (şu an Sanity'de boş)
│   └── video.tsx                video galeri, dokununca harici link
├── components/
│   ├── AppHeader.tsx            logo + tema düğmesi + bildirim rozeti
│   ├── Splash.tsx               beyaz zemin, logo, ilerleme çubuğu (2,3 sn)
│   ├── PermissionGate.tsx       ilk açılışta bildirim izni ekranı
│   └── ui.tsx                   ProductCard, SectionTitle, Loader, ErrorState, PrimaryButton
└── lib/
    ├── sanity.ts                istemci + TÜM GROQ sorguları + submitBayilik()
    ├── notifications.ts         push kaydı, yönlendirme, okunmadı sayacı
    ├── useGroq.ts               veri çekme hook'u (loading/error/refresh)
    ├── theme.tsx                açık/karanlık tema, renk ve font sabitleri
    └── links.ts                 WhatsApp/tel/mail/maps açma, timeAgo, bildirim tür meta
```

### Tasarım dili (değiştirme, siteyle eşleşiyor)

| Rol | Değer |
| --- | --- |
| Lacivert (marka) | `#1B3A6B` — karanlıkta `#9CD3F5` |
| Açık mavi (accent) | `#2E9BD6` |
| Koyu lacivert (bölüm zemini) | `#0F2444` |
| Metin | `#12244A` / karanlık `#E9F1FA` |
| İkincil metin | `#5C6E8C` / karanlık `#93A6C2` |
| Zemin | `#F2F6FB` / karanlık `#0B1524` |
| Başlık fontu | Playfair Display 500/600 |
| Gövde fontu | Manrope 400–800 |

Tüm renkler `lib/theme.tsx` içinde; hiçbir ekranda hardcoded hex olmamalı (varsa temizle).

---

## 4. İlk görev: çalıştır ve derleme hatalarını gider

```bash
cd mobile
npm install
npx expo install --fix     # sürüm uyuşmazlıklarını Expo SDK'ya göre düzeltir
npx expo start
```

Beklenen sorunlar ve nasıl ele alınacağı:

1. **`position: 'absolute', inset: 0`** — React Native `inset` kısayolunu desteklemez.
   `{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }` yap. Birkaç yerde geçiyor
   (`index.tsx` koleksiyon kartları, `urun/[slug].tsx` ve `video.tsx` play overlay'i).
2. **`borderStyle: 'dashed'` + `borderRadius`** — Android'de kesikli kenarlık yuvarlak köşeyle
   birlikte düzgün çizilmez. `koleksiyon/[slug].tsx` sonundaki "Aradığınızı Bulamadınız mı?"
   kartında düz kenarlığa çevir veya köşeyi kaldır.
3. **`iletisim.tsx` içinde `require('react-native').Linking`** — tembel require; dosya
   başındaki import'a taşı.
4. **`urun/[slug].tsx` çift sorgu** — `collectionSlug` parametresi ilk sorgudan geldiği için
   `useGroq` iki kez çalışıyor. Tek sorguya indirgemek daha temiz: ürünü çek, `related`'ı
   `*[_type == "urun" && collection._ref == ^.product.collection._ref]` benzeri tek sorguda
   çöz ya da ikinci sorguyu `enabled` bayrağıyla koşullu hale getir.
5. **`@expo-google-fonts/*` paketleri** — yüklü değilse `npx expo install @expo-google-fonts/manrope
   @expo-google-fonts/playfair-display` çalıştır.
6. **`tintColor` `expo-image` üzerinde** — sürüme göre desteklenmiyor olabilir; logoyu karanlık
   temada beyazlatmak için gerekiyor. Çalışmazsa iki ayrı logo dosyası kullan.
7. **`assets/` boş** — `icon.png` (1024×1024), `splash.png`, `adaptive-icon.png`,
   `notification-icon.png` (beyaz siluet, 96×96) gerekli. Müşteriden logo dosyalarını iste;
   geçici olarak `https://www.poyrazmobilya.com/assets/logo.png` kullanılabilir ama
   `app.json` yerel dosya bekler.

Hataları giderirken **tasarımı değiştirme** — ölçüler, renkler ve yerleşim prototipten birebir alındı.

---

## 5. GROQ sorguları — şemayla eşleşme

`lib/sanity.ts` içindeki sorgular `anlrsln/poyraz-web` reposundaki
`sanity/schemaTypes/*.ts` dosyalarından türetildi. Şüpheye düşersen şemayı repodan oku,
tahmin etme.

Kritik noktalar:

- `urun.mediaGallery` karışık dizidir: `type == "image"` olanlarda `imageAsset`,
  `type == "video"` olanlarda `videoUrl` bulunur. Kart görseli için ilk image öğesi alınır.
- `koleksiyon` sıralaması `order asc`; ürünler `orderRank asc, name asc`.
- `anaSayfa` tekil dokümandır (`_id == "anaSayfa"`), `featuredProducts` referans dizisidir.
- `siteAyarlari` ve `iletisimSayfasi` de tekil; WhatsApp numarası ikisinde de olabilir,
  önce `iletisimSayfasi.whatsappNumber`, yoksa `siteAyarlari.whatsappNumber`.
- `urun.price` **şemada var ama sitede gösterilmiyor** — uygulamada da gösterme.
  Müşteri isterse bayi girişi arkasında açılabilir, o ayrı bir iştir.

---

## 6. Push bildirim kurulumu

### 6a. Sanity tarafı (`sanity/duyuru.ts`)

`poyraz-web` reposundaki `sanity/schemaTypes/` klasörüne kopyala, `index.ts`'e ekle:

```ts
import { duyuru, pushToken } from './duyuru'

export const schemaTypes = [
  koleksiyon, urun, anaSayfa, iletisimSayfasi, iletisimMesaji,
  bayilikBasvurusu, siteAyarlari, bayilerSayfasi, seo,
  duyuru, pushToken,
]
```

`duyuru` alanları: `title`, `body`, `kind` (urun/koleksiyon/kampanya/stok/etkinlik/genel),
opsiyonel `product` ve `collection` referansları, `image`, `sendPush` (boolean),
`sentAt` (readOnly — mükerrer gönderimi engeller), `publishedAt`.

`pushToken`: cihaz token'ları. `_id` token'dan türetilir, böylece mükerrer kayıt imkânsız.

### 6b. Next.js tarafı (`next-api/`)

İki route'u `poyraz-web` reposuna kopyala:

- `app/api/push/route.ts` — webhook'u alır, token'ları okur, Expo Push API'ye 100'erlik
  gruplar hâlinde gönderir, sonra `sentAt` yazar.
- `app/api/push-token/route.ts` — mobil uygulamadan gelen token'ı `createOrReplace` ile kaydeder.

Her iki dosya `@/lib/sanity/client` içinden `sanityWriteClient` import ediyor.
**Repodaki gerçek export adını kontrol et** — farklıysa import'u düzelt.

Vercel env değişkenleri:

| Değişken | Not |
| --- | --- |
| `SANITY_API_WRITE_TOKEN` | muhtemelen zaten var (Editor yetkili) |
| `SANITY_WEBHOOK_SECRET` | yeni; rastgele uzun dizi, webhook başlığıyla aynı |

### 6c. Sanity webhook

Manage → API → Webhooks → Create:

```
URL         https://www.poyrazmobilya.com/api/push
Dataset     production
Trigger     Create, Update
Filter      _type == "duyuru" && !defined(sentAt) && sendPush == true
Projection  { _id }
HTTP method POST
Headers     x-webhook-secret: <SANITY_WEBHOOK_SECRET>
```

Filtre sayesinde taslak kaydetmek bildirim göndermez, aynı duyuru iki kez gitmez.

### 6d. EAS build

Uzak push **Expo Go'da çalışmaz**, EAS build şart.

```bash
npm i -g eas-cli
eas login
eas build:configure          # bu, app.json'a gerçek projectId yazar
eas build --profile development --platform android
```

`mobile/app.json` içinde `extra.eas.projectId` şu an `"BURAYA-EAS-PROJECT-ID"` placeholder'ı.
`eas build:configure` bunu otomatik doldurur; doldurmazsa elle yaz.

iOS için Apple Developer hesabı gerekir. APNs anahtarını Expo yönetir, ayrı FCM kurulumu
gerekmez — bu yüzden Expo Push seçildi (OneSignal/FCM yerine).

---

## 7. Test senaryosu (bitti sayılması için hepsi geçmeli)

1. Uygulama açılır, splash 2,3 sn görünür, izin ekranı gelir.
2. "Bildirimlere İzin Ver" → izin verilir, token `pushToken` dokümanı olarak Sanity'ye düşer.
3. Ana sayfada gerçek ürünler ve koleksiyonlar görünür (Sanity'den).
4. Koleksiyon → ürün detay → görsele dokun → tam ekran zoom çalışır.
5. WhatsApp butonu doğru numarayla ve ürün adını içeren mesajla açılır.
6. Bayilik formu gönderilir, Sanity'de `bayilikBasvurusu` dokümanı oluşur.
7. Studio'da `product` referanslı bir duyuru yayınla → telefona bildirim düşer →
   dokununca **doğru ürün ekranı** açılır.
8. Aynı duyuruyu tekrar yayınla → ikinci bildirim gitmez (`sentAt` dolu).
9. Karanlık mod açılır, uygulama kapatılıp açıldığında hatırlanır.
10. Uçak modunda açılış: hata ekranı çıkar, "Tekrar dene" çalışır.

---

## 8. Yapma

- Sitede olmayan özellik ekleme (fiyat, sepet, üyelik, favori, stok adedi).
- Tasarımı "iyileştirme" — renkler, boşluklar ve tipografi siteden birebir alındı.
- Sanity'ye yeni doküman tipi ekleme — `duyuru` ve `pushToken` dışında gerek yok.
- Write token'ı mobil uygulamaya koyma.
- `sanity/schemaTypes/*` içindeki mevcut şemaları değiştirme; site onlara bağlı.

---

## 9. Referanslar

- Tasarım prototipi: bu paketin geldiği projede `Poyraz Mobilya Mobil Uygulama.dc.html`
  (iOS + Android çerçevesinde tıklanabilir, tüm ekranlar mevcut).
- Bağlama rehberi: aynı projede `Sanity Baglama Rehberi.dc.html`.
- Web repo: `anlrsln/poyraz-web` — şema ve mevcut sorgular için tek doğruluk kaynağı.
