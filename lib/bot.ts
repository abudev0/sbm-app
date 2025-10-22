"use strict";
import { Bot, InlineKeyboard, Keyboard, Context, SessionFlavor, session } from "grammy";
import { webhookCallback } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const API_BASE = process.env.NEXT_PUBLIC_API_URL!; 
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

if (!BOT_TOKEN) throw new Error("BOT_TOKEN env o‘rnatilmagan");
if (!API_BASE) throw new Error("API_BASE_URL env o‘rnatilmagan");
if (!NEXT_PUBLIC_SITE_URL) throw new Error("NEXT_PUBLIC_SITE_URL env o‘rnatilmagan");

interface SessionData {
  phone?: string;
  action?: "login" | "signup";
  awaitingOtp?: boolean;
  awaitingFullName?: boolean;
  accessToken?: string;
  full_name?: string;
}
type MyContext = Context & SessionFlavor<SessionData>;

declare global {
  var __bot__: Bot<MyContext> | undefined;
}

const t = {
  uz: {
    greetings: (name: string) =>
      `👋 Assalomu alaykum, ${name}!\n\n` +
      `SBM Online do'koniga xush kelibsiz. Iltimos, telefon raqamingizni ulashing yoki /start orqali qayta urinib ko'ring.`,
    openApp: "🚀 SBM Onlayn do'konini ochish",
    sharePhone: "📲 Telefonni ulashish",
    requestFullName: "Ismingizni kiriting (Familiya bilan):",
    enterOtp: "SMS orqali kelgan 4 xonali kodni kiriting:",
    help:
      "ℹ️ Bu bot orqali siz SBM Online do'konini ochishingiz va telefon orqali login qilishingiz mumkin. /start bilan qaytadan boshlang.",
    otpSent: "✅ Kod yuborildi. Iltimos, SMS orqali kelgan kodni shu yerga kiriting.",
    notRegistered: "🔔 Ushbu raqam ro'yxatdan o'tgan emas. Ro'yxatdan o'tish avtomatik amalga oshiriladi.",
    loginSuccess: "✅ Tizimga muvaffaqiyatli kirdingiz! Endi quyidagi tugma orqali do'konni ochishingiz mumkin.",
    signupSuccess: "✅ Ro'yxatdan o'tish jarayoni boshlandi! SMS-kod yuborildi, iltimos kodni kiriting.",
    invalidOtp: "❌ Kod noto'g'ri yoki muddati o'tgan. /start bilan qayta urinib ko'ring.",
  },
} as const;

// create webapp keyboard; if token and id provided, append as query params
function openAppInlineKeyboard(token?: string, userId?: string) {
  const label = t.uz.openApp;
  const baseUrl = NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  
  if (token) {
    const params = new URLSearchParams();
    params.set("t", token);
    if (userId) params.set("uid", userId);
    const url = `${baseUrl}?${params.toString()}`;
    return new InlineKeyboard().webApp(label, url);
  }
  
  return new InlineKeyboard().webApp(label, baseUrl);
}

function requestContactKeyboard() {
  return new Keyboard().requestContact(t.uz.sharePhone).oneTime().resized();
}

