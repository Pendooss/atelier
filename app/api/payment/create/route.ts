// app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

export async function POST(req: NextRequest) {
  try {
    const { amount, description, featureId, userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const shopId = process.env.YUKASSA_SHOP_ID!
    const secretKey = process.env.YUKASSA_SECRET_KEY!

    // ВАЖНО: ключ идемпотентности у ЮKassa ограничен по длине (64 символа).
    // Для пакетов featureId может содержать несколько услуг через запятую,
    // и вместе с userId + датой это превышало лимит — отсюда ошибка
    // "Idempotence key is too long" именно на пакетных покупках.
    // UUID даёт гарантированную уникальность и всегда укладывается в лимит.
    const idempotenceKey = randomUUID()

    // После оплаты и при отмене — всегда возвращаем на страницу результата
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://atelier-ai.ru"
    const returnUrl = `${baseUrl}/?step=3&paid=${featureId}`

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        "Authorization": "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: { value: amount, currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url: returnUrl,
        },
        capture: true,
        description,
        // userId и featureId нужны в вебхуке (/api/payment/webhook), чтобы понять,
        // кому и какую услугу открыть после подтверждения оплаты
        metadata: { featureId, userId },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("YuKassa error:", err)
      return NextResponse.json({ error: "payment error" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({
      paymentId: data.id,
      confirmationUrl: data.confirmation.confirmation_url,
    })
  } catch (e) {
    console.error("Payment route error:", e)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
