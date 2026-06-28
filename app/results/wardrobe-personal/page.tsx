"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, Loader2, Wand2, Image } from "lucide-react"
import Link from "next/link"
import { getWardrobeItemPhoto } from "@/lib/unsplash"
import { generateClothingImage } from "@/lib/pollinations"
import type { StylistResult } from "@/lib/stylist-data"

interface WardrobeItem {
  number: number
  name: string
  why: string
  colorHex: string
  colorName: string
  outfits: string[]
}

type ImageMode = "unsplash" | "stability"

// ─── Карточка вещи ───────────────────────────────────────
function WardrobeCard({ item, gender, mode }: {
  item: WardrobeItem
  gender: "male" | "female"
  mode: ImageMode
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoAuthor, setPhotoAuthor] = useState<string | null>(null)
  const [photoAuthorUrl, setPhotoAuthorUrl] = useState<string | null>(null)
  const [loadingPhoto, setLoadingPhoto] = useState(true)

  useEffect(() => {
    setLoadingPhoto(true)
    setPhotoUrl(null)

    if (mode === "stability") {
      generateClothingImage(item.name, item.colorName, gender).then((url) => {
        setPhotoUrl(url)
        setLoadingPhoto(false)
      })
    } else {
      getWardrobeItemPhoto(item.name, gender).then((p) => {
        if (p) {
          setPhotoUrl(p.url)
          setPhotoAuthor(p.author)
          setPhotoAuthorUrl(p.authorUrl)
        }
        setLoadingPhoto(false)
      })
    }
  }, [item.name, item.colorName, item.colorHex, gender, mode])

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Фото */}
        <div className="relative w-full overflow-hidden sm:w-2/5" style={{ minHeight: "220px" }}>
          {loadingPhoto ? (
            <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-2 bg-secondary">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              {mode === "stability" && (
                <span className="text-xs text-muted-foreground">Генерация AI...</span>
              )}
            </div>
          ) : photoUrl ? (
            <>
              <img src={photoUrl} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
              <div
                className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full font-serif text-sm font-semibold text-white shadow-md"
                style={{ backgroundColor: item.colorHex + "cc" }}
              >
                {item.number}
              </div>
              {mode === "stability" && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-0.5">
                  <Wand2 className="h-3 w-3 text-white" />
                  <span className="text-[9px] text-white">AI</span>
                </div>
              )}
              {mode === "unsplash" && photoAuthor && (
                <a
                  href={`${photoAuthorUrl}?utm_source=atelier&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white hover:bg-black/70"
                >
                  {photoAuthor}
                </a>
              )}
            </>
          ) : (
            <div
              className="flex h-full min-h-[220px] w-full items-center justify-center"
              style={{ background: `linear-gradient(145deg, ${item.colorHex}44, ${item.colorHex}88)` }}
            >
              <span className="text-4xl">{gender === "male" ? "👔" : "👗"}</span>
            </div>
          )}
        </div>

        {/* Текст */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-xl font-semibold leading-tight text-foreground">
                {item.name}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="h-4 w-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.colorHex }} />
                <span className="text-xs text-muted-foreground">{item.colorName}</span>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.why}</p>
          </div>
          <div className="mt-4 border-t border-border/60 pt-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-accent">Как носить</div>
            <ul className="space-y-1.5">
              {item.outfits.map((o, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <Check className="h-3 w-3 shrink-0 text-accent" />{o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Главная страница ────────────────────────────────────
export default function WardrobePersonalPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageMode, setImageMode] = useState<ImageMode>("unsplash")

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!result) return
    generateWardrobe(result)
  }, [result])

  async function generateWardrobe(result: StylistResult) {
    setLoading(true)
    setError(false)
    const isMale = result.gender === "male"

    try {
      const resp = await fetch("/api/wardrobe-personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      })
      const parsed = await resp.json()
      if (parsed.error) throw new Error(parsed.error)
      setItems(parsed.items || [])
    } catch {
      setError(true)
      const p = result.palette
      setItems(isMale ? [
        { number: 1, name: "Белая рубашка", why: "База для 15+ образов", colorHex: "#f8f8f8", colorName: "Белый", outfits: ["+ костюм = деловой", "+ джинсы = casual", "+ чиносы = smart casual"] },
        { number: 2, name: result.recommendedItems[1] || "Прямые брюки", why: "Универсальный низ", colorHex: p[1]?.hex || "#374151", colorName: p[1]?.name || "Графит", outfits: ["+ рубашка = офис", "+ свитер = casual", "+ пиджак = деловой"] },
        { number: 3, name: result.recommendedItems[0] || "Пиджак", why: "Трансформирует любой образ", colorHex: p[0]?.hex || "#1e3a5f", colorName: p[0]?.name || "Тёмно-синий", outfits: ["+ брюки = офис", "+ джинсы = smart casual", "+ чиносы = выход"] },
        { number: 4, name: "Тёмные джинсы", why: "Базовый низ для повседневных образов", colorHex: "#2a3f5f", colorName: "Тёмный деним", outfits: ["+ рубашка = casual", "+ свитер = прогулка", "+ пиджак = smart"] },
        { number: 5, name: "Кашемировый джемпер", why: "Тепло и стиль в одном", colorHex: p[3]?.hex || "#d9d3c7", colorName: p[3]?.name || "Беж", outfits: ["+ джинсы = прогулка", "+ брюки = офис", "+ рубашка = layering"] },
        { number: 6, name: "Чиносы", why: "Универсальны между джинсами и брюками", colorHex: p[2]?.hex || "#c8a882", colorName: p[2]?.name || "Кэмел", outfits: ["+ поло = casual", "+ рубашка = smart", "+ свитер = выходной"] },
        { number: 7, name: "Поло", why: "Элегантнее футболки", colorHex: p[4]?.hex || "#2f6b5b", colorName: p[4]?.name || "Зелёный", outfits: ["+ брюки = офис", "+ джинсы = casual", "+ чиносы = прогулка"] },
        { number: 8, name: "Тёмно-синий свитер", why: "Самый универсальный цвет мужского гардероба", colorHex: "#1e3a5f", colorName: "Тёмно-синий", outfits: ["поверх рубашки", "+ джинсы", "+ брюки"] },
        { number: 9, name: "Белые кеды", why: "Объединяют любой casual образ", colorHex: "#f5f5f5", colorName: "Белый", outfits: ["+ джинсы = прогулка", "+ чиносы = casual", "+ шорты = лето"] },
        { number: 10, name: "Тренч или пальто", why: "Верхняя одежда-трансформер", colorHex: p[1]?.hex || "#c8a882", colorName: p[1]?.name || "Кэмел", outfits: ["поверх любого образа"] },
        { number: 11, name: "Льняная рубашка", why: "Лёгкость для тёплого сезона", colorHex: "#e3cba8", colorName: "Тёплый беж", outfits: ["+ чиносы = город", "+ джинсы = casual", "+ навыпуск = свободно"] },
        { number: 12, name: "Бомбер или куртка", why: "Завершает casual образ", colorHex: p[0]?.hex || "#374151", colorName: p[0]?.name || "Антрацит", outfits: ["+ джинсы = streetwear", "+ чиносы = casual", "+ футболка = прогулка"] },
      ] : [
        { number: 1, name: "Белая рубашка", why: "База для 15+ образов", colorHex: "#f8f8f8", colorName: "Белый", outfits: ["+ брюки = офис", "+ джинсы = casual", "+ юбка = выход"] },
        { number: 2, name: result.recommendedItems[1] || "Прямые брюки", why: "Универсальный низ", colorHex: p[1]?.hex || "#c8a882", colorName: p[1]?.name || "Капучино", outfits: ["+ блуза = офис", "+ свитер = casual", "+ пиджак = деловой"] },
        { number: 3, name: result.recommendedItems[0] || "Блейзер", why: "Главный акцент гардероба", colorHex: p[0]?.hex || "#e8c4b8", colorName: p[0]?.name || "Пудра", outfits: ["+ брюки = офис", "+ джинсы = smart casual", "+ платье = вечер"] },
        { number: 4, name: result.recommendedItems[2] || "Платье миди", why: "Самостоятельный образ", colorHex: p[0]?.hex || "#c4b5d4", colorName: p[0]?.name || "Лаванда", outfits: ["само по себе = свидание", "+ пиджак = работа", "+ кеды = прогулка"] },
        { number: 5, name: "Кашемировый джемпер", why: "Тепло и стиль", colorHex: p[3]?.hex || "#f4ede4", colorName: p[3]?.name || "Молочный", outfits: ["+ джинсы = casual", "+ брюки = офис", "+ юбка = женственно"] },
        { number: 6, name: result.recommendedItems[4] || "Широкие джинсы", why: "Основа повседневных образов", colorHex: p[2]?.hex || "#d4c5a9", colorName: p[2]?.name || "Беж", outfits: ["+ блуза = casual", "+ свитер = прогулка", "+ топ = выходной"] },
        { number: 7, name: "Топ в тонах палитры", why: "Базовый верх под всё", colorHex: p[4]?.hex || "#c9908a", colorName: p[4]?.name || "Роза", outfits: ["+ брюки = офис", "+ джинсы = casual", "+ юбка = выход"] },
        { number: 8, name: "Шарф или платок", why: "Лёгкий акцент образа", colorHex: p[2]?.hex || "#8fa8bc", colorName: p[2]?.name || "Серо-голубой", outfits: ["на шею", "на сумку", "как повязка"] },
        { number: 9, name: "Брюки wide-leg", why: "Нарядный вариант", colorHex: p[3]?.hex || "#f4ede4", colorName: p[3]?.name || "Молочный", outfits: ["+ блейзер = мероприятие", "+ блуза = ужин", "+ топ = вечер"] },
        { number: 10, name: "Тренч или пальто", why: "Верхняя одежда-трансформер", colorHex: p[1]?.hex || "#c8a882", colorName: p[1]?.name || "Бежевый", outfits: ["поверх любого образа"] },
        { number: 11, name: "Шёлковая блуза", why: "Для офиса и выхода", colorHex: p[3]?.hex || "#f4ede4", colorName: p[3]?.name || "Нюд", outfits: ["+ брюки = офис", "+ юбка = романтик", "+ джинсы = casual chic"] },
        { number: 12, name: "Трикотажное платье", why: "Базовая вещь для отдыха", colorHex: p[0]?.hex || "#e8c4b8", colorName: p[0]?.name || "Пудра", outfits: ["+ кеды = прогулка", "+ ботинки = casual", "+ каблуки = выход"] },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!result) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Данные не найдены.</p>
        <Link href="/?step=3" className="mt-4 inline-block text-accent underline">К результатам</Link>
      </div>
    </div>
  )

  const isMale = result.gender === "male"
  const gender = result.gender ?? "female"

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/?step=3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />Назад
          </Link>
          <span className="font-serif text-xl tracking-wide">ATELIER</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 299 ₽/мес</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Мой гардероб</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            12 базовых вещей капсульного {isMale ? "мужского" : "женского"} гардероба,
            подобранных AI под ваш цветотип <strong>{result.colorType}</strong>.
          </p>
        </div>

        {/* Палитра */}
        <div className="mb-4 rounded-2xl border border-border/80 bg-card/95 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Ваша капсульная палитра</div>
          <div className="flex gap-3">
            {result.palette.map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="aspect-square w-full rounded-xl border border-border" style={{ backgroundColor: c.hex }} />
                <span className="text-center text-[10px] text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Переключатель источника фото */}
        {!loading && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Фотографии:</span>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button
                onClick={() => setImageMode("unsplash")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "unsplash" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}
              >
                <Image className="h-3 w-3" />
                Unsplash
              </button>
              <button
                onClick={() => setImageMode("stability")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "stability" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}
              >
                <Wand2 className="h-3 w-3" />
                AI-генерация
              </button>
            </div>
            {imageMode === "stability" && (
              <span className="text-xs text-muted-foreground italic">~30 сек на фото</span>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Claude составляет персональный гардероб...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center text-xs text-muted-foreground">
                Не удалось загрузить персональные рекомендации.
              </div>
            )}
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <WardrobeCard key={`${item.number}-${imageMode}`} item={item} gender={gender} mode={imageMode} />
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/5 p-5 text-center">
              <p className="text-sm font-medium text-foreground">12 вещей = 40+ образов</p>
              <p className="mt-1 text-xs text-muted-foreground">Все предметы сочетаются между собой и покрывают любой повод</p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
