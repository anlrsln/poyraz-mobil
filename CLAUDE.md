# Poyraz Mobilya — Mobil Uygulama: Claude Code Devir Notu

Bu dosya, projeyi devralan Claude Code oturumu içindir. Tasarım, kod üretimi,
**SDK yükseltmesi ve derleme aşaması tamamlandı**; kalan iş **cihazda test ve yayına alma**.

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

**Durum:** Kod artık kuruldu ve derlendi. `npx tsc --noEmit` 0 hata,
`npx expo-doctor` 21/21, `npx expo export` başarılı. Expo SDK 51 → **57**
yükseltildi (RN 0.86, React 19); SDK 51 targetSdk 34 ürettiği için Google Play'e
yayın yapılamıyordu. Cihazda hiç çalıştırılmadı — sıradaki iş o.

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

## 4. Yapıldı: kurulum, SDK 57 yükseltmesi, derleme hataları

```bash
cd mobile
npm install
npx expo start
```

Devir notunun ilk hâlinde beklenen 7 sorundan **üçü SDK 57 ile kendiliğinden
geçersiz kaldı** — kod değiştirilmedi, doğrulanıp olduğu gibi bırakıldı:

- `inset: 0` RN 0.86'da resmen destekleniyor (`StyleSheetTypes` içinde CSS
  kısayolu olarak tanımlı). 5 çağrı yerinde.
- Kesikli kenarlık + `borderRadius`: Android `BorderDrawable.draw()` artık
  yuvarlak kenarlarda da dash path effect uyguluyor.
- `tintColor` expo-image 57'de `ImageProps` içinde mevcut.

Yükseltmenin gerektirdiği değişiklikler ve giderilen gerçek hatalar için
`git log` ve `mobile/README.md`ye bakın. Özet:

- `shouldShowAlert` → `shouldShowBanner` + `shouldShowList`
- bottom-tabs v7: `sceneContainerStyle` → `sceneStyle`
- `app.json`: üst düzey `splash` anahtarı → `expo-splash-screen` eklentisi
- `urun/[slug].tsx` çift sorgu → tek sorgu (`^.collection._ref`)
- `/gizlilik` 404 → `/gizlilik-sozlesmesi`
- WhatsApp/telefon/e-posta yedek zinciri bağlandı (§5 kuralı)
- Okunmadı sayacı yalnızca `_id` çekiyor
- `RefreshControl` gerçek `refreshing` durumu
- Font yüklenemezse beyaz ekranda kalma
- Uzak logo URL'i → yerel varlık
- Font/ikon alt yol import'u: varlık yükü 7,7MB → 2,2MB

`assets/` artık dolu; ikonlar `poyraz-logo.pdf`ten
`mobile/scripts/gen-assets.py` ile üretiliyor. Müşteri kendi ikonlarını
gönderirse aynı adlarla değiştirmek yeterli.

Hataları giderirken **tasarım değiştirilmedi** — ölçüler, renkler ve yerleşim
prototipten birebir.

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

### 6a. Sanity tarafı — **yapıldı**

`poyraz-web` reposunda `feat/push-bildirim` dalında: `duyuru` ve `pushToken`
repo konvansiyonuna uygun şekilde ayrı dosyalara yazıldı ve `index.ts`'e eklendi.
Mevcut şemalara dokunulmadı. Dal henüz **merge/deploy edilmedi**.

> **Tuzak:** Studio `sanity.config.ts` içinde özel bir `structure` kullanıyor ve
> sol menü öğelerini **elle sayıyor**. Bir tipi `schemaTypes`'a eklemek onu
> tanıtır ama menüde göstermez — `structure` içine de
> `S.documentTypeListItem('...')` eklemek gerekiyor. İlk denemede bu atlandı;
> `next build` geçtiği için fark edilmedi, Studio'da hiçbir değişiklik
> görünmedi. Yeni doküman tipi eklerken ikisini birlikte yapın.

Menüye eklenenler: "Duyurular (Push Bildirim)" (ürün bloğundan önce, kendi
bölümünde) ve "Kayıtlı Cihazlar" (gelen kayıtlarla aynı bölümde — test
sırasında cihazın token kaydını doğrulamak için).

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

### 6b. Next.js tarafı — **yapıldı**

İki route aynı dalda, repo konvansiyonuna (`Response.json`, düz `Request`,
try/catch) uyarlanarak eklendi. `next build` ve `eslint` temiz:

- `app/api/push/route.ts` — webhook'u alır, token'ları okur, Expo Push API'ye 100'erlik
  gruplar hâlinde gönderir, sonra `sentAt` yazar.
- `app/api/push-token/route.ts` — mobil uygulamadan gelen token'ı `createOrReplace` ile kaydeder.

