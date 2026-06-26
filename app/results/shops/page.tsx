"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ExternalLink, ShoppingBag, Loader2 } from "lucide-react"
import Link from "next/link"
import type { StylistResult } from "@/lib/stylist-data"

interface ShopItem {
  store: string
  name: string
  detail: string
  price: string
  colorHex: string
  url: string
}

const STORES_FEMALE = [
  { name: "Zara", url: "https://www.zara.com/ru/ru/woman-blazers-l1052.html", color: "#6b5644" },
  { name: "H&M", url: "https://www2.hm.com/ru_ru/ladies.html", color: "#a46f52" },
  { name: "Uniqlo", url: "https://www.uniqlo.com/ru/ru/women", color: "#b5895f" },
  { name: "Mango", url: "https://shop.mango.com/ru/women", color: "#7a604b" },
  { name: "Arket", url: "https://www.arket.com/en_eur/women", color: "#8a765f" },
  { name: "& Other Stories", url: "https://www.stories.com/ru/clothing", color: "#9b735e" },
]

const STORES_MALE = [
  { name: "Zara Man", url: "https://www.zara.com/ru/ru/man-suits-l1483.html", color: "#6b5644" },
  { name: "H&M Man", url: "https://www2.hm.com/ru_ru/men.html", color: "#a46f52" },
  { name: "Uniqlo", url: "https://www.uniqlo.com/ru/ru/men", color: "#b5895f" },
  { name: "Massimo Dutti", url: "https://www.massimodutti.com/ru", color: "#7a604b" },
  { name: "Arket", url: "https://www.arket.com/en_eur/men", color: "#8a765f" },
  { name: "COS", url: "https://www.cos.com/ru-ru/men", color: "#9b735e" },
]

export default function ShopsPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!result) return
    generateShopItems(result)
  }, [result])

  async function generateShopItems(result: StylistResult) {
    setLoading(true)
    setError(false)
    const isMale = result.gender === "male"
    const stores = isMale ? STORES_MALE : STORES_FEMALE
    const palette = result.palette.map(p => p.name).join(", ")

    const prompt = `Ты персональный AI-стилист ATELIER. Порекомендуй 6 конкретных вещей из магазинов для клиента.

Данные клиента:
- Пол: ${isMale ? "мужчина" : "женщина"}
- Цветотип: ${result.colorType}
- Тип фигуры: ${result.typeTitle}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Палитра: ${palette}

Магазины: ${stores.map(s => s.name).join(", ")}

Ответь ТОЛЬКО валидным JSON без markdown:
{
  "items": [
    {
      "store": "название магазина из списка",
      "name": "конкретное название вещи",
      "detail": "цвет, крой и почему подходит (1 предложение)",
      "price": "ориентировочная цена в рублях",
      "colorHex": "#hex цвет вещи из палитры клиента"
    }
  ]
}`

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      })
      const data = await resp.json()
      const text = data.content?.[0]?.text || ""
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      setItems(parsed.items || [])
    } catch {
      setError(true)
      // Фоллбэк — статичные данные
      const fallback = stores.map((store, i) => ({
        store: store.name,
        name: result.recommendedItems[i] || "Базовая вещь",
        detail: `В тонах вашей палитры ${result.colorType}`,
        price: `${(3 + i) * 1000 + 990} ₽`,
        colorHex: result.palette[i % result.palette.length]?.hex || "#c8a882",
        url: store.url,
      }))
      setItems(fallback)
    } finally {
      setLoading(false)
    }
  }

  if (!result) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Данные не найдены.</p>
        <Link href="/?step=3" className="mt-4 inline-block text-accent underline">На главную</Link>
      </div>
    </div>
  )

  const isMale = result.gender === "male"
  const stores = isMale ? STORES_MALE : STORES_FEMALE

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
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 499 ₽</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Магазины</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {isMale ? "Мужские" : "Женские"} вещи подобраны AI под ваш цветотип{" "}
            <strong>{result.colorType}</strong> и тип фигуры.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Claude подбирает вещи персонально для вас...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center text-xs text-muted-foreground">
                Показаны базовые рекомендации. После деплоя будут персональные от Claude.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item, i) => {
                const store = stores.find(s => s.name === item.store) || stores[i % stores.length]
                return (
                  <a key={i} href={store.url} target="_blank" rel="noopener noreferrer"
                    className="group overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/70 hover:shadow-md">
                    <div className="relative flex h-48 items-center justify-center" style={{ backgroundColor: item.colorHex + "33" }}>
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-sm" style={{ backgroundColor: item.colorHex }}>
                        <ShoppingBag className="h-10 w-10 text-white/80" />
                      </div>
                      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold shadow-sm" style={{ color: store.color }}>
                        {item.store}
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="font-serif text-lg font-semibold text-foreground">{item.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{item.detail}</div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: item.colorHex }} />
                          <span className="text-xs text-muted-foreground">Подобрано AI под ваш цветотип</span>
                        </div>
                        <span className="font-serif text-lg font-semibold text-foreground">{item.price}</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </>
        )}

        <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/5 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Цены ориентировочные. Нажмите на карточку чтобы перейти в {isMale ? "мужской" : "женский"} раздел магазина.
          </p>
        </div>
      </div>
    </main>
  )
}

