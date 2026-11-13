# Story Özelliği — Tasarım

Tarih: 13 Kasım 2026 · Onay: anlrsln

## Amaç

Studio'dan eklenen story'ler mobil uygulamanın ana sayfasında yuvarlaklar hâlinde,
yayın tarihinden itibaren **7 gün** görünür. Yalnızca uygulamada; sitede story
gösterimi yok.

**Kural istisnası:** CLAUDE.md §8'deki "sitede olmayan özellik ekleme" ve "duyuru ve
pushToken dışında yeni doküman tipi ekleme" kurallarına bilinçli istisna. CLAUDE.md
buna göre güncellenecek.

## Kararlar

| Konu | Karar |
| --- | --- |
| İçerik | Görsel + video |
| Yapı | Bir story = bir yuvarlak, içinde 1–10 kare |
| Bağlantı | Opsiyonel ürün veya koleksiyon → "Ürünü İncele" / "Koleksiyonu Gör" |
| Süre | `publishedAt` ile `publishedAt + 7 gün` arası görünür |
| Okuma | Uygulama doğrudan Sanity CDN'den GROQ ile okur; API route yok |

## Backend — poyraz-web (`feat/story` dalı)

Sitenin sayfa, sorgu ve API'lerine dokunulmaz. Yalnızca Studio:

1. `sanity/schemaTypes/story.ts` — yeni tip:
   - `title` string, zorunlu, max 40 — yuvarlağın altındaki ad
   - `cover` image, opsiyonel — boşsa ilk görsel kare kullanılır
   - `items` array, min 1 max 10 — üyeleri:
     - `image` (hotspot)
     - `file` adı `video`, `accept: 'video/mp4,video/quicktime'`; açıklama:
       "≤15 sn, 720p, mümkünse <10 MB — videolar sıkıştırılmadan sunulur"
   - `product` → `urun` referansı, opsiyonel
   - `collection` → `koleksiyon` referansı, opsiyonel ("ürün seçilmediyse kullanılır")
   - `publishedAt` datetime, zorunlu, `initialValue: now`
   - `preview`: başlık + kapak; alt satırda "Yayında · N gün kaldı" / "Süresi doldu" /
     "Zamanlandı: <tarih>"
2. `sanity/schemaTypes/index.ts` — `story` eklenir.
3. `sanity.config.ts` `structure` — `S.documentTypeListItem('story').title('Story'ler')`,
   Duyurular'ın hemen altına. **Bu adım atlanırsa tip menüde görünmez.**

Env değişkeni, webhook, API route yok.

## Mobil uygulama

### Veri — `lib/sanity.ts`

`homeQuery` içine:

```groq
"stories": *[_type == "story"
  && dateTime(publishedAt) <= dateTime(now())
  && dateTime(publishedAt) > dateTime(now()) - 60*60*24*7
] | order(publishedAt desc) {
  _id, title, publishedAt,
  "cover": coalesce(cover.asset->url, items[_type == "image"][0].asset->url),
  "items": items[]{ _key, _type, "url": asset->url },
  "productSlug": product->slug.current,
  "collectionSlug": collection->slug.current
}
```

Ana sayfayla aynı sorguda olduğu için aşağı çekip yenileme story'leri de yeniler.

### Bileşenler

- **`components/StoryRail.tsx`** — yatay `ScrollView`, "Öne Çıkan Ürünler"in üstünde.
  Her öğe: 68 px yuvarlak kapak, 2,5 px halka, altında tek satır başlık (11 px Manrope).
  Halka: izlenmemiş `t.accent`, izlenmiş `t.line`. Sıra: izlenmemişler önce, her grup
  kendi içinde yeniden eskiye. `stories.length === 0` ise hiç render edilmez.
- **`app/story/[id].tsx`** — tam ekran izleyici, `Stack.Screen` `presentation:
  'fullScreenModal'`, `animation: 'fade'`. Siyah zemin (medya ekranı; tema rengi değil,
  `theme.tsx`'e `storyBg` olarak eklenir).
  - Üstte kare sayısı kadar ilerleme çubuğu + başlık + kapat (X).
  - Görsel 5 sn; video kendi süresi (`expo-video`, sessiz değil, döngü yok).
  - Sağ 2/3'e dokun → sonraki kare; sol 1/3 → önceki. Basılı tut → duraklat.
    Aşağı kaydır → kapat.
  - Son kareden sonra sıradaki story'ye geçer (rail sırası); sonuncudan sonra kapanır.
  - `productSlug` varsa altta "Ürünü İncele", yoksa `collectionSlug` varsa
    "Koleksiyonu Gör" butonu; dokununca izleyici kapanır ve ilgili ekran açılır.
  - Medya yüklenmezse kare atlanmaz, "Yüklenemedi" gösterilir ve süre işler.
- **`lib/stories.ts`** — izlenenler AsyncStorage `poyraz.storiesSeen` (id dizisi).
  Bir story ilk karesi gösterildiğinde izlendi sayılır. Okurken artık aktif olmayan
  id'ler atılır.

Story listesi ana sayfadan izleyiciye `id` parametresi + modül seviyesinde bir önbellek
(`lib/stories.ts` içinde `setStoryQueue`) ile geçer; izleyici yeniden sorgu atmaz.

### Bağımlılık

`npx expo install expo-video` (SDK 57 → `~57.0.5`). Native modül olduğu için
**dev build'ler yeniden derlenmeli** (simülatör: `eas build -p ios --profile
development-simulator`). Eski build yeni JS'i çalıştırırsa video kareleri hata verir.

## Hata durumları

- Sorgu başarısızsa ana sayfanın mevcut hata ekranı devrede; story ayrı hata göstermez.
- Kapak yoksa (sadece video kareli story ve `cover` boş) yuvarlakta `t.navy` zemin +
  `play-circle-outline` ikonu.
- Süresi izlerken dolan story izleyicide sonuna kadar oynar.

## Test

1. Studio'da 2 görsel + 1 video kareli, ürün bağlı story yayınla → ana sayfada yuvarlak
   çıkar, halka mavi.
2. Dokun → kareler sırayla oynar, video sesli ve süresince; ileri/geri/duraklat/kapat çalışır.
3. "Ürünü İncele" doğru ürün ekranını açar.
4. Kapat → halka gri, yuvarlak sona kaydı; uygulama kapatılıp açılınca gri kalır.
5. `publishedAt`'i 8 gün önceye çek → yenileyince kaybolur. Yarına çek → görünmez.
6. Tüm story'leri sil → story alanı tamamen kaybolur, ana sayfa düzeni bozulmaz.
7. Karanlık modda halka ve başlık renkleri doğru.
8. `npx tsc --noEmit` 0 hata, `npx expo-doctor` temiz.

## Kapsam dışı

Story için push bildirim, görüntülenme sayısı, story'ye yanıt/beğeni, sitede gösterim.
