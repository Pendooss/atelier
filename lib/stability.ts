// lib/stability.ts
// Клиентская утилита — вызывает наш серверный роут

// Генерация фото одежды
export async function generateClothingImage(
  itemName: string,
  colorName: string,
  gender: "male" | "female"
): Promise<string | null> {
  const genderWord = gender === "male" ? "men's" : "women's"
  const prompt = `${genderWord} ${itemName}, ${colorName} color, fashion photography, white background, studio lighting, minimal, elegant, high quality clothing item, product photo`
  const negativePrompt = "person, model, body, face, hands, clutter, low quality, blurry, watermark, text"

  try {
    const resp = await fetch("/api/stability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, negativePrompt, width: 1024, height: 1024 }),
    })
    if (!resp.ok) return null
    const data = await resp.json()
    return data.image || null
  } catch {
    return null
  }
}

// Генерация фото образа
export async function generateOutfitImage(
  occasion: string,
  colorType: string,
  gender: "male" | "female",
  itemNames: string[]
): Promise<string | null> {
  const genderWord = gender === "male" ? "stylish man" : "stylish woman"
  const items = itemNames.slice(0, 3).join(", ")
  const prompt = `${genderWord} wearing ${items}, ${colorType} color palette, ${occasion} fashion, editorial photography, elegant, modern, high quality`
  const negativePrompt = "ugly, deformed, bad anatomy, low quality, blurry, watermark, text"

  try {
    const resp = await fetch("/api/stability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, negativePrompt, width: 768, height: 1024 }),
    })
    if (!resp.ok) return null
    const data = await resp.json()
    return data.image || null
  } catch {
    return null
  }
}
