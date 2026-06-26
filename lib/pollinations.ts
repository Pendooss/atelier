// lib/pollinations.ts
// Генерация изображений через Pollinations AI — бесплатно, без ключа

// Генерация фото одежды
export async function generateClothingImage(
  itemName: string,
  colorName: string,
  gender: "male" | "female"
): Promise<string | null> {
  const genderWord = gender === "male" ? "mens" : "womens"
  const prompt = `${genderWord} ${itemName} ${colorName} color fashion clothing studio white background minimal elegant product photo`
  
  try {
    const encodedPrompt = encodeURIComponent(prompt)
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=640&nologo=true&seed=${Math.floor(Math.random() * 1000)}`
    
    // Проверяем что изображение загружается
    const resp = await fetch(url)
    if (!resp.ok) return null
    
    return url
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
  const items = itemNames.slice(0, 3).join(" ")
  const prompt = `${genderWord} wearing ${items} ${colorType} colors ${occasion} fashion editorial photography elegant modern high quality`

  try {
    const encodedPrompt = encodeURIComponent(prompt)
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&nologo=true&seed=${Math.floor(Math.random() * 1000)}`
    
    const resp = await fetch(url)
    if (!resp.ok) return null
    
    return url
  } catch {
    return null
  }
}
