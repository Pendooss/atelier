"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Briefcase, Heart, Sun, Sparkles, ZoomIn, X, Wand2, Image } from "lucide-react"
import Link from "next/link"
import { getOutfitPhoto, getWardrobeItemPhoto } from "@/lib/unsplash"
import { generateClothingImage } from "@/lib/pollinations"
import type { StylistResult } from "@/lib/stylist-data"

type ImageMode = "unsplash" | "stability"

interface OutfitDef {
  id: "work" | "date" | "walk" | "event"
  label: string
  icon: typeof Briefcase
  color: string
}

const OUTFIT_DEFS: OutfitDef[] = [
  { id: "work", label: "Работа", icon: Briefcase, color: "#c8a882" },
  { id: "date", label: "Свидание", icon: Heart, color: "#e8c4b8" },
  { id: "walk", label: "Прогулка", icon: Sun, color: "#c4b5d4" },
  { id: "event", label: "Выход", icon: Sparkles, color: "#9fb3a8" },
]

// ─── Подбор вещей под повод и пол ────────────────────────
function getOutfitItems(occasion: OutfitDef["id"], gender: "male" | "female", result: StylistResult): string[] {
  const items = result.recommendedItems
  const maleSets: Record<OutfitDef["id"], string[]> = {
    work: [items[0] || "Пиджак", "Рубашка", items[1] || "Прямые брюки", "Лоферы"],
    date: [items[3] || "Джемпер", "Чиносы", "Ботинки", "Часы"],
    walk: ["Поло", items[4] || "Чиносы", "Кроссовки", "Бейсболка"],
    event: [items[0] || "Пиджак", items[1] || "Прямые брюки", "Туфли", "Ремень"],
  }
  const femaleSets: Record<OutfitDef["id"], string[]> = {
    work: [items[0] || "Блейзер", items[1] || "Прямые брюки", "Лоферы", "Сумка-тоут"],
    date: [items[2] || "Платье миди", "Каблуки", "Клатч", "Серьги"],
    walk: ["Джемпер", items[4] || "Широкие джинсы", "Кеды", "Кросс-боди"],
    event: [items[2] || "Платье миди", "Туфли на каблуке", "Клатч", "Украшения"],
  }
  return gender === "male" ? maleSets[occasion] : femaleSets[occasion]
}

// ─── Лайтбокс для просмотра фото ─────────────────────────
function Lightbox({ photoUrl, name, onClose }: { photoUrl: string; name: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden"
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
        <X className="h-5 w-5" />
      </button>
      <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img src={photoUrl} alt={name} className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl" />
        <div className="mt-3 text-center text-sm text-white/70">{name}</div>
      </div>
    </div>
  )
}

// ─── Карточка одной вещи в образе ─────────────────────────
function OutfitItemPhoto({ itemName, gender, color, mode, onOpenLightbox }: {
  itemName: string
  gender: "male" | "female"
  color: string
  mode: ImageMode
  onOpenLightbox: (url: string, name: string) => void
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setPhotoUrl(null)
    if (mode === "stability") {
      generateClothingImage(itemName, color, gender).then((url) => {
        setPhotoUrl(url)
        setLoading(false)
      })
    } else {
      getWardrobeItemPhoto(itemName, gender).then((p) => {
        if (p) setPhotoUrl(p.url)
        setLoading(false)
      })
    }
  }, [itemName, gender, color, mode])

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-xl border border-border/60 cursor-pointer group"
      onClick={() => photoUrl && onOpenLightbox(photoUrl, itemName)}
    >
      {loading ? (
        <div className="flex h-full w-full items-center justify-center bg-secondary">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : photoUrl ? (
        <>
          <img src={photoUrl} alt={itemName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
            <ZoomIn className="h-5 w-5 text-white" />
          </div>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(145deg, ${color}33, ${color}66)` }}>
          <span className="text-3xl">👕</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
        <span className="text-[10px] font-medium text-white">{itemName}</span>
      </div>
    </div>
  )
}

// ─── Карточка целого образа (повод) ──────────────────────
function OutfitCard({ def, items, gender, colorType, mode, onOpenLightbox }: {
  def: OutfitDef
  items: string[]
  gender: "male" | "female"
  colorType: string
  mode: ImageMode
  onOpenLightbox: (url: string, name: string) => void
}) {
  const [heroUrl, setHeroUrl] = useState<string | null>(null)
  const [heroLoading, setHeroLoading] = useState(true)
  const Icon = def.icon

  useEffect(() => {
    setHeroLoading(true)
    getOutfitPhoto(def.id, colorType, gender).then((p) => {
      if (p) setHeroUrl(p.url)
      setHeroLoading(false)
    })
  }, [def.id, colorType, gender])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Главное фото образа */}
      <div
        className="relative overflow-hidden cursor-pointer group"
        style={{ height: "260px" }}
        onClick={() => heroUrl && onOpenLightbox(heroUrl, def.label)}
      >
        {heroLoading ? (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : heroUrl ? (
          <>
            <img src={heroUrl} alt={def.label} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(160deg, ${def.color}44, ${def.color}88)` }}>
            <Icon className="h-12 w-12 text-foreground/40" />
          </div>
        )}
        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-foreground shadow-sm">{def.label}</span>
        </div>
      </div>

      {/* Вещи образа */}
      <div className="p-5">
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <OutfitItemPhoto key={`${item}-${mode}`} itemName={item} gender={gender} color={def.color} mode={mode} onOpenLightbox={onOpenLightbox} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OutfitsPage() {
  const [result, setResult] = useState<StylistResult | null>(null)
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null)
  const [imageMode, setImageMode] = useState<ImageMode>("unsplash")

  useEffect(() => {
    const saved = localStorage.getItem("atelier_result")
    if (saved) setResult(JSON.parse(saved))
  }, [])

  if (!result) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Данные не найдены.</p>
        <Link href="/?step=3" className="mt-4 inline-block text-accent underline">К результатам</Link>
      </div>
    </div>
  )

  const gender = result.gender ?? "female"

  return (
    <main className="min-h-screen bg-background">
      {lightbox && (
        <Lightbox photoUrl={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />
      )}

      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/?step=3" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />Назад
          </Link>
          <span className="font-serif text-xl tracking-wide">ATELIER</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Премиум · 899 ₽</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Готовые образы</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            4 полных лука под ваш цветотип <strong>{result.colorType}</strong> — для работы, свидания, прогулки и выхода.
            <span className="block mt-1 text-xs text-muted-foreground/70">Нажмите на фото для просмотра</span>
          </p>
        </div>

        {/* Переключатель фото */}
        <div className="mb-5 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Фотографии:</span>
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button onClick={() => setImageMode("unsplash")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "unsplash" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
              <Image className="h-3 w-3" />Unsplash
            </button>
            <button onClick={() => setImageMode("stability")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "stability" ? "bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
              <Wand2 className="h-3 w-3" />AI-генерация
            </button>
          </div>
          {imageMode === "stability" && <span className="text-xs text-muted-foreground italic">~30 сек/фото</span>}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {OUTFIT_DEFS.map((def) => (
            <OutfitCard
              key={def.id}
              def={def}
              items={getOutfitItems(def.id, gender, result)}
              gender={gender}
              colorType={result.colorType}
              mode={imageMode}
              onOpenLightbox={(url, name) => setLightbox({ url, name })}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Фотографии предоставлены{" "}
          <a href="https://unsplash.com?utm_source=atelier&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Unsplash</a>
        </p>
      </div>
    </main>
  )
}
