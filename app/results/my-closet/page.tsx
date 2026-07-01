"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Upload, X, Loader2, Sparkles, Send, MessageSquare, Lock } from "lucide-react"
import Link from "next/link"
import { supabase, hasPurchased } from "@/lib/supabase"
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

interface Message {
  role: "user" | "assistant"
  text: string
}

type AccessState = "checking" | "granted" | "denied"

// ─── AI Чат ─────────────────────────────────────────────────────
function AIChat({ result }: { result: StylistResult }) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    text: `Привет! Я ваш персональный AI-стилист. 👗\n\nЗнаю ваш профиль: цветотип ${result.colorType}, тип фигуры ${result.typeTitle}. Спрашивайте всё о стиле!`
  }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: "user", text }
    setMessages(m => [...m, userMsg])
    setInput("")
    setLoading(true)

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], result }),
      })
      const data = await resp.json()
      setMessages(m => [...m, { role: "assistant", text: data.reply || "Попробуйте ещё раз." }])
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Ошибка. Попробуйте ещё раз." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border/80 bg-card/95 overflow-hidden" style={{ height: "500px" }}>
      <div className="border-b border-border/60 px-4 py-3 bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-serif text-sm font-semibold">A</div>
          <div>
            <div className="text-sm font-semibold text-foreground">AI-стилист ATELIER</div>
            <div className="text-xs text-muted-foreground">Знает ваш профиль · Отвечает за секунды</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-accent text-accent-foreground rounded-br-sm"
                : "bg-secondary text-foreground rounded-bl-sm border border-border/50"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-border/50 bg-secondary px-4 py-2.5">
              <div className="flex gap-1">
                {[0, 150, 300].map(delay => (
                  <div key={delay} className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border/60 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Спросите что угодно о стиле..."
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function MyClosetPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<ClosetAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"upload" | "result">("upload")
  const [activeTab, setActiveTab] = useState<"closet" | "chat">("closet")
  const [access, setAccess] = useState<AccessState>("checking")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))

    // ─── Реальная проверка оплаты — вместо доверия параметру ?paid=1 в URL ───
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setAccess("denied"); return }
      try {
        const ok = await hasPurchased(user.id, "mycloset")
        setAccess(ok ? "granted" : "denied")
      } catch {
        setAccess("denied")
      }
    })
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

    try {
      const resp = await fetch("/api/my-closet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photos.slice(0, 3), result }),
      })
      const parsed = await resp.json()
      if (parsed.error) throw new Error(parsed.error)
      setAnalysis(parsed)
      setStep("result")
    } catch {
      // Фоллбэк
      setAnalysis({
        summary: `Ваш гардероб содержит интересные базовые вещи. Для цветотипа ${result.colorType} важно сочетать нейтральные тона с акцентными цветами палитры.`,
        outfits: [
          { title: "Деловой образ", occasion: "Работа", items: [result.recommendedItems[0] || "Блейзер", result.recommendedItems[1] || "Брюки", "Белая рубашка"], tip: "Добавьте тонкий ремень в тон обуви", missingItem: "Классические лоферы" },
          { title: "Casual образ", occasion: "Прогулка", items: [result.recommendedItems[3] || "Джемпер", "Джинсы", "Белые кеды"], tip: "Подверните джинсы на 1-2 оборота", missingItem: null },
        ],
        generalTips: [`Ваша палитра ${result.colorType} — придерживайтесь нейтральных оттенков`, "Каждая вещь должна сочетаться минимум с 3 другими", "Инвестируйте в качество базовых вещей"],
        whatToBuy: [result.recommendedItems[0] || "Базовый блейзер", "Белая рубашка", "Нейтральные лоферы"]
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
          Чтобы открыть «Мой шкаф» и AI-стилиста в чате, сначала оформите доступ на странице результатов.
        </p>
        <Link href="/?step=3" className="mt-5 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors">
          К оплате
        </Link>
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
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 599 ₽/мес</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Мой шкаф + AI-чат</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Загрузите фото вещей — AI составит образы. Плюс личный стилист в чате 24/7.
          </p>
        </div>

        {/* Табы */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-border/60 bg-card/50 p-1">
          <button
            onClick={() => setActiveTab("closet")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${activeTab === "closet" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Sparkles className="h-4 w-4" />Мой шкаф
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${activeTab === "chat" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MessageSquare className="h-4 w-4" />AI-стилист в чате
          </button>
        </div>

        {/* Вкладка Мой шкаф */}
        {activeTab === "closet" && (
          <>
            {step === "upload" && (
              <>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-8 text-center transition-colors hover:border-accent hover:bg-accent/10"
                >
                  <Upload className="mx-auto h-10 w-10 text-accent/60" />
                  <p className="mt-3 font-serif text-xl text-foreground">Загрузите фото вещей</p>
                  <p className="mt-1 text-sm text-muted-foreground">Разложите вещи и сфотографируйте при хорошем освещении</p>
                  <p className="mt-3 text-xs text-muted-foreground">До 10 фотографий · JPG, PNG</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </div>

                {photos.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium">{photos.length} фото загружено</span>
                      <button onClick={() => fileRef.current?.click()} className="text-xs text-accent hover:underline">+ Добавить ещё</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {photos.map((photo, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                          <img src={photo} alt={`Вещь ${i + 1}`} className="h-full w-full object-cover" />
                          <button onClick={() => removePhoto(i)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <X className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={analyzeCloset}
                  disabled={photos.length === 0 || loading}
                  className="mt-6 w-full rounded-2xl bg-accent py-4 text-base font-medium text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-40"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />AI анализирует ваш гардероб...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />Составить образы из моих вещей
                    </span>
                  )}
                </button>
              </>
            )}

            {step === "result" && analysis && (
              <>
                <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Оценка гардероба</div>
                  <p className="text-sm leading-relaxed text-foreground">{analysis.summary}</p>
                </div>

                <div className="mb-6">
                  <h2 className="mb-4 font-serif text-2xl font-semibold">Образы из ваших вещей</h2>
                  <div className="flex flex-col gap-4">
                    {analysis.outfits.map((outfit, i) => (
                      <div key={i} className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm">
                        <div className="border-b border-border/60 bg-secondary/30 px-5 py-4 flex items-center justify-between">
                          <h3 className="font-serif text-xl font-semibold">{outfit.title}</h3>
                          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{outfit.occasion}</span>
                        </div>
                        <div className="p-5">
                          <ul className="mb-3 space-y-1.5">
                            {outfit.items.map((item, j) => (
                              <li key={j} className="flex items-center gap-2 text-sm">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{item}
                              </li>
                            ))}
                          </ul>
                          <div className="rounded-xl bg-secondary/40 px-4 py-3 text-sm">💡 {outfit.tip}</div>
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

                <div className="mb-6 rounded-2xl border border-border/80 bg-card/95 p-5">
                  <h2 className="mb-4 font-serif text-xl font-semibold">Советы по гардеробу</h2>
                  <ul className="space-y-2">
                    {analysis.generalTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
                  <h2 className="mb-4 font-serif text-xl font-semibold">Что докупить</h2>
                  <ul className="space-y-2">
                    {analysis.whatToBuy.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">{i + 1}</span>
                        <span className="text-sm font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => { setStep("upload"); setAnalysis(null); setPhotos([]) }}
                  className="mt-6 w-full rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
                >
                  Загрузить другие вещи
                </button>
              </>
            )}
          </>
        )}

        {/* Вкладка AI-чат */}
        {activeTab === "chat" && <AIChat result={result} />}
      </div>
    </main>
  )
}
