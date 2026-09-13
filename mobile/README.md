# Poyraz Mobilya — Mobil Uygulama (Expo)

Mevcut web sitesinin (`poyrazmobilya.com`) mobil karşılığı. Veri kaynağı siteyle aynı
Sanity projesi (`xwyz0p0q / production`); alan adları `anlrsln/poyraz-web` reposundaki
şemalarla birebir aynıdır. Uygulamanın asıl amacı **push bildirim** göndermek.

## Durum

| | |
| --- | --- |
| Expo SDK | 57 (RN 0.86, React 19) |
| Tip kontrolü | `npx tsc --noEmit` → 0 hata |
| Expo tanılama | `npx expo-doctor` → 21/21 |
| Paketleme | `npx expo export` → başarılı |
| Cihazda test | **yapılmadı** — EAS build gerekiyor (aşağıya bakın) |

## Çalıştırma

```bash
npm install
npx expo start
```

Expo Go ile arayüzün tamamı gezilebilir ve Sanity'den gerçek veri gelir.
**Uzak push bildirim Expo Go'da çalışmaz**; onun için EAS build şart.

## Mimari

```
Okuma:  uygulama ──GROQ──▶ apicdn.sanity.io           (public read, useCdn)
Yazma:  uygulama ──POST──▶ poyrazmobilya.com/api/*    (write token sunucuda)

Duyuru: Studio'da yayınla ──▶ Sanity webhook ──▶ /api/push
                                                    │
                                          Expo Push API ──▶ cihazlar
                                                    │
                                   bildirime dokun ──▶ /urun/[slug]
```

Sanity yazma token'ı uygulamaya **gömülmez**. Bayilik formu ve cihaz token kaydı
Next.js route'ları üzerinden geçer.

## Ekranlar

| Dosya | Ekran |
| --- | --- |
| `app/_layout.tsx` | Splash → bildirim izni → uygulama akışı, fontlar, tema |
| `app/(tabs)/index.tsx` | Ana sayfa — öne çıkanlar, istatistikler, koleksiyonlar, kurumsal, yorum, video, bayilik |
| `app/(tabs)/koleksiyonlar.tsx` | Koleksiyon listesi + ürün araması |
| `app/(tabs)/iletisim.tsx` | WhatsApp, ara, adres, sosyal medya |
| `app/(tabs)/daha-fazla.tsx` | Kurumsal / Bayiler / Video / Bayilik / KVKK + tema ve bildirim anahtarları |
| `app/koleksiyon/[slug].tsx` | Koleksiyon detay, 2 kolon ürün ızgarası |
| `app/urun/[slug].tsx` | Ürün detay, galeri, tam ekran yakınlaştırma, WhatsApp + Ara |
| `app/bildirimler.tsx` | Bildirim merkezi (`duyuru`), okundu takibi |
| `app/bayilik.tsx` | Bayilik başvuru formu → `/api/bayilik-basvuru` |
| `app/kurumsal.tsx`, `app/bayiler.tsx`, `app/video.tsx` | Statik ve galeri ekranları |

## İkonlar

`assets/` içindeki tüm görseller `poyraz-logo.pdf`ten üretildi:

```bash
python3 scripts/gen-assets.py [logo.pdf] [assets/]
```

Müşteri kendi ikon dosyalarını gönderirse `assets/` içindekileri aynı adlarla
değiştirmek yeterli. Bildirim ikonu Android'de **yalnızca alpha kanalı** olarak
kullanılır (beyaz siluet, saydam zemin) — renkli bir PNG koyulursa beyaz kare görünür.

## Push bildirim — kalan adımlar

Sanity şeması ve API route'ları `anlrsln/poyraz-web` reposunda
`feat/push-bildirim` dalında hazır (henüz merge/deploy edilmedi).

**1. Web tarafını yayına al**

```bash
# poyraz-web reposunda
git push -u origin feat/push-bildirim     # sonra PR → main → Vercel deploy
```

`SANITY_WEBHOOK_SECRET` zaten `/api/revalidate` için tanımlı; yeni ortam
değişkeni gerekmiyor.

**2. Sanity webhook** (Manage → API → Webhooks → Create)

```
URL          https://www.poyrazmobilya.com/api/push
Dataset      production
Trigger      Create, Update
Filter       _type == "duyuru" && !defined(sentAt) && sendPush == true
HTTP method  POST
Headers      x-webhook-secret: <SANITY_WEBHOOK_SECRET>
```

Filtre sayesinde taslak kaydetmek bildirim göndermez, aynı duyuru iki kez gitmez.

**3. EAS projesi**

```bash
npm i -g eas-cli
eas login
eas init          # app.json'daki extra.eas.projectId placeholder'ını doldurur
```

`eas.json` profilleri hazır: `development` (dev client + APK), `preview`, `production`.

**4. Android teslim kanalı (FCM)**

