// app/api/payment/webhook/route.ts
//
// ЮKassa вызывает этот адрес сама после того, как платёж реально прошёл.
// Именно здесь (а не на клиенте) должна открываться платная услуга —
// иначе доступ можно получить, просто зная адрес страницы результата.
//
// URL для регистрации в личном кабинете ЮKassa (Настройки → Уведомления):
// https://atelier-ai.ru/api/payment/webhook
//
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Сервисный клиент Supabase с полными правами — нужен, чтобы писать покупки
// в обход RLS-политик (пользователь тут не залогинен, это серверный вызов от ЮKassa).
// SUPABASE_SERVICE_ROLE_KEY берётся в Supabase → Settings → API → service_role key.
// Это секретный ключ — храните только в переменных окружения сервера, никогда на клиенте.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FEATURE_NAMES: Record<string, string> = {
  outfits: "Готовые образы",
  visual: "Гардероб и шопинг",
  mycloset: "Мой шкаф + AI-чат",
  wardrobe: "Капсульный гардероб",
}

const FEATURE_PRICES: Record<string, string> = {
  outfits: "899.00",
  visual: "699.00",
  mycloset: "599.00",
  wardrobe: "299.00",
}

// Услуги с ограниченным сроком действия (30 дней)
const SUBSCRIPTION_FEATURES = new Set(["mycloset", "wardrobe"])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const paymentId = body?.object?.id

    if (!paymentId) {
      return NextResponse.json({ error: "no payment id" }, { status: 400 })
    }

    // ВАЖНО: не доверяем статусу оплаты из тела уведомления напрямую —
    // кто угодно теоретически может прислать POST на этот адрес.
    // Поэтому переспрашиваем реальный статус платежа напрямую у ЮKassa по его id.
    const shopId = process.env.YUKASSA_SHOP_ID!
    const secretKey = process.env.YUKASSA_SECRET_KEY!
    const verifyResp = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: {
        "Authorization": "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
      },
    })

    if (!verifyResp.ok) {
      console.error("Webhook: failed to verify payment", await verifyResp.text())
      return NextResponse.json({ error: "verify failed" }, { status: 400 })
    }

    const payment = await verifyResp.json()

    if (payment.status !== "succeeded") {
      // Платёж отменён/ещё не завершён — ничего не открываем
      return NextResponse.json({ ok: true })
    }

    const userId = payment.metadata?.userId
    const featureIdRaw = payment.metadata?.featureId

    if (!userId || !featureIdRaw) {
      console.error("Webhook: missing metadata", payment.metadata)
      return NextResponse.json({ error: "missing metadata" }, { status: 400 })
    }

    // Пакеты передают несколько услуг через запятую (например "outfits,visual")
    const featureIds: string[] = String(featureIdRaw).split(",")

    for (const featureId of featureIds) {
      // Защита от повторной записи, если ЮKassa продублирует уведомление
      const { data: existing } = await supabaseAdmin
        .from("purchases")
        .select("id")
        .eq("payment_id", paymentId)
        .eq("service_id", featureId)
        .maybeSingle()

      if (existing) continue

      const expiresAt = SUBSCRIPTION_FEATURES.has(featureId)
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { error } = await supabaseAdmin.from("purchases").insert({
        user_id: userId,
        service_id: featureId,
        service_name: FEATURE_NAMES[featureId] || featureId,
        price: FEATURE_PRICES[featureId] || payment.amount?.value || "0",
        payment_id: paymentId,
        expires_at: expiresAt,
      })

      if (error) console.error("Webhook: failed to save purchase", error)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Webhook error:", e)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
