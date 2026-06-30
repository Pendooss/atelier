// app/api/openai-analysis/route.ts
// Персональный детальный анализ для платных услуг (Готовые образы, Визуальный гардероб, Капсула).
// Использует фото пользователя + базовые данные формы, возвращает развёрнутые
// индивидуальные рекомендации вместо шаблонных текстов из lib/stylist-data.ts.

import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

interface OpenAIAnalysisRequest {
  photo: string // base64 data URL
  gender: "male" | "female"
  age?: string
  height?: string
  weight?: string
  bodyType?: string
  skinTone?: string
  hairColor?: string
  colorType: string
  // Какую платную услугу запрашиваем — влияет на формулировку промпта
  service: "outfits" | "wardrobe" | "wardrobe-personal"
}

const SERVICE_PROMPTS: Record<OpenAIAnalysisRequest["service"], string> = {
  outfits: `Дай персональные рекомендации по 4 готовым образам (для работы, свидания, прогулки, выхода в свет) именно под этого человека — учитывай форму тела, пропорции и черты, которые ты видишь на фото, а не общие шаблоны. Для каждого образа укажи 3-4 конкретные вещи и объясни КОНКРЕТНО для этого человека, почему именно это сочетание подойдёт.`,
  wardrobe: `Дай персональные рекомендации по визуальному гардеробу — какие именно вещи, фасоны и цвета подойдут этому конкретному человеку с учётом того, что ты видишь на фото (пропорции, черты лица, общий стиль). Перечисли 8-10 конкретных вещей с кратким объяснением почему именно они.`,
  "wardrobe-personal": `Составь персональный капсульный гардероб из 12 базовых вещей именно под этого человека — учитывай то, что ты видишь на фото. Объясни как эти вещи комбинируются между собой и почему выбраны именно эти фасоны и цвета для данного человека.`,
}

export async function POST(req: NextRequest) {
  try {
    const body: OpenAIAnalysisRequest = await req.json()
    const { photo, gender, colorType, service } = body

    if (!photo) {
      return NextResponse.json({ error: "no photo" }, { status: 400 })
    }
    if (!SERVICE_PROMPTS[service]) {
      return NextResponse.json({ error: "invalid service" }, { status: 400 })
    }

    const servicePrompt = SERVICE_PROMPTS[service]

    const prompt = `Ты персональный AI-стилист высокого уровня. Перед тобой реальное фото человека — используй то, что видишь, для максимально индивидуального разбора, а не общие фразы.

Данные пользователя:
- Пол: ${gender === "male" ? "мужчина" : "женщина"}
- Возраст: ${body.age || "не указан"}
- Рост: ${body.height || "не указан"} см, Вес: ${body.weight || "не указан"} кг
- Тип фигуры (заявленный): ${body.bodyType || "не указан"}
- Цветотип: ${colorType}

Задача: ${servicePrompt}

Важно: пиши тепло, профессионально и конкретно — как будто реальный стилист лично посмотрел на фото и составил разбор именно для этого человека. Никаких общих фраз вроде "подойдёт практически всем".

Ответь ТОЛЬКО валидным JSON без markdown-обрамления, в следующем формате:
{
  "personalNote": "2-3 предложения — что стилист отметил по фото именно у этого человека",
  "items": [
    { "name": "название вещи", "reason": "почему именно это подходит этому человеку" }
  ]
}`

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set")
      return NextResponse.json({ error: "openai not configured" }, { status: 500 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: photo },
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("OpenAI error:", errText)
      return NextResponse.json({ error: "openai api error" }, { status: 500 })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ""
    const cleaned = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (e) {
    console.error("OpenAI analysis route error:", e)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
