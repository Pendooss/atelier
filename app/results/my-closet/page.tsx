"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Upload, X, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import type { StylistResult } from "@/lib/stylist-data"

interface OutfitSuggestion {
  title: string
  occasion: string
  items: string[]
  tip: string
  missingItem?: string
}

interface ClosetAnalysis {
  summary: string
  outfits: OutfitSuggestion[]
  generalTips: string[]
  whatToBuy: string[]
}

export default function MyClosetPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<ClosetAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [step, setStep] = useState<"upload" | "result">("upload")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string
        setPhotos(prev => prev.length < 10 ? [...prev, base64] : prev)
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function analyzeCloset() {
    if (!photos.length || !result) return
    setLoading(true)
    setError(false)

    const prompt = `Ты персональный AI-стилист ATELIER. Пользователь загрузил фотографии своего гардероба.

Профиль пользователя:
- Пол: ${result.gender === "male" ? "мужчина" : "женщина"}
- Цветотип: ${result.colorType}
- Тип фигуры: ${result.typeTitle}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Избегать: ${result.avoid.join(", ")}
- Цветовая палитра: ${result.palette.map(p => p.name).join(", ")}

Пользователь загрузил ${photos.length} фото своего гардероба. Проанализируй что видишь на фото и составь образы из этих вещей.

Ответь ТОЛЬКО валидным JSON без markdown:
{
  "summary": "общая оценка гардероба 2-3 предложения",
  "outfits": [
    {
      "title": "название образа",
      "occasion": "повод (Работа/Прогулка/Свидание/Выход)",
      "items": ["вещь 1", "вещь 2", "вещь 3"],
      "tip": "совет как носить этот образ",
      "missingItem": "одна вещь которой не хватает для завершения образа (или null)"
    }
  ],
  "generalTips": ["3-4 совета по улучшению гардероба"],
  "whatToBuy": ["3 конкретные вещи которых не хватает в этом гардеробе"]
}`

    try {
      // Берём первые 3 фото для анализа (лимит токенов)
      const imagesToAnalyze = photos.slice(0, 3)
      
      const messages = [{
        role: "user",
        content: [
          ...imagesToAnalyze.map(photo => ({
            type: "image",
            source: {
              type: "base64",
              media_type: photo.startsWith("data:image/png") ? "image/png" : "image/jpeg",
              data: photo.split(",")[1],
            }
          })),
          { type: "text", text: prompt }
        ]
      }]

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages,
        }),
      })

      const data = await resp.json()
      const text = data.content?.[0]?.text || ""
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      setAnalysis(parsed)
      setStep("result")
    } catch {
      setError(true)
      // Фоллбэк
      setAnalysis({
        summary: `Ваш гардероб содержит интересные базовые вещи. Для цветотипа ${result.colorType} важно сочетать нейтральные тона с акцентными цветами палитры.`,
        outfits: [
          {
            title: "Деловой образ",
            occasion: "Работа",
            items: [result.recommendedItems[0] || "Блейзер", result.recommendedItems[1] || "Брюки", "Белая рубашка/блуза"],
            tip: "Добавьте тонкий ремень в тон обуви для завершённости образа",
            missingItem: "Классические лоферы нейтрального тона"
          },
          {
            title: "Повседневный образ",
            occasion: "Прогулка",
            items: [result.recommendedItems[3] || "Джемпер", result.recommendedItems[4] || "Джинсы", "Белые кеды"],
            tip: "Подверните джинсы на 1-2 оборота — визуально удлинит силуэт",
            missingItem: null
          },
          {
            title: "Вечерний образ",
            occasion: "Выход",
            items: [result.recommendedItems[2] || "Платье/Пиджак", "Тёмный низ", "Каблуки или лоферы"],
            tip: "Минималистичные украшения подчеркнут элегантность образа",
            missingItem: "Клатч или небольшая сумка"
          },
        ],
        generalTips: [
          `Ваша палитра ${result.colorType} — придерживайтесь нейтральных оттенков как базы`,
          "Каждая вещь должна сочетаться минимум с 3 другими предметами",
          "Избегайте: " + result.avoid[0],
          "Инвестируйте в качество базовых вещей — они носятся годами"
        ],
        whatToBuy: [
          result.recommendedItems[0] || "Базовый блейзер",
          "Белая рубашка/блуза",
          "Нейтральные лоферы"
        ]
      })
      setStep("result")
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
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 499 ₽/мес</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Мой шкаф</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Загрузите фото своих вещей — AI составит образы из того что уже есть в вашем шкафу и подскажет что докупить.
          </p>
        </div>

        {step === "upload" && (
          <>
            {/* Загрузка фото */}
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-8 text-center transition-colors hover:border-accent hover:bg-accent/10"
            >
              <Upload className="mx-auto h-10 w-10 text-accent/60" />
              <p className="mt-3 font-serif text-xl text-foreground">Загрузите фото вещей</p>
              <p className="mt-1 text-sm text-muted-foreground">Можно несколько фото — разложите вещи и сфотографируйте</p>
              <p className="mt-3 text-xs text-muted-foreground">До 10 фотографий · JPG, PNG</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {/* Превью фото */}
            {photos.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{photos.length} фото загружено</span>
                  <button onClick={() => fileRef.current?.click()}
                    className="text-xs text-accent hover:underline">
                    + Добавить ещё
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {photos.map((photo, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                      <img src={photo} alt={`Вещь ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Советы */}
            <div className="mt-5 rounded-2xl border border-border/80 bg-card/95 p-5">
              <div className="text-sm font-semibold text-foreground mb-3">💡 Как получить лучший результат</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Разложите вещи на ровной поверхности и сфотографируйте при хорошем освещении
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Можно загружать вещи по одной или группами
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  AI анализирует цвет, фактуру и стиль каждой вещи
                </li>
              </ul>
            </div>

            <button
              onClick={analyzeCloset}
              disabled={photos.length === 0 || loading}
              className="mt-6 w-full rounded-2xl bg-accent py-4 text-base font-medium text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI анализирует ваш гардероб...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Составить образы из моих вещей
                </span>
              )}
            </button>
          </>
        )}

        {step === "result" && analysis && (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center text-xs text-muted-foreground">
                Показаны базовые рекомендации. После деплоя AI проанализирует ваши фото детально.
              </div>
            )}

            {/* Общая оценка */}
            <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Оценка гардероба</div>
              <p className="text-sm leading-relaxed text-foreground">{analysis.summary}</p>
            </div>

            {/* Образы */}
            <div className="mb-6">
              <h2 className="mb-4 font-serif text-2xl font-semibold">Образы из ваших вещей</h2>
              <div className="flex flex-col gap-4">
                {analysis.outfits.map((outfit, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm">
                    <div className="border-b border-border/60 bg-secondary/30 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl font-semibold text-foreground">{outfit.title}</h3>
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                          {outfit.occasion}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-3">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Состав образа</div>
                        <ul className="space-y-1.5">
                          {outfit.items.map((item, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl bg-secondary/40 px-4 py-3 text-sm text-foreground">
                        💡 {outfit.tip}
                      </div>
                      {outfit.missingItem && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-accent/40 px-4 py-2.5">
                          <span className="text-xs text-muted-foreground">Не хватает:</span>
                          <span className="text-sm font-medium text-accent">{outfit.missingItem}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Советы */}
            <div className="mb-6 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm">
              <h2 className="mb-4 font-serif text-xl font-semibold">Советы по гардеробу</h2>
              <ul className="space-y-2">
                {analysis.generalTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Что докупить */}
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
              <h2 className="mb-4 font-serif text-xl font-semibold">Что докупить</h2>
              <p className="mb-3 text-xs text-muted-foreground">3 вещи которые сделают ваш гардероб полным</p>
              <ul className="space-y-2">
                {analysis.whatToBuy.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Кнопка повторить */}
            <button
              onClick={() => { setStep("upload"); setAnalysis(null); setPhotos([]) }}
              className="mt-6 w-full rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              Загрузить другие вещи
            </button>
          </>
        )}
      </div>
    </main>
  )
}