Her iki dosya `@/lib/sanity/client` içinden `sanityWriteClient` import ediyor —
export adı repoda doğrulandı, düzeltme gerekmedi.

Vercel env değişkenleri: **ikisi de zaten var.** `SANITY_WEBHOOK_SECRET`
`/api/revalidate` tarafından kullanılıyor; webhook'un `x-webhook-secret`
başlığında aynı değeri göndermesi yeterli. Yeni değişken gerekmiyor.

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

`eas.json` hazır: `development` (dev client + APK), `preview`, `production`.

**Android teslim kanalı — devir notunun ilk hâlinde eksikti.**

Bu konu projede iki kez yanlış anlaşıldı, o yüzden net yazıyorum: **FCM ikinci bir
backend değil, Android'in teslim kanalı.** Kilitli telefonun ekranında bildirim
çıkarmak işletim sistemi seviyesinde Google Play Services'tan geçer; uygulama hangi
CMS'i kullanırsa kullansın Android'e bildirim göndermenin başka yolu yoktur
(OneSignal, Airship gibi servisler de altta FCM'e teslim eder). iOS'ta karşılığı
APNs'tir ve orada Firebase devreye girmez.

Somut durum: **kodda tek satır Firebase yok**, bağımlılık listesinde de yok
(`grep -ri firebase mobile/app mobile/lib mobile/components` → boş). İçerik
Sanity'de durur, Firebase'de hiçbir veri saklanmaz, müşteri o paneli görmez,
ücretsizdir. Yapılan tek şey Expo'nun uygulama adına teslim yapabilmesi için
tek seferlik kimlik dosyası yüklemek.

Gereken iş: Firebase projesi + `google-services.json` (gizli değil, commit edilir)
+ servis hesabı özel anahtarı (**gizli, repoya girmez**, `eas credentials` ile
doğrudan Expo'ya yüklenir — `.gitignore` bu dosyayı engelliyor).
Adım adım `mobile/README.md` içinde.

iOS için Apple Developer hesabı gerekir; APNs anahtarını Expo yönetir, orada
Firebase devreye girmez.

---

## 7. Test senaryosu (bitti sayılması için hepsi geçmeli)

**Şu ana kadar geçenler** (iOS simülatörü + yerel Next dev sunucusu, 13 Eylül):

- 3, 4, 9 numaralı maddeler: ana sayfa gerçek Sanity verisiyle çalışıyor
  (6 öne çıkan ürün, koleksiyonlar), karanlık mod kapatıp açtıktan sonra
  hatırlandı (AsyncStorage'da `poyraz.theme`).
- Studio'da oluşturulan duyuru uygulamada göründü: zil rozeti "1", bildirim
  merkezinde "YENİ ÜRÜN" kartı, okunmadı noktası ve "Ürüne git" bağlantısı.
- `/api/push` yerel dev sunucusunda webhook isteği birebir taklit edilerek
  test edildi: yanlış secret → 401, secret yok → 401, `_id` yok → 400,
  kayıtlı cihaz yok → skipped, cihaz varken Expo Push API'ye gönderim
  (`sent: 1`), `sentAt` yazımı ve **8. madde**: aynı duyuru tekrar
  yayınlandığında "Zaten gönderildi".
- `/api/push-token`: geçersiz token → 400, geçerli token → kayıt oluştu.

**Kalanlar:** 1, 2, 5, 6, 7 numaralı maddeler gerçek cihaz gerektiriyor
(simülatör push token almaz — `Device.isDevice` false; iOS simülatörüne APNs
teslimi yapılmaz; WhatsApp/telefon uygulaması yok). 10 numaralı madde
simülatörde uçak modu taklidi olmadığı için cihazda denenecek.



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
- **`pushToken` dokümanlarının `_id` biçimini değiştirme.** `'pushToken.' + token`
  biçimindeki noktalı önek, Sanity'nin path önekli dokümanları yetkisiz okumadan
  saklaması sayesinde cihaz token'larını dışarıya kapatıyor. Testte doğrulandı:
  noktalı `_id` yetkisiz okumada görünmüyor, düz `_id` görünüyor. Dataset
  public-read olduğu ve Expo Push API gönderim için kimlik doğrulaması istemediği
  için önek kaldırılırsa üçüncü biri token'ları toplayıp kullanıcılara bildirim
  gönderebilir.

---

## 9. Referanslar

- Tasarım prototipi: bu paketin geldiği projede `Poyraz Mobilya Mobil Uygulama.dc.html`
  (iOS + Android çerçevesinde tıklanabilir, tüm ekranlar mevcut).
- Bağlama rehberi: aynı projede `Sanity Baglama Rehberi.dc.html`.
- Web repo: `anlrsln/poyraz-web` — şema ve mevcut sorgular için tek doğruluk kaynağı.
