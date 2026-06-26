"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import type { StylistResult } from "@/lib/stylist-data"

interface Brand {
  name: string
  description: string
  why: string
  priceRange: string
  models: string[]
  colorHex: string
}

export default function BrandsPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!result) return
    generateBrands(result)
  }, [result])

  async function generateBrands(result: StylistResult) {
    setLoading(true)
    setError(false)
    const isMale = result.gender === "male"

    const prompt = `Ты персональный AI-стилист ATELIER. Порекомендуй 5 брендов для клиента.

Данные клиента:
- Пол: ${isMale ? "мужчина" : "женщина"}
- Цветотип: ${result.colorType}
- Тип фигуры: ${result.typeTitle}
- Силуэты: ${result.silhouettes.join(", ")}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Палитра: ${result.palette.map(p => p.name).join(", ")}

Ответь ТОЛЬКО валидным JSON без markdown:
{
  "brands": [
    {
      "name": "название бренда",
      "description": "краткое описание стиля бренда (3-5 слов)",
      "why": "почему этот бренд подходит именно этому клиенту (2 предложения)",
      "priceRange": "диапазон цен в рублях",
      "models": ["4 конкретные вещи из этого бренда для клиента"],
      "colorHex": "#hex один из цветов палитры клиента"
    }
  ]
}`

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      })
      const data = await resp.json()
      const text = data.content?.[0]?.text || ""
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      setBrands(parsed.brands || [])
    } catch {
      setError(true)
      // Фоллбэк
      const fallbackBrands = isMale ? [
        { name: "COS", description: "Минимализм и чистые силуэты", why: `Идеально для цветотипа ${result.colorType}. Нейтральная палитра подчёркивает природный колорит.`, priceRange: "3 000 — 15 000 ₽", models: ["Приталенный пиджак", "Прямые брюки", "Льняная рубашка", "Водолазка"], colorHex: result.palette[0]?.hex || "#1e3a5f" },
        { name: "Massimo Dutti", description: "Качественная мужская классика", why: "Безупречный крой и премиальные ткани для делового гардероба.", priceRange: "5 000 — 30 000 ₽", models: ["Костюм двойка", "Белая рубашка", "Кожаные дерби", "Пальто"], colorHex: result.palette[1]?.hex || "#374151" },
        { name: "Arket", description: "Скандинавский минимализм", why: "Экологичные материалы и приглушённая палитра под ваш тип.", priceRange: "4 000 — 20 000 ₽", models: ["Кашемировый джемпер", "Чиносы", "Бомбер", "Льняные брюки"], colorHex: result.palette[2]?.hex || "#c8a882" },
        { name: "Zara Man", description: "Тренды по доступной цене", why: "Широкий выбор актуальных фасонов в тонах вашей палитры.", priceRange: "1 500 — 8 000 ₽", models: ["Пиджак slim fit", "Тёмные брюки", "Рубашка в клетку", "Дафлкот"], colorHex: result.palette[3]?.hex || "#d9d3c7" },
        { name: "Uniqlo", description: "База высокого качества", why: "Непревзойдённое качество базовых вещей — основа гардероба.", priceRange: "1 000 — 6 000 ₽", models: ["Кашемировый свитер", "Поло", "Чиносы slim", "Пуховик"], colorHex: result.palette[4]?.hex || "#6b7280" },
      ] : [
        { name: "COS", description: "Минимализм и чистые силуэты", why: `Идеально для цветотипа ${result.colorType}. Нейтральная палитра подчёркивает природный колорит.`, priceRange: "3 000 — 15 000 ₽", models: ["Приталенный блейзер", "Прямые брюки", "Льняная рубашка", "Платье миди"], colorHex: result.palette[0]?.hex || "#e8c4b8" },
        { name: "Arket", description: "Натуральные ткани", why: "Скандинавский минимализм и экологичные материалы под ваш тип фигуры.", priceRange: "4 000 — 20 000 ₽", models: ["Кашемировый джемпер", "Широкие джинсы", "Пальто", "Льняное платье"], colorHex: result.palette[1]?.hex || "#c8a882" },
        { name: "& Other Stories", description: "Романтика и женственность", why: "Богатый выбор пастельных оттенков и женственных фасонов.", priceRange: "3 500 — 18 000 ₽", models: ["Шёлковая блуза", "Платье миди", "Кардиган", "Юбка А-силуэта"], colorHex: result.palette[2]?.hex || "#8fa8bc" },
        { name: "Massimo Dutti", description: "Качественная классика", why: "Безупречный крой для базового гардероба под ваш силуэт.", priceRange: "5 000 — 25 000 ₽", models: ["Блейзер", "Шерстяное пальто", "Лоферы", "Брюки с защипами"], colorHex: result.palette[3]?.hex || "#f4ede4" },
        { name: "Zara", description: "Нюдовые тона", why: "Доступные цены и трендовые вещи в вашей палитре.", priceRange: "1 500 — 8 000 ₽", models: ["Оверсайз блейзер", "Прямые брюки", "Платье-рубашка", "Широкие джинсы"], colorHex: result.palette[4]?.hex || "#c9908a" },
      ]
      setBrands(fallbackBrands)
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
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 699 ₽</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Бренды и модели</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            5 {isMale ? "мужских" : "женских"} брендов, подобранных AI под ваш цветотип{" "}
            <strong>{result.colorType}</strong>.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Claude анализирует ваш профиль и подбирает бренды...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center text-xs text-muted-foreground">
                Показаны базовые рекомендации. После деплоя будут персональные от Claude.
              </div>
            )}
            <div className="flex flex-col gap-5">
              {brands.map((brand, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm">
                  <div className="flex items-center gap-5 p-6" style={{ borderBottom: "0.5px solid var(--border)" }}>
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-serif text-xl font-semibold text-white shadow-sm" style={{ backgroundColor: brand.colorHex }}>
                      {brand.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-2xl font-semibold text-foreground">{brand.name}</h2>
                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{brand.priceRange}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{brand.description}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/50 px-6 py-4">
                    <p className="text-sm italic leading-relaxed text-foreground">"{brand.why}"</p>
                  </div>
                  <div className="p-6">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">Рекомендуемые модели</div>
                    <ul className="space-y-2">
                      {brand.models.map((model, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-4 w-4 shrink-0 text-accent" />{model}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

