// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { form } = await req.json()
    if (!form?.photo) return NextResponse.json({ error: "no photo" }, { status: 400 })

    const prompt = `Ты персональный AI-стилист. Проанализируй фото человека.

Данные пользователя:
- Пол: ${form.gender === "male" ? "мужчина" : "женщина"}
- Возраст: ${form.age} лет
- Рост: ${form.height} см, Вес: ${form.weight} кг
- Тип фигуры: ${form.bodyType}
- Цвет кожи: ${form.skinTone}, Цвет волос: ${form.hairColor}
- Форма лица: ${form.faceShape || "не указана"}

Определи цветотип и подтверди тип фигуры по фото.

Ответь ТОЛЬКО валидным JSON без markdown:
{
  "colorType": "Лето",
  "bodyConfirmed": true,
  "bodyNote": "подтверждаем",
  "note": "краткая характеристика"
}`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
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

    if (!response.ok) {
      console.error("Anthropic error:", await response.text())
      return NextResponse.json({ error: "api error" }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ""
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
    return NextResponse.json(parsed)
  } catch (e) {
    console.error("Analyze route error:", e)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
