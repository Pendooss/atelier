"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ExternalLink, ShoppingBag, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { supabase, hasPurchased } from "@/lib/supabase"
import type { StylistResult } from "@/lib/stylist-data"

interface ShopItem {
  store: string
  name: string
  detail: string
  price: string
  colorHex: string
  url: string
}

type AccessState = "checking" | "granted" | "denied"

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
  const [access, setAccess] = useState<AccessState>("checking")

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))

    // ─── Реальная проверка оплаты — вместо доверия параметру ?paid=1 в URL ───
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setAccess("denied"); return }
      try {
        const ok = await hasPurchased(user.id, "shops")
        setAccess(ok ? "granted" : "denied")
      } catch {
        setAccess("denied")
      }
    })
  }, [])

  useEffect(() => {
    // ВАЖНО: генерация вызывает платный API — запускаем только после
    // подтверждения оплаты, иначе запрос уйдёт даже без покупки
    if (!result || access !== "granted") return
    generateShopItems(result)
  }, [result, access])

  async function generateShopItems(result: StylistResult) {
    setLoading(true)
    setError(false)
    const isMale = result.gender === "male"

    try {
      const resp = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      })
      const parsed = await resp.json()
      if (parsed.error) throw new Error(parsed.error)
      setItems(parsed.items || [])
    } catch {
      setError(true)
      const stores = isMale ? STORES_MALE : STORES_FEMALE
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

  if (access === "checking") return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )

  if (access === "denied") return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-serif text-2xl">Услуга не оплачена</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Чтобы посмотреть подбор магазинов, сначала оформите доступ на странице результатов.
        </p>
        <Link href="/?step=3" className="mt-5 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors">
          К оплате
        </Link>
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
            {isMale ? "Мужские" : "Женские"} вещи подобраны AI под ваш цветотип <strong>{result.colorType}</strong>.
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Claude подбирает вещи персонально для вас...</p>
          </div>
        ) : (
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
                      {item.store}<ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="font-serif text-lg font-semibold text-foreground">{item.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.detail}</div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: item.colorHex }} />
                        <span className="text-xs text-muted-foreground">Под ваш цветотип</span>
                      </div>
                      <span className="font-serif text-lg font-semibold text-foreground">{item.price}</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
