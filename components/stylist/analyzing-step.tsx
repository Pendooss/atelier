"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StylistForm } from "@/lib/stylist-data"

const stages = [
  "Считываем пропорции фигуры…",
  "Анализируем форму лица и колорит…",
  "Определяем цветотип по фото…",
  "Подбираем фасоны и цветовую палитру…",
  "Формируем персональную карточку…",
]

export function AnalyzingStep({
  form,
  onDone,
}: {
  form: StylistForm
  onDone: (visionData?: any) => void
}) {
  const [active, setActive] = useState(0)
  const [visionData, setVisionData] = useState<any>(null)
  const [visionDone, setVisionDone] = useState(false)

  useEffect(() => {
    // Вызываем серверный роут — без CORS проблем
    if (form.photo) {
      fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      })
        .then(r => r.json())
        .then(data => {
          setVisionData(data)
          setVisionDone(true)
        })
        .catch(() => setVisionDone(true)) // при ошибке продолжаем без Vision
    } else {
      setVisionDone(true)
    }
  }, [])

  useEffect(() => {
    if (active >= stages.length) {
      // Ждём завершения Vision перед переходом
      if (visionDone) {
        const t = setTimeout(() => onDone(visionData), 600)
        return () => clearTimeout(t)
      }
      return
    }
    const t = setTimeout(() => setActive((a) => a + 1), 850)
    return () => clearTimeout(t)
  }, [active, visionDone, visionData, onDone])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </span>
      <h1 className="mt-6 font-serif text-3xl">Анализируем ваш образ</h1>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        Claude AI изучает фото и подбирает рекомендации персонально для вас.
      </p>

      <ul className="mt-8 w-full space-y-3 text-left">
        {stages.map((s, i) => {
          const done = i < active
          const current = i === active
          return (
            <li key={s} className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
              done || current
                ? "border-accent/40 bg-card"
                : "border-border bg-card/50 text-muted-foreground",
            )}>
              {done ? (
                <Check className="h-4 w-4 shrink-0 text-accent" />
              ) : current ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-border" />
              )}
              {s}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
