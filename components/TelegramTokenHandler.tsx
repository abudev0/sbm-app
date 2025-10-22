"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { storeAccessToken, getProfile as apiGetProfile } from "@/lib/api/auth";
import { setClientAuthToken } from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth-store";

export default function TelegramTokenHandler() {
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setUser = useAuthStore.getState().setUser;

  console.log(searchParams.get('t'));

  async function handleToken () {
    const token = searchParams?.get("t");
    const userId = searchParams?.get("uid");
    
    if (!token) return;

    (async () => {
      try {
        // Tokenni saqlash va darhol axios'ga ulash
        storeAccessToken(token);
        setClientAuthToken(token);

        const profileRes = await apiGetProfile();
        if (profileRes?.data) {
          const u = profileRes.data as any;
          setUser({
            id: u.id || userId,
            phone_number: u.phone_number,
            full_name: u.full_name,
            accessToken: token,
          });
          console.log("[TelegramTokenHandler] profile loaded, user:", u.id || userId);
        } else {
          console.warn("[TelegramTokenHandler] profile empty", profileRes);
        }
      } catch (err) {
        console.warn("[TelegramTokenHandler] getProfile failed", err);
      } finally {
        // URL dan t va uid ni olib tashlash
        const next = new URLSearchParams(searchParams?.toString() ?? "");
        next.delete("t");
        next.delete("uid");
        const cleaned = pathname + (next.toString() ? `?${next.toString()}` : "");
        router.replace(cleaned);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };
  handleToken()

  return null;
}