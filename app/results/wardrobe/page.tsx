"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, X, Wand2, Image } from "lucide-react"
import Link from "next/link"
import { getWardrobeItemPhoto } from "@/lib/unsplash"
import { generateClothingImage } from "@/lib/pollinations"
import type { StylistResult } from "@/lib/stylist-data"

type ImageMode = "unsplash" | "stability"

interface ClothingItem {
  name: string
  detail: string
  color: string
  tag: "wear" | "avoid"
}

function buildItems(result: StylistResult) {
  const p = result.palette
  const isMale = result.gender === "male"
  if (isMale) {
    return {
      wear: [
        { name: result.recommendedItems[0] || "Пиджак", detail: "Приталенный или regular fit", color: p[0]?.hex || "#1e3a5f", tag: "wear" as const },
        { name: result.recommendedItems[1] || "Прямые брюки", detail: "Классический крой", color: p[1]?.hex || "#374151", tag: "wear" as const },
        { name: "Белая рубашка", detail: "Базовая, универсальная", color: "#f8f8f8", tag: "wear" as const },
        { name: result.recommendedItems[3] || "Джемпер", detail: "Кашемир или шерсть", color: p[3]?.hex || "#d9d3c7", tag: "wear" as const },
        { name: "Чиносы", detail: "Между джинсами и брюками", color: p[2]?.hex || "#c8a882", tag: "wear" as const },
        { name: "Поло", detail: "Элегантнее футболки", color: p[4]?.hex || "#2f6b5b", tag: "wear" as const },
      ],
      avoid: [
        { name: result.avoid[0] || "Обтягивающие футболки", detail: "Не подходят вашему типу", color: "#2a2a2a", tag: "avoid" as const },
        { name: result.avoid[1] || "Бесформенный оверсайз", detail: "Скрывает пропорции", color: "#888888", tag: "avoid" as const },
        { name: result.avoid[2] || "Яркие принты по всему", detail: "Нарушают баланс образа", color: "#4a6fa5", tag: "avoid" as const },
      ],
    }
  }
  return {
    wear: [
      { name: result.recommendedItems[0] || "Приталенный блейзер", detail: "Основа делового образа", color: p[0]?.hex || "#e8c4b8", tag: "wear" as const },
      { name: result.recommendedItems[1] || "Прямые брюки", detail: "Универсальный низ", color: p[1]?.hex || "#c8a882", tag: "wear" as const },
      { name: result.recommendedItems[2] || "Платье миди", detail: "На любой повод", color: p[0]?.hex || "#c4b5d4", tag: "wear" as const },
      { name: result.recommendedItems[3] || "Кашемировый джемпер", detail: "Повседневный уют", color: p[3]?.hex || "#f4ede4", tag: "wear" as const },
      { name: result.recommendedItems[4] || "Широкие джинсы", detail: "Casual образ", color: p[2]?.hex || "#d4c5a9", tag: "wear" as const },
      { name: "Шёлковая блуза", detail: "Лёгкость и элегантность", color: p[4]?.hex || "#e8d5c0", tag: "wear" as const },
    ],
    avoid: [
      { name: result.avoid[0] || "Обтягивающий трикотаж", detail: "Не подходит для вашего типа", color: "#2a2a2a", tag: "avoid" as const },
      { name: result.avoid[1] || "Бесформенный оверсайз", detail: "Скрывает достоинства фигуры", color: "#888888", tag: "avoid" as const },
      { name: result.avoid[2] || "Грубые ткани", detail: "Нарушают баланс образа", color: "#4a6fa5", tag: "avoid" as const },
    ],
  }
}

