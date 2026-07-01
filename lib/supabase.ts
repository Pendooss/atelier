// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
})

// ─── ТИПЫ ──────────────────────────────────────────────────

export type Profile = {
  id: string
  name: string
  email: string
  created_at: string
}

export type Purchase = {
  id: string
  user_id: string
  service_id: string
  service_name: string
  price: string
  purchased_at: string
}

export type StyleResult = {
  id: string
  user_id: string
  result: any
  created_at: string
}

// ─── АВТОРИЗАЦИЯ ───────────────────────────────────────────

// Регистрация
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })
  if (error) throw error
  return data
}

// Вход
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

// Выход
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Текущий пользователь
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Профиль пользователя
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

// ─── ПОКУПКИ ───────────────────────────────────────────────

// Добавить покупку
export async function addPurchase(
  userId: string,
  serviceId: string,
  serviceName: string,
  price: string
) {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      user_id: userId,
      service_id: serviceId,
      service_name: serviceName,
      price
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Получить все покупки пользователя
export async function getPurchases(userId: string): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false })
  if (error) return []
  return data
}

// Проверить куплена ли услуга
export async function hasPurchased(userId: string, serviceId: string): Promise<boolean> {
  const { data } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('service_id', serviceId)
    .single()
  return !!data
}

// ─── РАЗБОРЫ ───────────────────────────────────────────────

// Сохранить результат разбора
export async function saveStyleResult(userId: string, result: any) {
  const { data, error } = await supabase
    .from('style_results')
    .insert({ user_id: userId, result })
    .select()
    .single()
  if (error) throw error
  return data
}

// Получить все разборы пользователя
export async function getStyleResults(userId: string): Promise<StyleResult[]> {
  const { data, error } = await supabase
    .from('style_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

// Последний разбор пользователя
export async function getLatestStyleResult(userId: string): Promise<StyleResult | null> {
  const { data, error } = await supabase
    .from('style_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}

// ─── ФОТО ПОЛЬЗОВАТЕЛЯ ────────────────────────────────────

// Конвертирует dataURL (base64) в Blob
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",")
  const mimeMatch = header.match(/data:(.*?);base64/)
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg"
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
  return new Blob([array], { type: mime })
}

// Загружает фото (base64 dataURL) в bucket user-photos, возвращает публичный URL
export async function uploadUserPhoto(
  dataUrl: string,
  prefix: string = "photo"
): Promise<string | null> {
  try {
    const blob = dataUrlToBlob(dataUrl)
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`

    const { error } = await supabase.storage
      .from("user-photos")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: false })

    if (error) {
      console.error("Photo upload error:", error)
      return null
    }

    const { data } = supabase.storage.from("user-photos").getPublicUrl(fileName)
    return data.publicUrl
  } catch (e) {
    console.error("uploadUserPhoto error:", e)
    return null
  }
}