> **Bu ikinci bir backend değil.** Android'de kilitli telefonun ekranında bildirim
> çıkarmak işletim sistemi seviyesinde Google Play Services'tan geçer; FCM tam olarak
> budur. Uygulama hangi CMS'i kullanırsa kullansın Android'e bildirim göndermenin
> başka yolu yoktur (OneSignal, Airship gibi servisler de altta FCM'e teslim eder).
> iOS'ta karşılığı Apple'ın APNs'i ve orada Firebase devreye girmez.
>
> Somut olarak: içerik Sanity'de durur, Firebase'de **hiçbir veri saklanmaz**,
> müşteri o paneli hiç görmez, ücretsizdir ve **kodda tek satır Firebase yoktur** —
> bağımlılık listesinde de yoktur. Yapılan tek şey, Expo'nun sizin uygulamanız adına
> teslim yapabilmesi için bir kimlik dosyası yüklemek. Tek seferlik, ~10 dakika.

1. Firebase Console → yeni proje → Android uygulaması ekle
   (paket adı: `com.poyrazmobilya.app`)
2. `google-services.json`u indir, proje köküne koy ve `app.json` içine ekle:
   `"android": { "googleServicesFile": "./google-services.json", ... }`
3. Firebase → Proje ayarları → Hizmet hesapları → yeni özel anahtar (JSON)
4. `eas credentials` → Android → FCM V1 → 3. adımdaki anahtarı yükle

**İki dosyayı karıştırmayın:**

| Dosya | Gizli mi? | Nereye |
| --- | --- | --- |
| `google-services.json` | Hayır — zaten APK'nın içinde dağıtılıyor | Proje köküne, **commit edilir** (EAS build git index'inden okuduğu için gitignore'lanırsa build kırılır) |
| `…-firebase-adminsdk-….json` (servis hesabı özel anahtarı) | **EVET** | Repoya **asla girmez**; doğrudan `eas credentials` ile Expo'ya yüklenir, orada saklanır |

**5. iOS teslim kanalı (APNs)**

Apple Developer hesabı gerekir; Firebase gerekmez.

```bash
eas credentials    # iOS → Push Notifications → Expo anahtarı yönetsin
```

**6. Dev build ve test**

```bash
eas build --profile development --platform android
```

Çıkan APK'yı gerçek cihaza kurun (emülatörde push çalışmaz).

## Simülatörde test

Expo Go ile arayüzün tamamı ve Sanity verisi test edilebilir (yukarıdaki
"Çalıştırma"). Derin bağlantıyla ekranlara doğrudan gidilebilir:

```bash
xcrun simctl openurl booted "exp://<ip>:8081/--/bildirimler"
xcrun simctl openurl booted "exp://<ip>:8081/--/urun/hazar"
```

**Simülatörde çalışmayanlar:** push token kaydı (`Device.isDevice` false),
gerçek push teslimi (iOS simülatörüne APNs gelmez), `tel:`/`mailto:`,
WhatsApp uygulaması.

### Bildirimin ekranda görünmesi — dev build gerekiyor

Bildirim banner'ını ve "dokununca doğru ürüne gitme" davranışını simülatörde
görmek için development build şart (Expo Go'nun bundle id'si farklı).

**Yerel build bu makinede çalışmıyor:**

```
package 'apple' is using Swift tools version 6.2.0 but the installed version is 6.1.0
```

Xcode 16.4 Swift 6.1 ile geliyor, Expo SDK 57 Swift 6.2 (Xcode 26) istiyor.
Yerel `npx expo run:ios` için Xcode'u güncellemek gerekiyor.

**Bulut alternatifi (Xcode güncellemeden):** simülatör build'i imza
gerektirmediği için Apple Developer hesabı da gerekmez.

```bash
eas login
eas build -p ios --profile development-simulator
# cikan .tar.gz indirilir, acilir ve kurulur:
xcrun simctl install booted PoyrazMobilya.app
npx expo start --dev-client
```

Sonra sahte bildirim gönderip dokunun:

```bash
xcrun simctl push booted com.poyrazmobilya.app payload.json
```

```json
{ "aps": { "alert": { "title": "Yeni ürün: HAZAR",
                      "body": "Koleksiyonumuza yeni eklenen modeli inceleyin" },
           "sound": "default" },
  "productSlug": "hazar", "kind": "urun" }
```

> **CocoaPods tuzağı:** `pod install` UTF-8 yerel ayarı olmadan
> `Encoding::CompatibilityError` ile patlıyor. Gerekirse:
> `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install`

## Test senaryosu

Bitti sayılması için hepsi geçmeli:

1. Uygulama açılır, splash ~2,3 sn görünür, izin ekranı gelir.
2. "Bildirimlere İzin Ver" → token Sanity'de `pushToken` dokümanı olarak oluşur.
3. Ana sayfada Sanity'den gerçek ürün ve koleksiyonlar görünür.
4. Koleksiyon → ürün detay → görsele dokun → tam ekran yakınlaştırma.
5. WhatsApp butonu doğru numarayla ve ürün adını içeren mesajla açılır.
6. Bayilik formu gönderilir, Sanity'de `bayilikBasvurusu` oluşur.
7. Studio'da ürün referanslı duyuru yayınla → bildirim düşer → dokununca
   **doğru ürün ekranı** açılır.
8. Aynı duyuruyu tekrar yayınla → ikinci bildirim gitmez (`sentAt` dolu).
9. Karanlık mod açılır, uygulama kapatılıp açıldığında hatırlanır.
10. Uçak modunda açılış: hata ekranı çıkar, "Tekrar dene" çalışır.

## Notlar

- Görseller Sanity CDN'inden `?w=…&q=80&auto=format` ile çekilir (`sized()`).
- `urun.price` şemada var ama sitede gösterilmiyor; uygulamada da gösterilmiyor.
- Karanlık mod `AsyncStorage`'da saklanır, sistem temasından bağımsızdır.
- Bildirim izni reddedilirse uygulama sorunsuz çalışır; izin sonradan
  Daha Fazla → Bildirimler anahtarından istenir.
- WhatsApp/telefon/e-posta sırası: önce `iletisimSayfasi`, yoksa `siteAyarlari`,
  o da yoksa `lib/links.ts` içindeki sabitler.
- Font ve ikonlar paket kökünden değil alt yollardan import edilir
  (`@expo-google-fonts/manrope/500Medium`); kökten import bundle'a bütün
  aileyi koyuyor ve varlık yükünü 2,2MB'dan 7,7MB'a çıkarıyor.
