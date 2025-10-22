# Authentication Implementation Summary

## O'zgarishlar

### 1. **lib/cookies.ts** (YANGI)
- ✅ Universal cookie helper yaratildi - SSR/SSG uchun
- ✅ `setCookie()`, `getCookie()`, `removeCookie()` funksiyalari
- ✅ `getCookieJSON()`, `setCookieJSON()` JSON data uchun
- ✅ Server va client tomonlarda ishlaydi
- ✅ Cookie keys: `COOKIE_KEYS.ACCESS_TOKEN`, `COOKIE_KEYS.LANGUAGE`, `COOKIE_KEYS.CART`, `COOKIE_KEYS.FAVORITES`, `COOKIE_KEYS.LAST_ORDER`

### 2. **lib/config/env.ts**
- ✅ `buildClientBase()` funksiyasi qo'shildi
- Client-side axios uchun `NEXT_PUBLIC_API_URL` ni qaytaradi

### 3. **lib/bot.ts** 
- ✅ `openAppInlineKeyboard()` funksiyasi yangilandi - endi `token` va `userId` qabul qiladi
- ✅ Backend'dan `access_token` va `id` qabul qiladi (ikkala `access_token` va `accessToken` variantlarini qo'llab-quvvatlaydi)
- ✅ WebApp URL'ga token va user ID query parametrlar sifatida qo'shiladi: `?t=TOKEN&uid=USER_ID`

### 4. **components/TelegramTokenHandler.tsx**
- ✅ URL'dan `t` (token) va `uid` (user ID) parametrlarini oladi
- ✅ Tokenni **cookie**'ga saqlaydi (`COOKIE_KEYS.ACCESS_TOKEN`)
- ✅ `setClientAuthToken(token)` chaqiradi - axios'ga Bearer token qo'shadi
- ✅ Profile API'dan user ma'lumotlarini oladi va auth store'ga saqlaydi
- ✅ URL'ni tozalaydi (query parametrlarni olib tashlaydi)

### 4. **lib/api/auth.ts**
- ✅ `AuthUser` type qo'shildi
- ✅ `requestLoginOTP(phone_number)` - login OTP so'rash
- ✅ `verifyLoginOTP(phone_number, code)` - login OTP tekshirish
- ✅ `requestSignupOTP(phone_number, full_name?)` - signup OTP so'rash
- ✅ `verifySignupOTP(phone_number, code, full_name?)` - signup OTP tekshirish
- ✅ Barcha verify funksiyalar `access_token` ni avtomatik `localStorage`ga saqlaydi
- ✅ `fetchJson()` helper funksiyasi har bir so'rovga Bearer token qo'shadi

### 5. **lib/api/axios.ts**
- ✅ `clientAxios` allaqachon to'g'ri sozlangan
- ✅ Interceptor avtomatik ravishda `localStorage.accessToken`ni oladi va har bir so'rovga `Authorization: Bearer TOKEN` qo'shadi
- ✅ Server va client axios instancelari alohida

### 6. **lib/api/orders.ts**
- ✅ `createOrder()` endi `clientAxios` ishlatadi (Bearer token avtomatik qo'shiladi)
- ✅ `getOrderByOrderId()` endi `clientAxios` ishlatadi
- ✅ Manual fetch o'rniga axios interceptorlariga ishonadi

### 7. **components/auth/auth-modal.tsx**
- ✅ Parametrlar tartibini tuzatildi
- ✅ Endi auth.ts dan import qilingan funksiyalar to'g'ri ishlaydi

## ⚠️ MUHIM O'ZGARISH: localStorage → Cookie

Barcha ma'lumotlar endi **cookie**'larda saqlanadi, chunki:
- ✅ SSR/SSG qo'llab-quvvatlaydi (server-side render)
- ✅ Next.js middleware'da token tekshirish mumkin
- ✅ Xavfsizroq (httpOnly, secure, sameSite)
- ✅ Cross-tab sinxronizatsiya yaxshiroq

### Cookie'larga o'tkazilgan ma'lumotlar:
1. **Authentication Token** (`COOKIE_KEYS.ACCESS_TOKEN`)
   - Max age: 30 kun
   - Har bir API so'rovda avtomatik yuboriladi

2. **Cart** (`COOKIE_KEYS.CART`)
   - Max age: 30 kun
   - Server-side render uchun savatni ko'rsatish mumkin

3. **Favorites** (`COOKIE_KEYS.FAVORITES`)
   - Max age: 30 kun
   - Server-side render uchun sevimlilarni ko'rsatish mumkin

4. **Language** (`COOKIE_KEYS.LANGUAGE`)
   - Max age: 1 yil
   - Server-side da to'g'ri tilni aniqlash

5. **Last Order** (`COOKIE_KEYS.LAST_ORDER`)
   - Max age: 1 kun
   - Buyurtma muvaffaqiyat sahifasida offline rejimda ko'rsatish

## Ishlatish

### Bot orqali login/signup:
1. Foydalanuvchi botga `/start` yozadi
2. Telefon raqamini ulashadi
3. OTP kodini kiritadi
4. Bot WebApp tugmasini yuboradi: `https://sbm.uz?t=ACCESS_TOKEN&uid=USER_ID`
5. Foydalanuvchi WebApp'ni ochadi
6. `TelegramTokenHandler` avtomatik:
   - Tokenni `localStorage.accessToken`ga saqlaydi
   - Axios'ga Bearer token qo'shadi
   - Profile ma'lumotlarini oladi
   - Auth store'ni yangilaydi
   - URL'ni tozalaydi

### WebApp ichida login/signup (auth-modal):
1. Foydalanuvchi login/signup tugmasini bosadi
2. Telefon va (signup uchun) ismini kiritadi
3. OTP kodini kiritadi
4. Token avtomatik `localStorage`ga saqlanadi
5. `setClientAuthToken()` chaqiriladi
6. Keyingi barcha API so'rovlar Bearer token bilan yuboriladi

## API So'rovlar

Har bir authenticated API so'rov avtomatik ravishda quyidagi header bilan yuboriladi:

```
Authorization: Bearer ACCESS_TOKEN
```

Bu quyidagi yo'llar bilan ishlaydi:
- `clientAxios` interceptor (avtomatik)
- `auth.ts` dagi `fetchJson()` helper
- Barcha orders, profile va boshqa authenticated endpointlar

## Token Lifecycle

1. **Olish**: Bot yoki auth-modal orqali
2. **Saqlash**: `localStorage.accessToken`
3. **Ishlatish**: Har bir so'rovda avtomatik Bearer token sifatida
4. **Tozalash**: `clearAccessToken()` yoki logout

## Testing

```bash
# Build
npm run build

# Dev
npm run dev
```

Loyiha muvaffaqiyatli build bo'ldi ✅
