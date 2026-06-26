"use client"

import { useState, useEffect } from "react"
import { getOutfitPhoto, type UnsplashPhoto } from "@/lib/unsplash"
import type { StylistResult } from "@/lib/stylist-data"

interface Outfit {
  id: string
  occasion: string
  title: string
  mood: string
  items: { name: string; detail: string; color: string }[]
}

function buildOutfits(result: StylistResult): Outfit[] {
  const p = result.palette
  const isMale = result.gender === "male"

  if (isMale) {
    return [
      {
        id: "work", occasion: "Работа", title: "Деловой образ", mood: "Уверенность и профессионализм",
        items: [
          { name: result.recommendedItems[0] || "Пиджак", detail: "Приталенный крой", color: p[0]?.hex || "#1e3a5f" },
          { name: result.recommendedItems[1] || "Брюки", detail: "Классические прямые", color: p[1]?.hex || "#374151" },
          { name: "Белая рубашка", detail: "Базовая, под галстук или без", color: "#f8f8f8" },
          { name: "Дерби или оксфорды", detail: "Тёмные, под цвет брюк", color: p[1]?.hex || "#2a2a2a" },
        ],
      },
      {
        id: "date", occasion: "Свидание", title: "Casual smart образ", mood: "Стиль без лишних усилий",
        items: [
          { name: "Тёмные джинсы", detail: "Прямой крой, без потёртостей", color: "#2a3f5f" },
          { name: result.recommendedItems[0] || "Пиджак", detail: "Без галстука, расслабленно", color: p[0]?.hex || "#1e3a5f" },
          { name: "Белая или светлая рубашка", detail: "Расстёгнут верхний пуговица", color: "#f8f8f8" },
          { name: "Лоферы или челси", detail: "Нейтральный тон", color: p[1]?.hex || "#5c3d2e" },
        ],
      },
      {
        id: "walk", occasion: "Прогулка", title: "Casual образ", mood: "Комфорт и лёгкость",
        items: [
          { name: result.recommendedItems[3] || "Свитер", detail: "Оверсайз или regular fit", color: p[3]?.hex || "#d9d3c7" },
          { name: "Чиносы или джинсы", detail: "Прямой крой", color: p[2]?.hex || "#c8a882" },
          { name: "Белые кроссовки", detail: "Чистые, минималистичные", color: "#f5f5f5" },
          { name: "Лёгкая куртка", detail: "Бомбер или харrington", color: p[0]?.hex || "#374151" },
        ],
      },
      {
        id: "event", occasion: "Мероприятие", title: "Вечерний образ", mood: "Элегантность и стиль",
        items: [
          { name: "Костюм", detail: "Тёмно-синий или серый", color: p[0]?.hex || "#1e3a5f" },
          { name: "Светлая рубашка", detail: "Белая или голубая", color: "#f0f4ff" },
          { name: "Оксфорды или дерби", detail: "Начищенные, тёмные", color: "#2a2a2a" },
          { name: "Ремень и часы", detail: "В тон обуви", color: p[1]?.hex || "#5c3d2e" },
        ],
      },
    ]
  }

  // Женские образы
  return [
    {
      id: "work", occasion: "Работа", title: "Офисный образ", mood: "Уверенность и профессионализм",
      items: [
        { name: result.recommendedItems[0] || "Блейзер", detail: "Приталенный крой", color: p[0]?.hex || "#e8c4b8" },
        { name: result.recommendedItems[1] || "Брюки", detail: "Классический силуэт", color: p[1]?.hex || "#c8a882" },
        { name: "Шёлковая блуза", detail: "Под цветотип", color: p[3]?.hex || "#f4ede4" },
        { name: "Лоферы", detail: "Нейтральный тон", color: p[1]?.hex || "#c8a882" },
      ],
    },
    {
      id: "date", occasion: "Свидание", title: "Романтический образ", mood: "Нежность и женственность",
      items: [
        { name: result.recommendedItems[2] || "Платье", detail: "Миди, мягкая ткань", color: p[0]?.hex || "#c4b5d4" },
        { name: "Тонкий ремень", detail: "Акцент на талии", color: p[3]?.hex || "#e0c9a6" },
        { name: "Мюли", detail: "Лёгкий каблук", color: p[1]?.hex || "#e8c4b8" },
        { name: "Украшения", detail: "Тонкие, минималистичные", color: "#d4d4d4" },
      ],
    },
    {
      id: "walk", occasion: "Прогулка", title: "Casual образ", mood: "Лёгкость и свобода",
      items: [
        { name: result.recommendedItems[3] || "Свитер", detail: "Слегка оверсайз", color: p[1]?.hex || "#e8c4b8" },
        { name: result.recommendedItems[4] || "Джинсы", detail: "Высокая посадка", color: p[2]?.hex || "#d4c5a9" },
        { name: "Белые кеды", detail: "Без принтов", color: "#f5f5f5" },
        { name: "Шарф", detail: "В тонах палитры", color: p[2]?.hex || "#8fa8bc" },
      ],
    },
    {
      id: "event", occasion: "Мероприятие", title: "Вечерний образ", mood: "Элегантность и изысканность",
      items: [
        { name: result.recommendedItems[0] || "Блейзер", detail: "Структурированный", color: p[1]?.hex || "#e8c4b8" },
        { name: "Широкие брюки", detail: "Светлый тон", color: p[3]?.hex || "#f4ede4" },
        { name: "Туфли", detail: "Средний каблук", color: "#d4d4d4" },
        { name: "Клатч", detail: "Нейтральный тон", color: p[4]?.hex || "#c9908a" },
      ],
    },
  ]
}

function OutfitCard({ outfit, colorType, gender }: {
  outfit: Outfit
  colorType: string
  gender: "male" | "female"
}) {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOutfitPhoto(outfit.id, colorType, gender).then((p) => {
      setPhoto(p)
      setLoading(false)
    })
  }, [outfit.id, colorType, gender])

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm">
      <div className="relative w-full overflow-hidden" style={{ height: "460px" }}>
        {loading ? (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : photo ? (
          <>
            <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3f3025]/70 via-[#3f3025]/10 to-transparent" />
            <div className="absolute left-5 top-5 rounded-full bg-[#3f3025]/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
              {outfit.occasion}
            </div>
            <div className="absolute bottom-5 left-5 right-5">
              <h2 className="font-serif text-3xl font-semibold text-white drop-shadow-lg">{outfit.title}</h2>
              <p className="mt-1 text-sm italic text-white/80">{outfit.mood}</p>
            </div>
            <a href={`${photo.authorUrl}?utm_source=atelier&utm_medium=referral`} target="_blank" rel="noopener noreferrer"
              className="absolute bottom-3 right-3 rounded bg-[#3f3025]/60 px-2 py-0.5 text-[10px] text-white hover:bg-[#3f3025]/75">
              {photo.author} / Unsplash
            </a>
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

export function OutfitsSection({ result }: { result: StylistResult }) {
  const outfits = buildOutfits(result)
  const gender = result.gender ?? "female"

  return (
    <div className="mt-4">
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        4 готовых образа под ваш цветотип <strong>{result.colorType}</strong> и тип фигуры.
        Каждый лук — завершённый и готовый к носке.
      </p>
      <div className="flex flex-col gap-8">
        {outfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} colorType={result.colorType} gender={gender} />
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Фотографии предоставлены{" "}
        <a href="https://unsplash.com?utm_source=atelier&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Unsplash
        </a>
      </p>
    </div>
  )
}
