# Stoikos Backend (Cloudflare Worker)

Koç isteklerini Claude'a iletir, Anthropic anahtarını güvenle saklar ve her
kullanıcının **hafızasını** KV'de tutar.

## Tek seferlik kurulum

1. **Cloudflare hesabı aç** (ücretsiz): https://dash.cloudflare.com/sign-up

2. **Bağımlılıkları kur** (bu klasörde):
   ```bash
   cd backend
   npm install
   ```

3. **Cloudflare'e giriş yap:**
   ```bash
   npx wrangler login
   ```

4. **Hafıza deposunu (KV) oluştur:**
   ```bash
   npx wrangler kv namespace create MEMORY
   ```
   Çıktıdaki `id = "..."` değerini kopyala ve `wrangler.toml` içindeki
   `BURAYA_KV_ID_YAZILACAK` yerine yapıştır.

5. **Anthropic anahtarını sır olarak ekle:**
   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   ```
   (sorunca anahtarını yapıştır — `sk-ant-...`)

6. **Yayına al:**
   ```bash
   npm run deploy
   ```
   Çıktıda şuna benzer bir adres verir:
   `https://stoikos-backend.<hesabın>.workers.dev`
   **Bu adresi bana ver** — uygulamayı ona bağlayacağım.

## Test (deploy sonrası)
```bash
curl -X POST https://stoikos-backend.<hesabın>.workers.dev/coach \
  -H "Content-Type: application/json" \
  -d '{"userId":"test1","lang":"tr","messages":[{"role":"user","content":"İşte başarısız oldum"}]}'
```
Yanıtta Stoacı bir cevap dönmeli. Tekrar mesaj atınca seni hatırlamaya başlar.

## Uç noktalar
- `POST /coach` — `{ userId, lang, messages }` → `{ reply }`
- `GET /memory/:userId` — kayıtlı hafızayı görür (debug)
- `POST /memory/reset` — `{ userId }` → hafızayı siler

## Not
- Abonelik doğrulaması sonra eklenecek (RevenueCat).
- Maliyet: yalnızca koç kullanımı kadar Claude API + Cloudflare ücretsiz katman.
