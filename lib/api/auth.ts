import { setCookie, getCookie, removeCookie, COOKIE_KEYS } from "@/lib/cookies";

// helper API client: small, robust version
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

type Resp<T = any> = { message?: string; status_code?: number; data?: T };

export type AuthUser = {
  id: string;
  phone_number: string;
  full_name?: string;
  accessToken: string;
};

export function storeAccessToken(token?: string) {
  if (token) {
    setCookie(COOKIE_KEYS.ACCESS_TOKEN, token, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
}

export function getAccessToken(cookieHeader?: string): string | null {
  return getCookie(COOKIE_KEYS.ACCESS_TOKEN, cookieHeader);
}

export function clearAccessToken() {
  removeCookie(COOKIE_KEYS.ACCESS_TOKEN);
}



/* Existing endpoints (login-request, verify-login, signup, verify-signup) keep as needed */

async function fetchJson(url: string, opts: RequestInit = {}, cookieHeader?: string) {
  const token = getAccessToken(cookieHeader);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    ...opts,
    headers,
    credentials: "include",
  });
  
  const text = await res.text().catch(() => "");
  
  const json = (() => {
    try {      
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  })();

  if (!res.ok) {
    const msg = json?.message || text || `Request failed: ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = json;
    throw err;
  }  
  return json as Resp;
}

/* Login functions */
export async function requestLoginOTP(phone_number: string) {
  return fetchJson("/api/user-auth/login-request", {
    method: "POST",
    body: JSON.stringify({ phone_number }),
  });
}

export async function verifyLoginOTP(phone_number: string, code: string) {
  const res = await fetchJson("/api/user-auth/verify-login", {
    method: "POST",
    body: JSON.stringify({ phone_number, code }),
  });
  
  const accessToken = res.data?.access_token || res.data?.accessToken;
  if (accessToken) {
    storeAccessToken(accessToken);
  }
  
  return res;
}

/* Signup functions */
export async function requestSignupOTP(phone_number: string, full_name?: string) {
  return fetchJson("/api/user-auth/signup", {
    method: "POST",
    body: JSON.stringify({ phone_number, full_name }),
  });
}

export async function verifySignupOTP(phone_number: string, code: string, full_name?: string) {
  const payload: any = { phone_number, code };
  if (full_name) payload.full_name = full_name;
  
  const res = await fetchJson("/api/user-auth/verify-signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  const accessToken = res.data?.access_token || res.data?.accessToken;
  if (accessToken) {
    storeAccessToken(accessToken);
  }
  
  return res;
}

/* Profile */
export async function getProfile() {
  return fetchJson("/api/user/me", { method: "GET" });
}

/* export other functions if you have them... */
export async function signOut(userId: string) {
  const res = await fetchJson("/api/user-auth/signout", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  clearAccessToken();
  return res;
}