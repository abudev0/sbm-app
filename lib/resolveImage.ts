const CANDIDATE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

export function buildImageCandidates(id: string, apiBase: string) {
  // Agar allaqachon to‘liq URL bo‘lsa
  if (/^https?:\/\//i.test(id)) return [id];
  const base = apiBase.replace(/\/+$/, "");

  // 1) Maxsus dynamic endpoint (agar mavjud bo‘lsa)
  const candidates = [`${base}/api/product-image/${id}`];

  // 2) Fallback: uploads/<id>.<ext>
  for (const ext of CANDIDATE_EXTENSIONS) {
    candidates.push(`${base}/uploads/${id}${ext}`);
  }

  return candidates;
}

/**
 * Hech qaysi formatni tekshirib turmaymiz (SSR performance).
 * UI da birinchi candidate ni ishlatamiz – agar 404 bo‘lsa brauzer network’da ko‘rinasiz va
 * keyinchalik backendni moslashtirasiz.
 */
export function pickPrimaryImageFromId(id: string, apiBase: string) {
  return buildImageCandidates(id, apiBase)[0];
}

/**
 * Array normalizatsiyasi: ID lar / to‘liq URL lar aralash bo‘lishi mumkin
 */
export function normalizeRawImageArray(raw: unknown, apiBase: string): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map(r => {
        if (typeof r === "string") {
          return pickPrimaryImageFromId(r, apiBase);
        }
        if (r && typeof r === "object" && (r as any).img) {
          return pickPrimaryImageFromId((r as any).img, apiBase);
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return [pickPrimaryImageFromId(raw, apiBase)];
  }
  if (typeof raw === "object" && (raw as any).img) {
    return [pickPrimaryImageFromId((raw as any).img, apiBase)];
  }
  return [];
}