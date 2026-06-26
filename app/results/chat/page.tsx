"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import type { StylistResult } from "@/lib/stylist-data"

interface Message {
  role: "user" | "assistant"
  text: string
}

const SUGGESTIONS = [
  "Что надеть на собеседование?",
  "Как составить образ на свидание?",
  "Какие цвета сочетать с моей палитрой?",
  "Что надеть на корпоратив?",
  "Как освежить образ без новых покупок?",
]

export default function ChatPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) {
      const r = JSON.parse(saved) as StylistResult
      setResult(r)
      setMessages([{
        role: "assistant",
        text: `Привет! Я ваш персональный AI-стилист ATELIER. 👗\n\nЯ знаю ваш профиль: цветотип **${r.colorType}**, тип внешности **${r.typeTitle}**. Спрашивайте всё что связано со стилем — отвечу за секунды!`,
      }])
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading || !result) return
    const userMsg: Message = { role: "user", text }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)

    try {
      const systemPrompt = `Ты персональный AI-стилист ATELIER. Отвечай на русском языке, кратко и по делу.
Профиль клиента:
- Цветотип: ${result.colorType}
- Тип внешности: ${result.typeTitle}
- Тип фигуры: ${result.silhouettes.join(", ")}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Палитра: ${result.palette.map(p => p.name).join(", ")}
- Избегать: ${result.avoid.join(", ")}
Давай конкретные советы учитывая профиль. Максимум 150 слов на ответ.`

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: systemPrompt,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      })
      const data = await resp.json()
      const reply = data.content?.[0]?.text || "Не удалось получить ответ."
      setMessages((m) => [...m, { role: "assistant", text: reply }])
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Произошла ошибка. Попробуйте ещё раз." }])
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

  return (
    <main className="flex h-screen flex-col bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/?step=3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />Назад
          </Link>
          <div className="text-center">
            <span className="font-serif text-xl tracking-wide">ATELIER</span>
            <div className="text-xs text-muted-foreground">AI-стилист · {result.colorType}</div>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-serif text-sm font-semibold">A</div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-accent text-accent-foreground rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-serif text-sm font-semibold">A</div>
              <div className="rounded-2xl rounded-bl-sm border border-border/80 bg-card/95 px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Подсказки */}
      {messages.length <= 1 && (
        <div className="border-t border-border px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <div className="mb-2 text-xs text-muted-foreground">Попробуйте спросить:</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="rounded-full border border-border/80 bg-card/95 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:text-accent">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ввод */}
      <div className="border-t border-border bg-background px-4 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Спросите что угодно о стиле..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
            disabled={loading}
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-40">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  )
}

