// app/api/my-closet/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { photos, result } = await req.json()
    if (!photos?.length || !result) return NextResponse.json({ error: "no data" }, { status: 400 })

    const prompt = `Ты персональный AI-стилист ATELIER. Пользователь загрузил фотографии своего гардероба.

Профиль пользователя:
- Пол: ${result.gender === "male" ? "мужчина" : "женщина"}
- Цветотип: ${result.colorType}
- Тип фигуры: ${result.typeTitle}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Избегать: ${result.avoid.join(", ")}
- Палитра: ${result.palette.map((p: any) => p.name).join(", ")}

Проанализируй фото гардероба и составь образы из этих вещей.

Ответь ТОЛЬКО валидным JSON без markdown:
{
  "summary": "общая оценка гардероба 2-3 предложения",
  "outfits": [
    {
      "title": "название образа",
      "occasion": "повод (Работа/Прогулка/Свидание/Выход)",
      "items": ["вещь 1", "вещь 2", "вещь 3"],
      "tip": "совет как носить этот образ",
      "missingItem": "одна вещь которой не хватает (или null)"
    }
  ],
  "generalTips": ["3-4 совета по улучшению гардероба"],
  "whatToBuy": ["3 конкретные вещи которых не хватает"]
}`

    const imagesToAnalyze = photos.slice(0, 3)
    const messages = [{
      role: "user",
      content: [
        ...imagesToAnalyze.map((photo: string) => ({
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ""
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
    return NextResponse.json(parsed)
  } catch (e) {
    console.error("My closet error:", e)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
