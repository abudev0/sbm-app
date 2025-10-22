"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  requestLoginOTP,
  verifyLoginOTP,
  requestSignupOTP,
  verifySignupOTP,
  type AuthUser,
} from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
};

type Step = "enter" | "otp";

// Faqat raqam + boshida bitta '+', E.164: 15 ta raqam
function sanitizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  return "+" + digits.slice(0, 15);
}

export default function AuthModal({ open, onClose, initialMode = "login" }: Props) {
  const t = useTranslations("AuthModal");
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<Step>("enter");
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("+998");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setStep("enter");
      setMode(initialMode);
      setPhone("+998");
      setFullName("");
      setCode("");
      setLoading(false);
    }
  }, [open, initialMode]);

  if (!open) return null;

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(sanitizePhone(e.target.value));
  };

  // '+' ni o‘chirib bo‘lmasin
  const onPhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const selectionStart = el.selectionStart ?? 0;
    const selectionEnd = el.selectionEnd ?? 0;

    if (
      (e.key === "Backspace" && selectionStart === 1 && selectionEnd === 1) ||
      (e.key === "Delete" && selectionStart === 0 && selectionEnd === 0)
    ) {
      e.preventDefault();
      return;
    }
    if (e.key === "+" && selectionStart !== 0) e.preventDefault();
  };

  const handleRequestCode = async () => {
    setLoading(true);
    try {
      if (mode === "login") {
        await requestLoginOTP(phone);
        setStep("otp");
        toast.success(t("codeSent", { default: "Kod yuborildi" }));
      } else {
        await requestSignupOTP(phone, fullName.trim());
        setStep("otp");
        toast.success(t("codeSent", { default: "Kod yuborildi" }));
      }
    } catch (e: any) {
      const msg = String(e?.message || "");

      // LOGIN: user topilmasa → SIGNUP’ga o‘tamiz
      if (mode === "login" && /not\s*found|exist[s]?\s*false|no\s*user/i.test(msg)) {
        setMode("signup");
        toast((t("switchToSignup", { default: "Akaunt topilmadi, ro‘yxatdan o‘ting." })) as any, { icon: "ℹ️" });
      }
      // SIGNUP: allaqachon mavjud → LOGIN’ga o‘tamiz va xohlasangiz shu yerning o‘zida OTP yuboramiz
      else if (mode === "signup" && /already|exist|registered/i.test(msg)) {
        setMode("login");
        toast((t("switchToLogin", { default: "Akaunt allaqachon mavjud. Kirishga o‘tkazildi." })) as any, { icon: "ℹ️" });
        try {
          // ixtiyoriy: darhol login OTP yuborish
          await requestLoginOTP(phone);
          setStep("otp");
          toast.success(t("codeSent", { default: "Kod yuborildi" }));
        } catch (err: any) {
          // agar OTP yuborish ham xato bersa, foydalanuvchi qayta bosishi mumkin
          toast.error(err?.message || t("errorOccurred", { default: "Xatolik yuz berdi. Qayta urinib ko‘ring." }));
        }
      } else {
        toast.error(msg || t("errorOccurred", { default: "Xatolik yuz berdi. Qayta urinib ko‘ring." }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      let data: AuthUser | undefined;
      if (mode === "login") {
        const resp = await verifyLoginOTP(phone, code);
        data = resp?.data as AuthUser;
      } else {
        const resp = await verifySignupOTP(phone, code, fullName.trim());
        data = resp?.data as AuthUser;
      }
      if (data?.accessToken && data?.id) {
        setUser({
          id: data.id,
          phone_number: data.phone_number,
          full_name: data.full_name,
          accessToken: data.accessToken,
        });
        toast.success(
          mode === "login"
            ? t("loginSuccess", { default: "Muvaffaqiyatli kirildi" })
            : t("signupSuccess", { default: "Ro‘yxatdan o‘tish muvaffaqiyatli" })
        );
        onClose();
      } else {
        toast.error(t("invalidResponse", { default: "Serverdan noto‘g‘ri javob. Qayta urinib ko‘ring." }));
      }
    } catch (e: any) {
      toast.error(e?.message || t("errorOccurred", { default: "Xatolik yuz berdi. Qayta urinib ko‘ring." }));
    } finally {
      setLoading(false);
    }
  };

  const requestDisabled = loading || (mode === "signup" && !fullName.trim());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-[92%] max-w-[420px] p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">
            {t("title", { default: "Kirish yoki Ro‘yxatdan o‘tish" })}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>

        {step === "enter" && (
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              pattern="^\\+\\d{0,15}$"
              value={phone}
              onChange={onPhoneChange}
              onKeyDown={onPhoneKeyDown}
              placeholder="+998"
              className="w-full border rounded-md px-3 py-2 text-sm"
              aria-label={t("phoneLabel", { default: "Telefon raqam" })}
            />

            {mode === "signup" && (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("fullNamePlaceholder", { default: "Ismingizni kiriting" })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-[12px] text-gray-600 hover:text-gray-800 underline"
              >
                {mode === "login"
                  ? null
                  : t("haveAccount", { default: "Akauntingiz bormi? Kirish" })}
              </button>

              <button
                type="button"
                onClick={handleRequestCode}
                disabled={requestDisabled}
                className="inline-flex items-center rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
              >
                {loading ? t("loading", { default: "Yuborilmoqda..." }) : t("requestCode", { default: "Kodini olish" })}
              </button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t("otpSent", { default: "Telefon raqamga OTP yuborildi" })}: <b>{phone}</b>
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="^\\d{0,6}$"
              value={code.replace(/[^\d]/g, "")}
              onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
              placeholder={t("otpPlaceholder", { default: "SMS kod" })}
              className="w-full border rounded-md px-3 py-2 text-sm"
              maxLength={6}
              aria-label={t("otpLabel", { default: "SMS kod" })}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("enter")}
                className="text-[12px] text-gray-600 hover:text-gray-800 underline"
              >
                {t("changePhone", { default: "Raqamni o‘zgartirish" })}
              </button>

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || code.replace(/[^\d]/g, "").length < 4}
                className="inline-flex items-center rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
              >
                {loading ? t("verifying", { default: "Tasdiqlanmoqda..." }) : t("verify", { default: "Tasdiqlash" })}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
