// lib/unsplash.ts

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!

export interface UnsplashPhoto {
  id: string
  url: string        // regular — для десктопа
  urlMobile: string  // small — для мобильного
  thumb: string      // tiny — для превью
  alt: string
  author: string
  authorUrl: string
}

// ─── Оптимизация URL Unsplash ────────────────────────────
// Unsplash поддерживает параметры изменения размера прямо в URL
function optimizeUrl(baseUrl: string, width: number, quality = 75): string {
  const url = new URL(baseUrl)
  url.searchParams.set("w", String(width))
  url.searchParams.set("q", String(quality))
  url.searchParams.set("fm", "webp") // WebP — меньше размер
  url.searchParams.set("fit", "crop")
  url.searchParams.set("auto", "format")
  return url.toString()
}

// Поиск фото по запросу
export async function searchPhoto(query: string): Promise<UnsplashPhoto | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        // Кешируем на 1 час — одинаковые запросы не будут повторяться
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.results?.length) return null

    const idx = Math.floor(Math.random() * Math.min(5, data.results.length))
    const photo = data.results[idx]
    const baseUrl = photo.urls.raw || photo.urls.regular

    return {
      id: photo.id,
      // Десктоп: 800px WebP
      url: optimizeUrl(baseUrl, 800, 80),
      // Мобильный: 400px WebP
      urlMobile: optimizeUrl(baseUrl, 400, 75),
      // Превью: 200px WebP для lazy loading placeholder
      thumb: optimizeUrl(baseUrl, 200, 60),
      alt: photo.alt_description || query,
      author: photo.user.name,
      authorUrl: photo.user.links.html,
    }
  } catch (e) {
    console.error('Unsplash error:', e)
    return null
  }
}

// ─── Поиск фото для образов ──────────────────────────────
export async function getOutfitPhoto(
  occasion: string,
  colorType: string,
  gender: "male" | "female" = "female"
): Promise<UnsplashPhoto | null> {
  const femaleQueries: Record<string, string> = {
    work: `elegant office woman fashion ${colorType} style`,
    date: `romantic feminine dress fashion style`,
    walk: `casual chic street style woman fashion`,
    event: `elegant evening fashion woman style`,
  }
  const maleQueries: Record<string, string> = {
    work: `elegant office man suit fashion style`,
    date: `stylish man casual fashion date night`,
    walk: `casual street style man fashion`,
    event: `elegant man evening fashion suit`,
  }
  const queries = gender === "male" ? maleQueries : femaleQueries
  const query = queries[occasion] || `${gender === "male" ? "man" : "woman"} fashion ${occasion} style`
  return searchPhoto(query)
}

// ─── Поиск фото для вещи ─────────────────────────────────
export async function getClothingPhoto(
  itemName: string,
  gender: "male" | "female" = "female"
): Promise<UnsplashPhoto | null> {
  const genderWord = gender === "male" ? "mens" : "womens"
  return searchPhoto(`${genderWord} ${itemName} fashion clothing editorial`)
}

// ─── Поиск фото для визуального гардероба ────────────────
export async function getWardrobeItemPhoto(
  itemName: string,
  gender: "male" | "female" = "female"
): Promise<UnsplashPhoto | null> {
  const genderWord = gender === "male" ? "men" : "women"
  return searchPhoto(`${genderWord} ${itemName} fashion style minimal`)
}