function ClothingCard({ item, gender, mode }: {
  item: ClothingItem
  gender: "male" | "female"
  mode: ImageMode
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoAuthor, setPhotoAuthor] = useState<string | null>(null)
  const [photoAuthorUrl, setPhotoAuthorUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const isAvoid = item.tag === "avoid"

  useEffect(() => {
    setLoading(true)
    setPhotoUrl(null)
    if (mode === "stability") {
      const colorName = item.color
      generateClothingImage(item.name, colorName, gender).then((url) => {
        setPhotoUrl(url)
        setLoading(false)
      })
    } else {
      getWardrobeItemPhoto(item.name, gender).then((p) => {
        if (p) { setPhotoUrl(p.url); setPhotoAuthor(p.author); setPhotoAuthorUrl(p.authorUrl) }
        setLoading(false)
      })
    }
  }, [item.name, item.color, gender, mode])

  return (
    <div className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${isAvoid ? "border-destructive/20" : "border-border hover:border-accent"}`}>
      <div className="relative overflow-hidden" style={{ height: "320px" }}>
        {loading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            {mode === "stability" && <span className="text-xs text-muted-foreground">AI генерирует...</span>}
          </div>
        ) : photoUrl ? (
          <>
            <img src={photoUrl} alt={item.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md ${isAvoid ? "bg-destructive" : "bg-accent"}`}>
              {isAvoid ? <X className="h-5 w-5 text-white" /> : <Check className="h-5 w-5 text-white" />}
            </div>
            <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${isAvoid ? "bg-destructive/90 text-white" : "bg-accent/90 text-white"}`}>
              {isAvoid ? "Избегать" : "Носить"}
            </div>
            {mode === "stability" && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-0.5">
                <Wand2 className="h-3 w-3 text-white" /><span className="text-[9px] text-white">AI</span>
              </div>
            )}
            {mode === "unsplash" && photoAuthor && (
              <a href={`${photoAuthorUrl}?utm_source=atelier&utm_medium=referral`} target="_blank" rel="noopener noreferrer"
                className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white hover:bg-black/70">
                {photoAuthor} / Unsplash
              </a>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(145deg, ${item.color}33, ${item.color}66)` }}>
            <span className="text-6xl">{gender === "male" ? "👔" : "👗"}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-base font-semibold text-foreground">{item.name}</div>
        <div className="mt-1 text-sm text-muted-foreground">{item.detail}</div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-muted-foreground">{isAvoid ? "Нежелательный тон" : "Рекомендуемый тон"}</span>
        </div>
      </div>
    </div>
  )
}

export default function WardrobePage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [tab, setTab] = useState<"wear" | "avoid">("wear")
  const [imageMode, setImageMode] = useState<ImageMode>("unsplash")

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))
  }, [])

  if (!result) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Данные не найдены.</p>
        <Link href="/?step=3" className="mt-4 inline-block text-accent underline">К результатам</Link>
      </div>
    </div>
  )

  const gender = result.gender ?? "female"
  const { wear, avoid } = buildItems(result)
  const items = tab === "wear" ? wear : avoid

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/?step=3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />Назад
          </Link>
          <span className="font-serif text-xl tracking-wide">ATELIER</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 399 ₽</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Визуальный гардероб</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {gender === "male" ? "Мужская" : "Женская"} одежда под ваш цветотип <strong>{result.colorType}</strong>.
          </p>
        </div>

        {/* Переключатель фото */}
        <div className="mb-5 flex items-center justify-center gap-2">
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
          {imageMode === "stability" && <span className="text-xs text-muted-foreground italic">~30 сек/фото</span>}
        </div>

        {/* Табы */}
        <div className="mb-6 flex justify-center gap-3">
          <button onClick={() => setTab("wear")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${tab === "wear" ? "bg-accent text-accent-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:border-accent"}`}>
            <Check className="h-4 w-4" />Что носить ({wear.length})
          </button>
          <button onClick={() => setTab("avoid")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${tab === "avoid" ? "bg-destructive text-white shadow-sm" : "border border-border bg-background text-muted-foreground hover:border-destructive"}`}>
            <X className="h-4 w-4" />Чего избегать ({avoid.length})
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {items.map((item) => (
            <ClothingCard key={`${item.name}-${imageMode}`} item={item} gender={gender} mode={imageMode} />
          ))}
        </div>

        {imageMode === "unsplash" && (
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Фотографии предоставлены{" "}
            <a href="https://unsplash.com?utm_source=atelier&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Unsplash</a>
          </p>
        )}
      </div>
    </main>
  )
}
