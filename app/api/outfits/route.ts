// app/api/outfits/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { result } = await req.json()
    if (!result) return NextResponse.json({ error: "no result" }, { status: 400 })

    const isMale = result.gender === "male"
    const prompt = `Ты персональный AI-стилист ATELIER. Составь 4 готовых образа.
Данные клиента:
- Пол: ${isMale ? "мужчина" : "женщина"}
- Цветотип: ${result.colorType}
- Тип фигуры: ${result.typeTitle}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Избегать: ${result.avoid.join(", ")}
- Палитра: ${result.palette.map((p: any) => `${p.name} (${p.hex})`).join(", ")}

Создай 4 образа: для работы, свидания, прогулки и мероприятия.
Ответь ТОЛЬКО валидным JSON без markdown:
{"outfits":[{"id":"work","occasion":"Работа","title":"название","mood":"настроение образа","items":[{"name":"вещь","detail":"краткое описание","color":"#hex из палитры"}]}]}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    })

    if (!response.ok) {
      console.error("Anthropic error:", await response.text())
      return NextResponse.json({ error: "api error" }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ""
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
    return NextResponse.json(parsed)
  } catch (e) {
    console.error("Outfits route error:", e)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
