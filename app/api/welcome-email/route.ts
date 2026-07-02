// app/api/welcome-email/route.ts
import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = process.env.RESEND_API_KEY!

// ВАЖНО: домен atelier-ai.ru уже подтверждён в Resend — используем его.
// Пока отправка шла с onboarding@resend.dev (тестовый адрес), письма
// молча не доходили никому, кроме владельца самого аккаунта Resend —
// это ограничение самого Resend для неподтверждённых доменов.
const FROM_ADDRESS = "ATELIER <hello@atelier-ai.ru>"

export async function POST(req: NextRequest) {
  try {
    const { email, name, type, reviewData } = await req.json()
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

    const userName = name || email.split("@")[0]
    const isLeadMagnet = type === "leadmagnet"
    const isReview = type === "review"

    // ─── Отзыв — отправляем на твою почту ───
    if (isReview && reviewData) {
      const reviewHtml = `
        <div style="font-family:Georgia,serif;padding:24px;background:#f4efe6;">
          <h2 style="color:#3d2b1f;">Новый отзыв на ATELIER</h2>
          <p><strong>Имя:</strong> ${reviewData.name}</p>
          <p><strong>Город:</strong> ${reviewData.city || "не указан"}</p>
          <p><strong>Рейтинг:</strong> ${"⭐".repeat(reviewData.rating)}</p>
          <p style="padding:10px 14px;background:#fdf8f2;border-radius:8px;font-size:13px;color:#6b5744;">
            <strong>Отправлено зарегистрированным пользователем:</strong><br>
            Email аккаунта: ${reviewData.userEmail || "неизвестно"}<br>
            ID пользователя: ${reviewData.userId || "неизвестно"}
          </p>
          <p><strong>Текст:</strong></p>
          <blockquote style="border-left:3px solid #c8a882;padding-left:16px;color:#6b5744;">
            ${reviewData.text}
          </blockquote>
        </div>`

      const reviewResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: ["arseniyy.petrov.08@mail.ru"],
          subject: `⭐ Новый отзыв от ${reviewData.name}`,
          html: reviewHtml,
        }),
      })

      // ВАЖНО: раньше ошибка отправки здесь не проверялась вообще —
      // письмо могло не уйти, а сайт всё равно показывал "Спасибо за отзыв!"
      if (!reviewResp.ok) {
        const err = await reviewResp.text()
        console.error("Resend review error:", err)
        return NextResponse.json({ error: "Email send failed" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    const subject = isLeadMagnet
      ? `Ваши 5 советов по стилю от ATELIER 🎨`
      : `Добро пожаловать в ATELIER, ${userName}! 👗`

    const html = isLeadMagnet ? `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>5 советов по стилю — ATELIER</title></head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#3d2b1f;padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#f4efe6;font-size:28px;letter-spacing:6px;font-weight:400;">ATELIER</h1>
            <p style="margin:8px 0 0;color:#c8a882;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Персональный AI-стилист</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 16px;color:#3d2b1f;font-size:24px;font-weight:400;">Ваши 5 советов по стилю 🎨</h2>
            <p style="margin:0 0 24px;color:#6b5744;font-size:15px;line-height:1.7;">Как и обещали — вот персональные советы которые помогут одеваться увереннее.</p>

            ${[
              ["Выбирайте цвета под свой цветотип", "Холодные оттенки (синий, серый, бургунди) идут людям с холодным цветотипом. Тёплые (бежевый, терракота, оливковый) — тёплому. Ошибка в цвете делает лицо усталым."],
              ["Один акцент на образ", "Если у вас яркая вещь — остальное должно быть нейтральным. Два акцента в одном образе создают визуальный шум."],
              ["Инвестируйте в базу", "5 качественных базовых вещей дают больше образов, чем 20 трендовых. База — это белая рубашка, прямые брюки, нейтральный блейзер."],
              ["Пропорции важнее размера", "Объёмный верх — заужанный низ. Приталенный верх — прямой низ. Это работает для любого типа фигуры."],
              ["Обувь задаёт тон образу", "Нюдовые туфли удлиняют ногу. Массивная обувь добавляет объём. Выбирайте исходя из желаемого эффекта, а не только от погоды."],
            ].map(([title, text], i) => `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="padding:16px;background:#fdf8f2;border-radius:12px;border-left:3px solid #c8a882;">
                  <div style="color:#3d2b1f;font-size:15px;font-weight:600;margin-bottom:6px;">${i+1}. ${title}</div>
                  <div style="color:#6b5744;font-size:14px;line-height:1.6;">${text}</div>
                </td>
              </tr>
            </table>`).join("")}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr><td align="center">
                <a href="https://atelier-ai.ru" style="display:inline-block;background:#8B6550;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:99px;font-size:14px;letter-spacing:1px;">
                  Получить персональный разбор →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f4ee;padding:24px 40px;text-align:center;border-top:1px solid #f0e8dc;">
            <p style="margin:0;color:#9b7b62;font-size:12px;line-height:1.6;">
              ATELIER · Персональный AI-стилист<br>
              <a href="#" style="color:#9b7b62;">Отписаться</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>` : `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>Добро пожаловать в ATELIER</title></head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#3d2b1f;padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#f4efe6;font-size:28px;letter-spacing:6px;font-weight:400;">ATELIER</h1>
            <p style="margin:8px 0 0;color:#c8a882;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Персональный AI-стилист</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 16px;color:#3d2b1f;font-size:24px;font-weight:400;">Добро пожаловать, ${userName}! 👗</h2>
            <p style="margin:0 0 20px;color:#6b5744;font-size:15px;line-height:1.7;">Вы успешно зарегистрировались в ATELIER — персональном AI-стилисте.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr><td align="center">
                <a href="https://atelier-ai.ru" style="display:inline-block;background:#8B6550;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:99px;font-size:14px;letter-spacing:1px;">
                  Начать разбор →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f4ee;padding:24px 40px;text-align:center;border-top:1px solid #f0e8dc;">
            <p style="margin:0;color:#9b7b62;font-size:12px;">ATELIER · Персональный AI-стилист</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Resend error:", err)
      return NextResponse.json({ error: "Email send failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("Email route error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
