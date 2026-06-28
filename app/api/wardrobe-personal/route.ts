// app/api/wardrobe-personal/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { result } = await req.json()
    const isMale = result.gender === "male"

    const prompt = `Ты персональный AI-стилист ATELIER. Составь капсульный гардероб из 12 вещей.
Данные клиента:
- Пол: ${isMale ? "мужчина" : "женщина"}
- Цветотип: ${result.colorType}
- Тип фигуры: ${result.typeTitle}
- Силуэты: ${result.silhouettes.join(", ")}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Палитра: ${result.palette.map((p: any) => `${p.name} (${p.hex})`).join(", ")}
Ответь ТОЛЬКО валидным JSON без markdown:
{"items":[{"number":1,"name":"вещь","why":"почему нужна (1 предложение)","colorHex":"#hex","colorName":"цвет","outfits":["+ вещь = результат"]}]}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || ""
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
