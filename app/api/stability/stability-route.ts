// app/api/stability/route.ts
// Серверный роут — ключ Stability AI не виден пользователям

import { NextRequest, NextResponse } from "next/server"

const STABILITY_API_KEY = process.env.STABILITY_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, width = 1024, height = 1024 } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 })
    }

    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [
            { text: prompt, weight: 1 },
            { text: negativePrompt || "low quality, blurry, watermark", weight: -1 },
          ],
          cfg_scale: 7,
          height,
          width,
          steps: 30,
          samples: 1,
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error("Stability error:", err)
      return NextResponse.json({ error: "Stability API error" }, { status: response.status })
    }

    const data = await response.json()
    const base64 = data.artifacts?.[0]?.base64

    if (!base64) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 })
    }

    return NextResponse.json({ image: `data:image/png;base64,${base64}` })
  } catch (e) {
    console.error("Stability route error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
