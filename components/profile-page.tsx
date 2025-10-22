"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  User as UserIcon,
  Package as PackageIcon,
  Clock as ClockIcon,
  Instagram,
  Facebook,
  Send,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth-store";
import { getProfile as apiGetProfile } from "@/lib/api/auth";

/**
 * ProfilePage — auth modal and explicit "sign out" removed.
 * - WebApp relies on Telegram token / cookie for auth, so sign-out button is not shown.
 * - On mount: try to fetch profile and set store (for token-exchange flow).
 * - If not authenticated, we show clear instruction to login via Telegram bot.
 */

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (user) return; // already in store
      try {
        setLoadingProfile(true);
        const res = await apiGetProfile();
        console.log("res: ",res);
        
        if (!mounted) return;
        if (res) {
          const u = res as any;
          setUser({
            id: u.id,
            phone_number: u.phone_number,
            full_name: u.full_name,
            accessToken: u.accessToken ?? undefined,
          });
        }
      } catch (err) {
        console.debug("Could not auto-load profile:", (err as any)?.message || err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleOrders = () => {
    router.push("/orders");
  };

  const handlePayments = () => {
    router.push("/payments");
  };

  // display fallback logic
  const displayName = user?.full_name || user?.phone_number || user?.id || "";
  const avatarText = (() => {
    if (user?.full_name && user.full_name.length) return user.full_name.charAt(0).toUpperCase();
    if (user?.phone_number) {
      const digits = user.phone_number.replace(/\D/g, "");
      return digits.length >= 4 ? digits.slice(-4) : digits || "U";
    }
    if (user?.id) return String(user.id).slice(0, 2).toUpperCase();
    return "U";
  })();

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-transparent">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Orqaga"
          className="flex items-center gap-2 text-neutral-800"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Orqaga</span>
        </button>

        <h1 className="text-lg font-semibold text-neutral-900">Profil</h1>

        <button type="button" aria-hidden className="text-sm text-neutral-700">
          Ru
        </button>
      </header>

      <main className="px-4 pb-24">
        {/* Profile card */}
        <div className="mt-3 rounded-lg border border-neutral-300 bg-white/70 p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-neutral-800 border">
                {avatarText}
              </div>
            </div>

            <div className="flex-1">
              {isAuthenticated && (user || loadingProfile) ? (
                <>
                  <div className="text-lg font-semibold text-neutral-900 leading-tight">
                    {displayName || "—"}
                  </div>
                  {user?.phone_number ? (
                    <div className="text-sm text-neutral-700 mt-1">{user.phone_number}</div>
                  ) : null}
                </>
              ) : loadingProfile ? (
                <div>Yuklanmoqda...</div>
              ) : (
                <>
                  <div className="text-base font-medium text-neutral-900">Tizimga kiring</div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href="https://t.me/s_b_m_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-500 bg-amber-50 text-amber-700 text-sm"
                    >
                      @s_b_m_bot bilan kirish
                    </a>
                    <button
                      onClick={() => router.push("/")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm"
                    >
                      Bosh sahifa
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 space-y-3">
          <button
            onClick={handleOrders}
            className="w-full flex items-center gap-3 justify-between rounded-lg border border-neutral-300 bg-white px-4 py-3 text-left shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-amber-50 grid place-items-center text-amber-600">
                <PackageIcon className="w-4 h-4" />
              </div>
              <div className="text-base font-medium text-neutral-900">Buyurtmalarim</div>
            </div>
            <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={handlePayments}
            className="w-full flex items-center gap-3 justify-between rounded-lg border border-neutral-300 bg-white px-4 py-3 text-left shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-amber-50 grid place-items-center text-amber-600">
                <ClockIcon className="w-4 h-4" />
              </div>
              <div className="text-base font-medium text-neutral-900">To'lov tarixi</div>
            </div>
            <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="h-24" />
        <div className="border-t border-neutral-200 mb-4" />

        <div className="flex items-center justify-center gap-6 mb-6">
          <a href="#" aria-label="Instagram" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm">
            <Instagram className="w-6 h-6 text-pink-500" />
          </a>
          <a href="#" aria-label="Facebook" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm">
            <Facebook className="w-6 h-6 text-blue-600" />
          </a>
          <a href="#" aria-label="Telegram" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm">
            <Send className="w-6 h-6 text-sky-500" />
          </a>
        </div>

        <div className="text-center text-neutral-500 text-sm mb-6">@s_b_m_bot</div>
      </main>
    </>
  );
}