// app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { amount, description, featureId } = await req.json()

    const shopId = process.env.YUKASSA_SHOP_ID!
    const secretKey = process.env.YUKASSA_SECRET_KEY!

    // ВРЕМЕННО для диагностики — потом убрать
    console.log(
      "DEBUG shopId:", shopId,
      "| key ends with:", secretKey?.slice(-6),
      "| key length:", secretKey?.length
    )

    const idempotenceKey = `${featureId}-${Date.now()}`

    // После оплаты и при отмене — всегда возвращаем на страницу результата
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.atelier-ai.ru"
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
        metadata: { featureId },
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
