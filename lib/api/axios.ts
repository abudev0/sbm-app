import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { buildServerBase, buildClientBase } from "../config/env";
import { getCookie, COOKIE_KEYS } from "@/lib/cookies";

// --- Helperlar
function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return getCookie(COOKIE_KEYS.ACCESS_TOKEN);
}

// Client tarafda tokenni darhol qo'shish uchun (masalan, token qabul qilingandan keyin)
export function setClientAuthToken(token?: string | null) {
  const val = token ?? getClientToken();
  if (val) {
    clientAxios.defaults.headers.common.Authorization = `Bearer ${val}`;
  } else {
    delete clientAxios.defaults.headers.common.Authorization;
  }
  // keep global fetch wrapper in sync (it reads localStorage directly, but ensure axios default is consistent)
}

// Agar server tarafda cookie yoki boshqa manbadan token olsangiz,
// shu funksiya orqali serverAxios ga qo'shishingiz mumkin.
export function setServerAuthToken(token?: string | null) {
  if (token) {
    serverAxios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete serverAxios.defaults.headers.common.Authorization;
  }
}

// --- Instances
export const serverAxios = axios.create({
  baseURL: buildServerBase(),
  timeout: 10000,
  headers: { Accept: "application/json" },
});

export const clientAxios = axios.create({
  baseURL: buildClientBase(),
  timeout: 10000,
  headers: { Accept: "application/json" },
});

// --- Interceptorlar
function attachCommon(instance: AxiosInstance, name: "server" | "client") {
  // Request: clientda cookie'dan tokenni avtomatik qo'shamiz
  if (name === "client") {
    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // Agar Authorization hali qo'yilmagan bo'lsa, cookie'dan qo'shish
      if (!config.headers?.Authorization) {
        const token = getClientToken();
        if (token) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });
  }

  // Response error: to'liq URL va methodni log qilamiz
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err?.response?.status;
      const method = err?.config?.method?.toUpperCase?.() || "";
      const baseURL = err?.config?.baseURL || "";
      const url = err?.config?.url || "";
      const fullUrl = baseURL && url ? new URL(url, baseURL).toString() : `${baseURL}${url}`;
      // Masalan: [API ERROR][client] 404 GET https://api.example.com/category/grid
      console.error(`[API ERROR][${name}]`, status, method, fullUrl);
      return Promise.reject(err);
    }
  );
}

attachCommon(serverAxios, "server");
attachCommon(clientAxios, "client");

// === Global fetch wrapper (client only) ===
// Wrap window.fetch to automatically attach Authorization header for API calls
if (typeof window !== "undefined") {
  try {
    const globalAny: any = window as any;
    if (!globalAny.__fetch_wrapped__) {
      const originalFetch = globalAny.fetch.bind(globalAny);
      globalAny.__orig_fetch__ = originalFetch;
      globalAny.fetch = async function (input: RequestInfo, init?: RequestInit) {
        try {
          const token = getCookie(COOKIE_KEYS.ACCESS_TOKEN);
          // determine url string
          const urlStr =
            typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
          const base = clientAxios.defaults.baseURL || "";
          let isApiCall = false;
          try {
            if (base && urlStr.startsWith(base)) isApiCall = true;
            else if (urlStr.startsWith("/api")) isApiCall = true;
            else {
              // also handle absolute URLs from same API origin
              if (base) {
                const baseOrigin = new URL(base, window.location.origin).origin;
                if (urlStr.startsWith(baseOrigin) || urlStr.includes(baseOrigin)) isApiCall = true;
              }
            }
          } catch {
            // ignore URL parse errors
          }

          if (token && isApiCall) {
            const headers = new Headers((init && init.headers) as HeadersInit | undefined);
            if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
            // ensure content-type default if not set for JSON-like requests
            if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
            const newInit = { ...(init || {}), headers };
            return originalFetch(input, newInit);
          }
        } catch (e) {
          // ignore wrapper errors and fallback to original fetch
          // eslint-disable-next-line no-console
          console.warn("[fetch-wrapper] failed to attach auth", e);
        }
        return originalFetch(input, init);
      };
      globalAny.__fetch_wrapped__ = true;
    }
  } catch (e) {
    // ignore errors
  }
}

// Diagnostika: ishga tushganda baseURL larni bir marta chiqarib qo'yish
if (typeof window !== "undefined") {
  // Clientda
  // eslint-disable-next-line no-console
  console.log("[axios] client baseURL =", clientAxios.defaults.baseURL);
} else {
  // Serverda
  // eslint-disable-next-line no-console
  console.log("[axios] server baseURL =", serverAxios.defaults.baseURL);
}