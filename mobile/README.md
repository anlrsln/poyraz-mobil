# Poyraz Mobilya — Mobil Uygulama (Expo)

Tasarım prototipinin React Native karşılığı. Veri kaynağı mevcut Sanity projesi
(`xwyz0p0q / production`); alan adları `anlrsln/poyraz-web` reposundaki şemalarla birebir aynıdır.

## Kurulum

```bash
npx create-expo-app@latest poyraz-mobil --template blank-typescript
cd poyraz-mobil
```

Bu klasördeki dosyaları proje köküne kopyalayın (`app/`, `components/`, `lib/`,
`package.json`, `app.json`, `tsconfig.json`, `babel.config.js`), sonra:

```bash
npm install
npx expo start
```

`assets/` altına dört görsel koyun: `icon.png` (1024×1024), `splash.png`,
`adaptive-icon.png`, `notification-icon.png` (beyaz siluet, 96×96).

## Ekranlar

| Dosya | Ekran |
| --- | --- |
| `app/_layout.tsx` | Splash → bildirim izni → uygulama akışı, fontlar, tema |
| `app/(tabs)/index.tsx` | Ana Sayfa — öne çıkanlar karuseli, istatistikler, koleksiyonlar, kurumsal, yorum, video, bayilik CTA |
| `app/(tabs)/koleksiyonlar.tsx` | Koleksiyon listesi + ürün araması |
| `app/(tabs)/iletisim.tsx` | İletişim — WhatsApp, ara, adres, sosyal |
| `app/(tabs)/daha-fazla.tsx` | Kurumsal / Bayiler / Video / Bayilik / KVKK + tema ve bildirim anahtarları |
| `app/koleksiyon/[slug].tsx` | Koleksiyon detay, 2 kolon ürün ızgarası |
| `app/urun/[slug].tsx` | Ürün detay, galeri, tam ekran yakınlaştırma, WhatsApp + Ara |
| `app/bildirimler.tsx` | Bildirim merkezi (`duyuru` tipi), okundu takibi |
| `app/bayilik.tsx` | Bayilik başvuru formu → mevcut `/api/bayilik-basvuru` |
| `app/kurumsal.tsx`, `app/bayiler.tsx`, `app/video.tsx` | Statik + galeri ekranları |

## Push bildirim

1. `handoff/sanity/duyuru.ts` → repodaki `sanity/schemaTypes/` içine, `index.ts`'e ekleyin.
2. `handoff/next-api/` içindeki iki route → mevcut Next.js projesine.
   Env: `SANITY_API_WRITE_TOKEN`, `SANITY_WEBHOOK_SECRET`.
3. Sanity webhook: `POST https://www.poyrazmobilya.com/api/push`,
   filtre `_type == "duyuru" && !defined(sentAt) && sendPush == true`,
   başlık `x-webhook-secret`.
4. `app.json` içindeki `extra.eas.projectId` alanını gerçek EAS proje id'si ile değiştirin.
5. Uzak bildirim **yalnızca EAS build ile** çalışır:

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
```

Akış: Studio'da duyuru yayınla → webhook → `/api/push` → Expo Push API → cihazlar.
Bildirime dokunulunca `data.productSlug` varsa doğrudan ürün ekranı açılır.

## Notlar

- Görseller Sanity CDN'den `?w=…&q=80&auto=format` ile çekilir (`sized()` yardımcısı).
- `urun.price` şemada var ama sitede gösterilmiyor; uygulamada da gösterilmedi.
- Karanlık mod cihazda `AsyncStorage` ile saklanır, sistem temasından bağımsızdır.
- Bildirim izni reddedilirse uygulama sorunsuz çalışır; izin sonradan
  Daha Fazla → Bildirimler anahtarından istenir.
- Kod burada derlenip test edilmedi; ilk `npx expo start` çalıştırmasında
  tip/paket sürüm uyarılarını `npx expo install --fix` ile giderin.
