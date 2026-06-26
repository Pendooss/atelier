"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { getWardrobeItemPhoto, type UnsplashPhoto } from "@/lib/unsplash"
import type { StylistResult } from "@/lib/stylist-data"

interface ClothingItem {
  name: string
  detail: string
  color: string
  tag: "wear" | "avoid"
}

function buildWardrobeItems(result: StylistResult): {
  wear: ClothingItem[]
  avoid: ClothingItem[]
} {
  const p = result.palette
  const isMale = result.gender === "male"

  if (isMale) {
    return {
      wear: [
        { name: result.recommendedItems[0] || "Пиджак", detail: "Приталенный или regular fit", color: p[0]?.hex || "#1e3a5f", tag: "wear" },
        { name: result.recommendedItems[1] || "Прямые брюки", detail: "Классический крой", color: p[1]?.hex || "#374151", tag: "wear" },
        { name: "Белая рубашка", detail: "Базовая, универсальная", color: "#f8f8f8", tag: "wear" },
        { name: result.recommendedItems[3] || "Джемпер", detail: "Кашемир или шерсть", color: p[3]?.hex || "#d9d3c7", tag: "wear" },
        { name: "Чиносы", detail: "Между джинсами и брюками", color: p[2]?.hex || "#c8a882", tag: "wear" },
        { name: "Поло", detail: "Элегантнее футболки", color: p[4]?.hex || "#2f6b5b", tag: "wear" },
      ],
      avoid: [
        { name: result.avoid[0] || "Обтягивающие футболки", detail: "Не подходят вашему типу", color: "#2a2a2a", tag: "avoid" },
        { name: result.avoid[1] || "Бесформенный оверсайз", detail: "Скрывает пропорции", color: "#888888", tag: "avoid" },
        { name: result.avoid[2] || "Яркие принты по всему", detail: "Нарушают баланс образа", color: "#4a6fa5", tag: "avoid" },
      ],
    }
  }

  return {
    wear: [
      { name: result.recommendedItems[0] || "Приталенный блейзер", detail: "Основа делового образа", color: p[0]?.hex || "#e8c4b8", tag: "wear" },
      { name: result.recommendedItems[1] || "Прямые брюки", detail: "Универсальный низ", color: p[1]?.hex || "#c8a882", tag: "wear" },
      { name: result.recommendedItems[2] || "Платье миди", detail: "На любой повод", color: p[0]?.hex || "#c4b5d4", tag: "wear" },
      { name: result.recommendedItems[3] || "Кашемировый джемпер", detail: "Повседневный уют", color: p[3]?.hex || "#f4ede4", tag: "wear" },
      { name: result.recommendedItems[4] || "Широкие джинсы", detail: "Casual образ", color: p[2]?.hex || "#d4c5a9", tag: "wear" },
      { name: "Шёлковая блуза", detail: "Лёгкость и элегантность", color: p[4]?.hex || "#e8d5c0", tag: "wear" },
    ],
    avoid: [
      { name: result.avoid[0] || "Обтягивающий трикотаж", detail: "Не подходит для вашего типа", color: "#2a2a2a", tag: "avoid" },
      { name: result.avoid[1] || "Бесформенный оверсайз", detail: "Скрывает достоинства фигуры", color: "#888888", tag: "avoid" },
      { name: result.avoid[2] || "Грубые ткани", detail: "Нарушают баланс образа", color: "#4a6fa5", tag: "avoid" },
    ],
  }
}

function ClothingCard({ item, gender }: { item: ClothingItem; gender: "male" | "female" }) {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(null)
  const [loading, setLoading] = useState(true)
  const isAvoid = item.tag === "avoid"

  useEffect(() => {
    getWardrobeItemPhoto(item.name, gender).then((p) => {
      setPhoto(p)
      setLoading(false)
    })
  }, [item.name, gender])

  return (
    <div className={`overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${isAvoid ? "border-destructive/20" : "border-border hover:border-accent"}`}>
      <div className="relative overflow-hidden" style={{ height: "280px" }}>
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : photo ? (
          <>
            <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3f3025]/40 via-transparent to-transparent" />
            <div className={`absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-md ${isAvoid ? "bg-destructive" : "bg-accent"}`}>
              {isAvoid ? <X className="h-4 w-4 text-white" /> : <Check className="h-4 w-4 text-white" />}
            </div>
            <div className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${isAvoid ? "bg-destructive/90 text-white" : "bg-accent/90 text-white"}`}>
              {isAvoid ? "Избегать" : "Носить"}
            </div>
            <a href={`${photo.authorUrl}?utm_source=atelier&utm_medium=referral`} target="_blank" rel="noopener noreferrer"
              className="absolute bottom-2 right-2 rounded bg-[#3f3025]/60 px-2 py-0.5 text-[10px] text-white hover:bg-[#3f3025]/75">
              {photo.author} / Unsplash
            </a>
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

export function VisualWardrobeSection({ result }: { result: StylistResult }) {
  const [tab, setTab] = useState<"wear" | "avoid">("wear")
  const { wear, avoid } = buildWardrobeItems(result)
  const items = tab === "wear" ? wear : avoid
  const gender = result.gender ?? "female"

  return (
    <div className="mt-4">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Визуальные примеры {gender === "male" ? "мужской" : "женской"} одежды под ваш цветотип{" "}
        <strong>{result.colorType}</strong>.
      </p>
      <div className="mb-5 flex gap-2">
        <button onClick={() => setTab("wear")} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${tab === "wear" ? "bg-accent text-accent-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:border-accent"}`}>
          <Check className="h-3.5 w-3.5" />Что носить ({wear.length})
        </button>
        <button onClick={() => setTab("avoid")} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${tab === "avoid" ? "bg-destructive text-white shadow-sm" : "border border-border bg-background text-muted-foreground hover:border-destructive"}`}>
          <X className="h-3.5 w-3.5" />Чего избегать ({avoid.length})
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <ClothingCard key={item.name} item={item} gender={gender} />
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Фотографии предоставлены{" "}
        <a href="https://unsplash.com?utm_source=atelier&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Unsplash</a>
      </p>
    </div>
  )
}
