# Bekleyen Testler

`feat/push-bildirim` main'e merge edildi (PR #1, `0291c21`). Aşağıdakiler sırayla
yapılacak; her adım bir öncekine bağlı.

Son kontrol: 13 Kasım 2026 — canlıda `/api/push` ve `/api/push-token` **404** dönüyordu
(deploy henüz yansımamıştı).

---

## A. Canlı ortam hazırlığı

- [ ] **A1. Vercel deploy.** Vercel panelinde `main` için son deploy'un `0291c21`
      commit'ini içerdiğini ve "Ready" olduğunu doğrula.
- [ ] **A2. Route'lar canlıda.** İkisi de 404 değil, aşağıdaki kodları dönmeli:
  ```bash
  # secret yok → 401
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://www.poyrazmobilya.com/api/push \
    -H 'content-type: application/json' -d '{}'
  # geçersiz token → 400 (hiçbir şey yazmaz)
  curl -s -w "\n%{http_code}\n" -X POST https://www.poyrazmobilya.com/api/push-token \
    -H 'content-type: application/json' -d '{"token":"gecersiz"}'
  ```
- [ ] **A3. Studio menüsü.** Canlı Studio'da sol menüde "Duyurular (Push Bildirim)" ve
      "Kayıtlı Cihazlar" görünüyor.
- [ ] **A4. Sanity webhook.** Manage → API → Webhooks → Create:

  | Alan | Değer |
  | --- | --- |
  | URL | `https://www.poyrazmobilya.com/api/push` |
  | Dataset | `production` |
  | Trigger | Create, Update |
  | Filter | `_type == "duyuru" && !defined(sentAt) && sendPush == true` |
  | Projection | `{ _id }` |
  | HTTP method | POST |
  | Header | `x-webhook-secret: <SANITY_WEBHOOK_SECRET>` (Vercel'deki değerle aynı) |

- [ ] **A5. Webhook bağlantısı.** Cihaz kayıtlı değilken `sendPush` açık bir test duyurusu
      yayınla. Webhook teslim kaydında yanıt `200` ve `skipped` olmalı (401 ise secret
      uyuşmuyor). Test duyurusunu sonra sil.

## B. Gerçek cihaz (development build gerekir, Expo Go yetmez)

Önkoşul: Android için Firebase `google-services.json` + FCM anahtarı
(`mobile/README.md`), iOS için ücretli Apple Developer hesabı.

- [ ] **B1.** Uygulama açılır, splash 2,3 sn görünür, izin ekranı gelir.
- [ ] **B2.** "Bildirimlere İzin Ver" → izin verilir, Studio'da "Kayıtlı Cihazlar" altında
      cihaz görünür.
- [ ] **B3.** Ürün detayında WhatsApp butonu doğru numarayla, ürün adını içeren mesajla açılır.
- [ ] **B4.** Bayilik formu gönderilir, Studio'da "Bayilik Başvuruları"nda kayıt oluşur.
- [ ] **B5.** Studio'da `product` referanslı bir duyuru yayınla → telefona bildirim düşer →
      dokununca **doğru ürün ekranı** açılır.
- [ ] **B6.** Aynı duyuruyu tekrar yayınla → ikinci bildirim gitmez (`sentAt` dolu).
- [ ] **B7.** Uçak modunda açılış: hata ekranı çıkar, bağlantı gelince "Tekrar dene" çalışır.

## Daha önce geçenler (tekrar gerekmez)

Simülatör + yerel Next dev sunucusu, 13 Eylül: ana sayfa gerçek Sanity verisiyle,
koleksiyon → ürün → tam ekran zoom, karanlık modun hatırlanması, uygulama içi bildirim
merkezi, `/api/push` hata kodları ve mükerrer gönderim koruması, `/api/push-token` kaydı.