function createBot() {
  const bot = new Bot<MyContext>(BOT_TOKEN);

  bot.use(
    session<SessionData, MyContext>({
      initial: () => ({}),
    })
  );

  bot.api.setMyCommands([
    { command: "start", description: "Boshlash" },
    { command: "help", description: "Yordam" },
  ]);

  bot.command("start", async (ctx) => {
    const name = ctx.from?.first_name ?? "";
    if (ctx.session.accessToken) {
      // if session already has accessToken we can send webapp button directly
      await ctx.reply(t.uz.greetings(name), {
        reply_markup: openAppInlineKeyboard(),
      });
      return;
    }
    await ctx.reply(t.uz.greetings(name));
    await ctx.reply("Telefon raqamingizni ulashish uchun:", {
      reply_markup: requestContactKeyboard(),
    });
    ctx.session.action = undefined;
    ctx.session.awaitingOtp = false;
    ctx.session.awaitingFullName = false;
    ctx.session.full_name = undefined;
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(t.uz.help);
  });

  // handle incoming contact (user pressed 'share phone')
  bot.on("message:contact", async (ctx) => {
    const contact = ctx.message.contact;
    if (!contact || !contact.phone_number) {
      return ctx.reply("Telefon raqami topilmadi. Iltimos qayta yuboring.");
    }
    const phone = contact.phone_number;
    ctx.session.phone = phone;

    try {
      const res = await fetch(`${API_BASE}/api/user-auth/login-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
        credentials: "include",
      });

      if (res.ok) {
        ctx.session.action = "login";
        ctx.session.awaitingOtp = true;
        await ctx.reply(t.uz.otpSent);
        return;
      }

      // if user not found -> create signup automatically using Telegram names (do not ask user)
      if (res.status === 404) {
        // Build full_name from Telegram profile (first_name + last_name if available)
        const first = ctx.from?.first_name?.trim();
        const last = ctx.from?.last_name?.trim();
        const fullNameFromTelegram = [first, last].filter(Boolean).join(" ") || undefined;

        // Save chosen name in session so we can pass it later to verify-signup if needed
        ctx.session.action = "signup";
        ctx.session.awaitingOtp = false;
        ctx.session.awaitingFullName = false;
        ctx.session.full_name = fullNameFromTelegram;

        // Attempt signup immediately, using Telegram name if available (do not prompt user)
        try {
          const signupBody: any = { phone_number: phone };
          if (fullNameFromTelegram) signupBody.full_name = fullNameFromTelegram;

          const signupRes = await fetch(`${API_BASE}/api/user-auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signupBody),
            credentials: "include",
          });

          if (signupRes.ok) {
            ctx.session.awaitingOtp = true;
            await ctx.reply(t.uz.otpSent);
            return;
          } else {
            // If signup failed for some reason, fall back to asking for full name
            ctx.session.awaitingFullName = true;
            await ctx.reply(t.uz.notRegistered);
            return;
          }
        } catch (err) {
          console.error("signup request error (auto):", err);
          // fallback: ask for name if auto-signup request fails
          ctx.session.awaitingFullName = true;
          await ctx.reply(t.uz.notRegistered);
          return;
        }
      }

      const errText = await res.text().catch(() => "");
      console.error("login-request error:", res.status, errText);
      await ctx.reply("Xatolik yuz berdi, iltimos keyinroq urinib ko'ring.");
    } catch (err) {
      console.error("Request error login-request:", err);
      await ctx.reply("Tarmoq xatosi, iltimos keyinroq urinib ko'ring.");
    }
  });

  // handle text messages: full name for signup (fallback), OTP for verify, fallback
  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text?.trim();
    if (!text) return;

    // If awaiting full name (fallback when auto-signup wasn't possible)
    if (ctx.session.awaitingFullName && ctx.session.action === "signup" && ctx.session.phone) {
      const full_name = text;
      const phone = ctx.session.phone;
      ctx.session.full_name = full_name;
      try {
        const res = await fetch(`${API_BASE}/api/user-auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: phone, full_name }),
          credentials: "include",
        });
        if (res.ok) {
          ctx.session.awaitingFullName = false;
          ctx.session.awaitingOtp = true;
          await ctx.reply(t.uz.otpSent);
          return;
        }
        const body = await res.json().catch(() => ({}));
        console.error("signup error", res.status, body);
        await ctx.reply("Ro'yxatdan o'tishda xatolik. Iltimos qaytadan urinib ko'ring.");
        return;
      } catch (err) {
        console.error("signup request error", err);
        await ctx.reply("Tarmoq xatosi, iltimos keyinroq urinib ko'ring.");
        return;
      }
    }

    // If awaiting OTP
    if (ctx.session.awaitingOtp && ctx.session.phone) {
      const code = text;
      const phone = ctx.session.phone;
      try {
        if (ctx.session.action === "login") {
          const res = await fetch(`${API_BASE}/api/user-auth/verify-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone_number: phone, code }),
            credentials: "include",
          });
          if (res.ok) {
            const body = await res.json().catch(() => ({}));
            const accessToken = body?.data?.access_token || body?.data?.accessToken;
            const userId = body?.data?.id;
            
            if (accessToken) {
              // store in bot session for bot-side operations
              ctx.session.accessToken = accessToken;

              // send webapp button with token and user ID
              await ctx.reply(t.uz.loginSuccess, {
                reply_markup: openAppInlineKeyboard(accessToken, userId),
              });
              ctx.session.awaitingOtp = false;
              return;
            }
            // fallback: no access token returned — send plain button
            await ctx.reply(t.uz.loginSuccess, { reply_markup: openAppInlineKeyboard() });
            ctx.session.awaitingOtp = false;
            return;
          } else {
            await ctx.reply(t.uz.invalidOtp);
            return;
          }
        } else if (ctx.session.action === "signup") {
          // Use full_name stored in session if present; backend may not require it for verify
          const payload: any = { phone_number: phone, code };
          if (ctx.session.full_name) payload.full_name = ctx.session.full_name;

          const res = await fetch(`${API_BASE}/api/user-auth/verify-signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          });
          if (res.ok) {
            const body = await res.json().catch(() => ({}));
            const accessToken = body?.data?.access_token || body?.data?.accessToken;
            const userId = body?.data?.id;
            
            if (accessToken) {
              ctx.session.accessToken = accessToken;
              await ctx.reply(t.uz.signupSuccess, {
                reply_markup: openAppInlineKeyboard(accessToken, userId),
              });
              ctx.session.awaitingOtp = false;
              ctx.session.awaitingFullName = false;
              ctx.session.full_name = undefined;
              return;
            }
            await ctx.reply(t.uz.signupSuccess, { reply_markup: openAppInlineKeyboard() });
            ctx.session.awaitingOtp = false;
            ctx.session.awaitingFullName = false;
            ctx.session.full_name = undefined;
            return;
          } else {
            await ctx.reply(t.uz.invalidOtp);
            return;
          }
        }
      } catch (err) {
        console.error("verify error", err);
        await ctx.reply("Xatolik yuz berdi, iltimos qayta urinib ko'ring.");
        return;
      }
    }

    // default fallback
    await ctx.reply("Xabar qabul qilindi. Agar tizimga kirish uchun raqam yuborilmagan bo'lsa /start bosing yoki telefonni ulashing.");
  });

  bot.catch((err) => {
    console.error("Bot error:", err.error ?? err);
  });

  return bot;
}

export const bot = global.__bot__ ?? createBot();
if (process.env.NODE_ENV !== "production") global.__bot__ = bot;

export const handleUpdate = webhookCallback(bot, "std/http");