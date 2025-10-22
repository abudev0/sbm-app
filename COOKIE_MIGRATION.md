# localStorage → Cookie Migration Guide

## Nima uchun Cookie?

Next.js loyihalarimizda SSR (Server-Side Rendering) va SSG (Static Site Generation) ko'p ishlatiladi. localStorage faqat client-side ishlaydi va server tomonida mavjud emas. Cookie'lar esa server va client tomonlarda ishlaydi.

### Afzalliklari:

1. **SSR/SSG Qo'llab-quvvatlash**
   - Server tomonda user ma'lumotlarini olish mumkin
   - Initial render'da to'liq ma'lumotlar bilan sahifa qaytarish

2. **Xavfsizlik**
   - `httpOnly` flag bilan XSS hujumlaridan himoya
   - `secure` flag HTTPS orqali uzatish
   - `sameSite` flag CSRF hujumlaridan himoya

3. **Middleware Integratsiyasi**
   - Next.js middleware'da authentication tekshirish
   - Protected route'larni boshqarish

4. **SEO va Performance**
   - Server-side'da ma'lumotlar tayyor
   - Hydration muammolari yo'q
   - CLS (Cumulative Layout Shift) kamayadi

## O'zgarishlar

### 1. Authentication Token

**Old (localStorage):**
```typescript
localStorage.setItem("accessToken", token);
const token = localStorage.getItem("accessToken");
localStorage.removeItem("accessToken");
```

**Yangi (cookie):**
```typescript
import { setCookie, getCookie, removeCookie, COOKIE_KEYS } from "@/lib/cookies";

setCookie(COOKIE_KEYS.ACCESS_TOKEN, token, {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secure: true,
  sameSite: "lax",
});

const token = getCookie(COOKIE_KEYS.ACCESS_TOKEN);
removeCookie(COOKIE_KEYS.ACCESS_TOKEN);
```

### 2. Cart Data

**Old (localStorage):**
```typescript
const cart = JSON.parse(localStorage.getItem("cart:v1") || "[]");
localStorage.setItem("cart:v1", JSON.stringify(items));
```

**Yangi (cookie):**
```typescript
import { getCookieJSON, setCookieJSON, COOKIE_KEYS } from "@/lib/cookies";

const cart = getCookieJSON<CartItem[]>(COOKIE_KEYS.CART) || [];
setCookieJSON(COOKIE_KEYS.CART, items, {
  maxAge: 60 * 60 * 24 * 30, // 30 days
});
```

### 3. Favorites

**Old (localStorage):**
```typescript
const favorites = JSON.parse(localStorage.getItem("favorites:v1") || "[]");
localStorage.setItem("favorites:v1", JSON.stringify(items));
```

**Yangi (cookie):**
```typescript
import { getCookieJSON, setCookieJSON, COOKIE_KEYS } from "@/lib/cookies";

const favorites = getCookieJSON<FavoriteItem[]>(COOKIE_KEYS.FAVORITES) || [];
setCookieJSON(COOKIE_KEYS.FAVORITES, items, {
  maxAge: 60 * 60 * 24 * 30, // 30 days
});
```

### 4. Language Preference

**Old (localStorage):**
```typescript
localStorage.setItem("language", "uz");
const lang = localStorage.getItem("language");
```

**Yangi (cookie):**
```typescript
import { setCookie, getCookie, COOKIE_KEYS } from "@/lib/cookies";

setCookie(COOKIE_KEYS.LANGUAGE, "uz", {
  maxAge: 60 * 60 * 24 * 365, // 1 year
});
const lang = getCookie(COOKIE_KEYS.LANGUAGE);
```

## Server-Side Usage

### Next.js API Route'da:

```typescript
import { cookies } from 'next/headers';
import { getCookie, COOKIE_KEYS } from '@/lib/cookies';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  
  // yoki
  const cookieHeader = request.headers.get('cookie');
  const token2 = getCookie(COOKIE_KEYS.ACCESS_TOKEN, cookieHeader);
  
  // Use token for API calls
}
```

### Next.js Server Component'da:

```typescript
import { cookies } from 'next/headers';
import { COOKIE_KEYS } from '@/lib/cookies';

export default async function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_KEYS.ACCESS_TOKEN)?.value;
  const cart = JSON.parse(cookieStore.get(COOKIE_KEYS.CART)?.value || '[]');
  
  // Server-side render with data
  return <CartComponent items={cart} />;
}
```

### Middleware'da:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie, COOKIE_KEYS } from '@/lib/cookies';

export function middleware(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getCookie(COOKIE_KEYS.ACCESS_TOKEN, cookieHeader);
  
  if (!token && request.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

## Cookie Limitations

Cookie'lar maksimal 4KB hajmga ega. Agar ma'lumot hajmi katta bo'lsa:

1. **Kichik ma'lumotlar** (token, language) → Cookie
2. **O'rtacha ma'lumotlar** (cart, favorites) → Cookie (compressed)
3. **Katta ma'lumotlar** (images, files) → Server DB yoki IndexedDB

## Migration Checklist

- [x] `lib/cookies.ts` helper yaratildi
- [x] `lib/api/auth.ts` - cookie'ga o'tkazildi
- [x] `lib/api/axios.ts` - cookie'dan token oladi
- [x] `lib/cart.ts` - cookie'ga o'tkazildi
- [x] `lib/favorites.ts` - cookie'ga o'tkazildi
- [x] `lib/api/orders.ts` - cookie'ga o'tkazildi
- [x] `components/header.tsx` - cookie'ga o'tkazildi
- [x] `components/locale-initializer.tsx` - cookie'ga o'tkazildi
- [x] `components/checkout/success-page.tsx` - cookie'ga o'tkazildi

## Testing

```bash
# Build va test
npm run build
npm run dev

# Cookie'larni tekshirish (Chrome DevTools)
# Application → Cookies → http://localhost:3000
# Quyidagi cookie'lar ko'rinishi kerak:
# - accessToken
# - language
# - cart
# - favorites
```

## Next Steps

1. **Middleware Authentication** qo'shish
2. **Server Components** da cookie'lardan foydalanish
3. **httpOnly** cookie'lar uchun backend tayyorlash
4. **Cookie encryption** qo'shish (agar kerak bo'lsa)

## Xavfsizlik Recommendations

1. **Sensitive Data** (token) → `httpOnly: true` (backend orqali set qilish)
2. **Production** → `secure: true` (faqat HTTPS)
3. **CSRF Protection** → `sameSite: 'lax'` yoki `'strict'`
4. **Expiration** → `maxAge` to'g'ri sozlash
5. **Domain** → Production'da `domain` parametrini to'g'ri sozlash

```typescript
// Backend'da httpOnly cookie set qilish (ideal)
res.setHeader('Set-Cookie', `accessToken=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000; Path=/`);
```
