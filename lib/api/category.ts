import { serverAxios } from "./axios";

export interface HeroCategory {
  id: string;
  title: string;
  img: string;
  span?: string;
  color?: string;
}

function is404(e: any) {
  return e?.response?.status === 404;
}

export async function getHeroCategories(
  lang: "uz" | "ru"
): Promise<HeroCategory[]> {
  const tried: string[] = [];

  async function tryGet(url: string) {
    tried.push(url);
    return serverAxios.get<HeroCategory[]>(url, { params: { lang } });
  }

  try {
    const { data } = await tryGet("/category/grid");
    
    return data;
  } catch (e1) {
    try {
      const { data } = await tryGet("/api/category/grid");
      return data;
    } catch (e2) {
      try {
        const { data } = await tryGet("/categories/grid");
        return data;
      } catch (e3) {
        throw decorate(e3, tried);
      }
    }
  }
}

function decorate(err: any, tried: string[]) {
  const note = `Hero categories fetch failed. Tried endpoints: ${tried.join(
    ", "
  )}`;
  err.message = `${err?.message ?? "Request failed"} :: ${note}`;
  return err;
}