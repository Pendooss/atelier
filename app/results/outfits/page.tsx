"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Loader2, Wand2, Image } from "lucide-react"
import Link from "next/link"
import { getOutfitPhoto } from "@/lib/unsplash"
import { generateOutfitImage } from "@/lib/pollinations"
import type { StylistResult } from "@/lib/stylist-data"

type ImageMode = "unsplash" | "stability"

interface OutfitItem { name: string; detail: string; color: string }
interface Outfit {
  id: string
  occasion: string
  title: string
  mood: string
  items: OutfitItem[]
}

function OutfitCard({ outfit, colorType, gender, mode }: {
  outfit: Outfit
  colorType: string
  gender: "male" | "female"
  mode: ImageMode
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoAuthor, setPhotoAuthor] = useState<string | null>(null)
  const [photoAuthorUrl, setPhotoAuthorUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setPhotoUrl(null)
    if (mode === "stability") {
      const itemNames = outfit.items.map(i => i.name)
      generateOutfitImage(outfit.occasion, colorType, gender, itemNames).then((url) => {
        setPhotoUrl(url)
        setLoading(false)
      })
    } else {
      getOutfitPhoto(outfit.id, colorType, gender).then((p) => {
        if (p) { setPhotoUrl(p.url); setPhotoAuthor(p.author); setPhotoAuthorUrl(p.authorUrl) }
        setLoading(false)
      })
    }
  }, [outfit.id, outfit.occasion, outfit.items, colorType, gender, mode])

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm">
      <div className="relative w-full overflow-hidden" style={{ height: "460px" }}>
        {loading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-secondary">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            {mode === "stability" && <p className="text-sm text-muted-foreground">AI создаёт образ...</p>}
          </div>
        ) : photoUrl ? (
          <>
            <img src={photoUrl} alt={outfit.title} className="h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute left-5 top-5 rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
              {outfit.occasion}
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <h2 className="font-serif text-3xl font-semibold text-white drop-shadow-lg">{outfit.title}</h2>
              <p className="mt-1 text-sm italic text-white/80">{outfit.mood}</p>
            </div>
            {mode === "stability" && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded bg-black/50 px-2 py-1">
                <Wand2 className="h-3 w-3 text-white" /><span className="text-[10px] text-white">AI-генерация</span>
              </div>
            )}
            {mode === "unsplash" && photoAuthor && (
              <a href={`${photoAuthorUrl}?utm_source=atelier&utm_medium=referral`} target="_blank" rel="noopener noreferrer"
                className="absolute bottom-3 right-3 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white hover:bg-black/70">
                {photoAuthor} / Unsplash
              </a>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fbf4e8] to-[#e8d2b7]">
            <span className="text-8xl opacity-25">{gender === "male" ? "👔" : "👗"}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="mb-4 font-serif text-xl font-semibold text-foreground">Что в образе</h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {outfit.items.map((item, i) => (
            <li key={i} className="flex flex-col gap-2 rounded-xl border border-border/70 bg-secondary/50 p-3">
              <div className="h-6 w-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.color }} />
              <div>
                <div className="text-sm font-semibold leading-tight text-foreground">{item.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{item.detail}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          {outfit.items.map((item, i) => (
            <div key={i} className="h-2 flex-1 rounded-full" style={{ backgroundColor: item.color }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OutfitsPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageMode, setImageMode] = useState<ImageMode>("unsplash")

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!result) return
    generateOutfits(result)
  }, [result])

  async function generateOutfits(result: StylistResult) {
    setLoading(true)
    setError(false)
    const isMale = result.gender === "male"
    const prompt = `Ты персональный AI-стилист ATELIER. Составь 4 готовых образа.
Данные клиента:
- Пол: ${isMale ? "мужчина" : "женщина"}
- Цветотип: ${result.colorType}
- Тип фигуры: ${result.typeTitle}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Избегать: ${result.avoid.join(", ")}
- Палитра: ${result.palette.map(p => `${p.name} (${p.hex})`).join(", ")}
Создай 4 образа: для работы, свидания, прогулки и мероприятия.
Ответь ТОЛЬКО валидным JSON без markdown:
{"outfits":[{"id":"work","occasion":"Работа","title":"название","mood":"настроение","items":[{"name":"вещь","detail":"описание","color":"#hex"}]}]}`

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
      })
      const data = await resp.json()
      const text = data.content?.[0]?.text || ""
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      setOutfits(parsed.outfits || [])
    } catch {
      setError(true)
      const p = result.palette
      setOutfits(isMale ? [
        { id: "work", occasion: "Работа", title: "Деловой образ", mood: "Уверенность и профессионализм", items: [{ name: result.recommendedItems[0] || "Пиджак", detail: "Приталенный", color: p[0]?.hex || "#1e3a5f" }, { name: "Брюки", detail: "Классические", color: p[1]?.hex || "#374151" }, { name: "Белая рубашка", detail: "Базовая", color: "#f8f8f8" }, { name: "Дерби", detail: "Тёмные", color: "#2a2a2a" }] },
        { id: "date", occasion: "Свидание", title: "Smart casual", mood: "Стиль без усилий", items: [{ name: "Тёмные джинсы", detail: "Прямой крой", color: "#2a3f5f" }, { name: result.recommendedItems[0] || "Пиджак", detail: "Без галстука", color: p[0]?.hex || "#1e3a5f" }, { name: "Рубашка", detail: "Светлая", color: "#f8f8f8" }, { name: "Лоферы", detail: "Нейтральный тон", color: p[1]?.hex || "#5c3d2e" }] },
        { id: "walk", occasion: "Прогулка", title: "Casual образ", mood: "Комфорт и лёгкость", items: [{ name: "Свитер", detail: "Оверсайз", color: p[3]?.hex || "#d9d3c7" }, { name: "Чиносы", detail: "Прямой крой", color: p[2]?.hex || "#c8a882" }, { name: "Белые кроссовки", detail: "Минималистичные", color: "#f5f5f5" }, { name: "Бомбер", detail: "Лёгкий", color: p[0]?.hex || "#374151" }] },
        { id: "event", occasion: "Мероприятие", title: "Вечерний образ", mood: "Элегантность и стиль", items: [{ name: "Костюм", detail: "Тёмно-синий", color: p[0]?.hex || "#1e3a5f" }, { name: "Рубашка", detail: "Белая", color: "#f0f4ff" }, { name: "Оксфорды", detail: "Начищенные", color: "#2a2a2a" }, { name: "Часы", detail: "Классические", color: p[1]?.hex || "#5c3d2e" }] },
      ] : [
        { id: "work", occasion: "Работа", title: "Офисный образ", mood: "Уверенность и профессионализм", items: [{ name: result.recommendedItems[0] || "Блейзер", detail: "Приталенный", color: p[0]?.hex || "#e8c4b8" }, { name: result.recommendedItems[1] || "Брюки", detail: "Классический силуэт", color: p[1]?.hex || "#c8a882" }, { name: "Блуза", detail: "Шёлковая", color: p[3]?.hex || "#f4ede4" }, { name: "Лоферы", detail: "Нейтральные", color: p[1]?.hex || "#c8a882" }] },
        { id: "date", occasion: "Свидание", title: "Романтический образ", mood: "Нежность и женственность", items: [{ name: result.recommendedItems[2] || "Платье", detail: "Миди", color: p[0]?.hex || "#c4b5d4" }, { name: "Ремень", detail: "Тонкий", color: p[3]?.hex || "#e0c9a6" }, { name: "Мюли", detail: "Лёгкий каблук", color: p[1]?.hex || "#e8c4b8" }, { name: "Украшения", detail: "Минималистичные", color: "#d4d4d4" }] },
        { id: "walk", occasion: "Прогулка", title: "Casual образ", mood: "Лёгкость и свобода", items: [{ name: result.recommendedItems[3] || "Свитер", detail: "Оверсайз", color: p[1]?.hex || "#e8c4b8" }, { name: result.recommendedItems[4] || "Джинсы", detail: "Высокая посадка", color: p[2]?.hex || "#d4c5a9" }, { name: "Белые кеды", detail: "Без принтов", color: "#f5f5f5" }, { name: "Шарф", detail: "В тонах палитры", color: p[2]?.hex || "#8fa8bc" }] },
        { id: "event", occasion: "Мероприятие", title: "Вечерний образ", mood: "Элегантность", items: [{ name: result.recommendedItems[0] || "Блейзер", detail: "Структурированный", color: p[1]?.hex || "#e8c4b8" }, { name: "Брюки wide-leg", detail: "Светлый тон", color: p[3]?.hex || "#f4ede4" }, { name: "Туфли", detail: "Средний каблук", color: "#d4d4d4" }, { name: "Клатч", detail: "Нейтральный", color: p[4]?.hex || "#c9908a" }] },
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
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 899 ₽</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Готовые образы</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            4 образа под ваш цветотип <strong>{result.colorType}</strong> и тип фигуры.
          </p>
        </div>

        {/* Переключатель фото */}
        {!loading && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Фотографии:</span>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button onClick={() => setImageMode("unsplash")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "unsplash" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                <Image className="h-3 w-3" />Unsplash
              </button>
              <button onClick={() => setImageMode("stability")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "stability" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                <Wand2 className="h-3 w-3" />AI-генерация
              </button>
            </div>
            {imageMode === "stability" && <span className="text-xs text-muted-foreground italic">~30 сек/образ</span>}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Claude составляет персональные образы...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center text-xs text-muted-foreground">
                Показаны базовые рекомендации. После деплоя будут персональные от Claude.
              </div>
            )}
            <div className="flex flex-col gap-8">
              {outfits.map((outfit) => (
                <OutfitCard key={`${outfit.id}-${imageMode}`} outfit={outfit} colorType={result.colorType} gender={gender} mode={imageMode} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
