// components/stylist/analyzing-step.tsx
// Теперь реально анализирует фото через Claude Vision

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

// Анализ фото через Claude Vision
async function analyzePhotoWithClaude(form: StylistForm): Promise<Partial<{
  colorType: string
  skinAnalysis: string
  bodyAnalysis: string
}>> {
  if (!form.photo) return {}

  try {
    const prompt = `Ты персональный AI-стилист. Проанализируй фото человека.

Данные пользователя:
- Пол: ${form.gender === "male" ? "мужчина" : "женщина"}
- Возраст: ${form.age} лет
- Рост: ${form.height} см, Вес: ${form.weight} кг
- Тип фигуры (по мнению пользователя): ${form.bodyType}
- Цвет кожи: ${form.skinTone}, Цвет волос: ${form.hairColor}
- Форма лица: ${form.faceShape || "не указана"}

На основе фото и данных определи:
1. Подтверди или уточни тип фигуры
2. Определи цветотип (Весна/Лето/Осень/Зима)
3. Дай краткую характеристику внешности

Ответь ТОЛЬКО в JSON:
{
  "colorType": "Лето",
  "bodyConfirmed": true,
  "bodyNote": "подтверждаем тип фигуры",
  "note": "краткая характеристика 1 предложение"
}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: form.photo.startsWith("data:image/png") ? "image/png" : "image/jpeg",
                data: form.photo.split(",")[1],
              }
            },
            { type: "text", text: prompt }
          ]
        }]
      })
    })

    if (!response.ok) return {}
    const data = await response.json()
    const text = data.content?.[0]?.text || ""
    return JSON.parse(text.replace(/```json|```/g, "").trim())
  } catch {
    return {}
  }
}

export function AnalyzingStep({
  form,
  onDone,
}: {
  form: StylistForm
  onDone: (visionData?: any) => void
}) {
  const [active, setActive] = useState(0)
  const [visionData, setVisionData] = useState<any>(null)

  useEffect(() => {
    // Запускаем Vision анализ параллельно с анимацией
    if (form.photo) {
      analyzePhotoWithClaude(form).then(data => {
        setVisionData(data)
      })
    }
  }, [])

  useEffect(() => {
    if (active >= stages.length) {
      // Передаём данные Vision в родительский компонент
      const t = setTimeout(() => onDone(visionData), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setActive((a) => a + 1), 850)
    return () => clearTimeout(t)
  }, [active, visionData, onDone])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </span>
      <h1 className="mt-6 font-serif text-3xl">Анализируем ваш образ</h1>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        AI изучает фото и подбирает рекомендации персонально для вас.
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
