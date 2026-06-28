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
  const seed = Math.floor(Math.random() * 9999)
  // Возвращаем URL напрямую без fetch — браузер сам загрузит изображение
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=640&nologo=true&seed=${seed}`
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
  const prompt = `${genderWord} wearing ${items} ${colorType} colors ${occasion} fashion editorial photography elegant modern high quality`
  const seed = Math.floor(Math.random() * 9999)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=768&nologo=true&seed=${seed}`
}
