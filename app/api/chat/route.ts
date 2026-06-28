// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages, result } = await req.json()

    const systemPrompt = `Ты персональный AI-стилист ATELIER. Отвечай на русском, кратко и по делу.
Профиль клиента:
- Цветотип: ${result.colorType}
- Тип внешности: ${result.typeTitle}
- Силуэты: ${result.silhouettes.join(", ")}
- Рекомендуемые вещи: ${result.recommendedItems.join(", ")}
- Палитра: ${result.palette.map((p: any) => p.name).join(", ")}
- Избегать: ${result.avoid.join(", ")}
Давай конкретные советы. Максимум 150 слов.`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: systemPrompt,
        messages: messages.map((m: any) => ({ role: m.role, content: m.text }))
      })
    })
    const data = await response.json()
    const reply = data.content?.[0]?.text || "Не удалось получить ответ."
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
