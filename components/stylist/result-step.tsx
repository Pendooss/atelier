"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  buildRecommendation,
  bodyTypes,
  faceShapes,
  type StylistForm,
} from "@/lib/stylist-data"
import {
  Check,
  RotateCcw,
  Shirt,
  Sparkles,
  X,
  Glasses,
  Tag,
  Share2,
  Download,
  Copy,
} from "lucide-react"
import { PremiumSection } from "./premium-section"
import { useRouter } from "next/navigation"
import { addPurchase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

// ─── Кнопка "Рекомендуем начать с этого" ─────────────────
function NextStepButton({
  user,
  result,
  onAuthRequired,
}: {
  user: User | null
  result: ReturnType<typeof buildRecommendation>
  onAuthRequired: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!user) { onAuthRequired(); return }
    setLoading(true)
    try {
      localStorage.setItem("atelier_result", JSON.stringify(result))
      const resp = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: "899.00",
          description: "ATELIER: Готовые образы",
          featureId: "outfits",
        }),
      })
      const data = await resp.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
        return
      }
    } catch {}
    // Фоллбэк — открываем без оплаты
    window.location.href = "/results/outfits"
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-2xl bg-accent px-7 py-3.5 text-base font-semibold text-accent-foreground shadow-md transition-all hover:bg-accent/90 hover:shadow-lg disabled:opacity-60"
    >
      {loading ? "Перенаправляем..." : user ? "Открыть за 899 ₽" : "Войти и открыть"}
    </button>
  )
}

// ─── Палитра с кнопкой копирования HEX ──────────────────
function PaletteWithCopy({ palette }: { palette: { name: string; hex: string }[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      alert(hex)
    }
  }

  return (
    <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
      {palette.map((c) => (
        <div key={c.name} className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => copyHex(c.hex)}
            title={`Скопировать ${c.hex}`}
            className="group relative aspect-square w-full overflow-hidden rounded-xl border border-border transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: c.hex }}
          >
            {/* Оверлей при наведении */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <span className="text-[10px] font-mono text-white opacity-0 transition-opacity group-hover:opacity-100">
                {copied === c.hex ? "✓" : "copy"}
              </span>
            </div>
          </button>
          <span className="text-center text-[10px] leading-tight text-muted-foreground">
            {c.name}
          </span>
          <span className="text-center text-[9px] font-mono text-muted-foreground/60">
            {copied === c.hex ? "✓ скопировано" : c.hex}
          </span>
        </div>
      ))}
    </div>
  )
}

function FreeBadge() {
  return (
    <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-accent">
      Бесплатно
    </span>
  )
}

// ─── Модальное окно с карточкой для шаринга ──────────────
function ShareModal({
  rec,
  onClose,
}: {
  rec: ReturnType<typeof buildRecommendation>
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  async function handleDownload() {
    if (!cardRef.current) return
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      })
      const link = document.createElement("a")
      link.download = "atelier-разбор.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch {
      alert("Не удалось скачать. Попробуйте сделать скриншот вручную.")
    }
  }

  async function handleCopyText() {
    const text = `🎨 Мой цветотип: ${rec.colorType}
👗 Тип стиля: ${rec.typeTitle}
🎯 Палитра: ${rec.palette.map(p => p.name).join(", ")}

Узнай свой стиль бесплатно → atelier-ai.ru`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert("Скопируйте текст вручную")
    }
  }

  async function handleShareLink() {
    const url = "https://atelier-ai.ru"
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      alert("Ссылка: " + url)
    }
  }

  function handleShareTelegram() {
    const text = encodeURIComponent(
      `🎨 Узнал свой цветотип ${rec.colorType} на ATELIER — бесплатном AI-стилисте!\n\nПопробуй сам: https://atelier-ai.ru`
    )
    window.open(`https://t.me/share/url?url=https%3A%2F%2Fatelier-ai.ru&text=${text}`, "_blank")
  }

  function handleShareInstagram() {
    // Instagram не поддерживает прямой шаринг ссылок — копируем текст и открываем Instagram
    const text = `🎨 Мой цветотип: ${rec.colorType} — ${rec.typeTitle}\n\nУзнай свой на atelier-ai.ru`
    navigator.clipboard.writeText(text).catch(() => {})
    window.open("https://www.instagram.com/", "_blank")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Карточка для шаринга */}
        <div ref={cardRef} style={{
          background: "linear-gradient(135deg, #3d2b1f 0%, #6b4c3b 50%, #3d2b1f 100%)",
          padding: "32px 28px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Декоративные круги */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 160, height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: -20,
            width: 100, height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />

          {/* Логотип */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 13,
              letterSpacing: "0.3em",
              color: "#c8a882",
              fontFamily: "Georgia, serif",
              textTransform: "uppercase",
            }}>ATELIER</div>
            <div style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(200,168,130,0.6)",
              marginTop: 2,
            }}>AI-СТИЛИСТ</div>
          </div>

          {/* Цветотип */}
          <div style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}>МОЙ ЦВЕТОТИП</div>
          <div style={{
            fontSize: 38,
            fontFamily: "Georgia, serif",
            color: "#f4efe6",
            lineHeight: 1.1,
            marginBottom: 4,
          }}>{rec.colorType}</div>
          <div style={{
            fontSize: 14,
            color: "#c8a882",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            marginBottom: 24,
          }}>{rec.typeTitle}</div>

          {/* Палитра */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>ЦВЕТОВАЯ ПАЛИТРА</div>
            <div style={{ display: "flex", gap: 8 }}>
              {rec.palette.map((c) => (
                <div key={c.name} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: c.hex,
                    border: "1px solid rgba(255,255,255,0.15)",
                    marginBottom: 4,
                  }} />
                  <div style={{
                    fontSize: 8,
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.2,
                  }}>{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ключевые рекомендации */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 16,
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>РЕКОМЕНДАЦИИ</div>
            {rec.recommendedItems.slice(0, 3).map((item) => (
              <div key={item} style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 4,
                paddingLeft: 12,
                position: "relative",
              }}>
                <span style={{
                  position: "absolute", left: 0,
                  color: "#c8a882",
                }}>·</span>
                {item}
              </div>
            ))}
          </div>

          {/* Ссылка */}
          <div style={{
            fontSize: 10,
            color: "rgba(200,168,130,0.6)",
            letterSpacing: "0.1em",
          }}>atelier-ai.ru · Бесплатный разбор</div>
        </div>

        {/* Кнопки действий */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-center text-muted-foreground mb-3">
            Поделитесь результатом с друзьями
          </p>
          {/* Скачать + копировать текст */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90">
              <Download className="h-4 w-4" />Скачать
            </button>
            <button onClick={handleCopyText}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
              <Copy className="h-4 w-4" />
              {copied ? "Скопировано!" : "Копировать текст"}
            </button>
          </div>
          {/* Telegram + ссылка */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleShareTelegram}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
              <span className="text-base leading-none">✈️</span>Telegram
            </button>
            <button onClick={handleShareLink}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
              <Share2 className="h-4 w-4" />
              {copiedLink ? "Скопировано!" : "Ссылка на сайт"}
            </button>
          </div>
          {/* Instagram */}
          <button onClick={handleShareInstagram}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
            <span className="text-base leading-none">📸</span>Поделиться в Instagram
          </button>
          <button onClick={onClose}
            className="w-full rounded-xl py-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Основной компонент результата ───────────────────────
export function ResultStep({
  form,
  user,
  onAuthRequired,
  onRestart,
}: {
  form: StylistForm
  user: User | null
  onAuthRequired: () => void
  onRestart: () => void
}) {
  const rec = buildRecommendation(form)
  const bodyType = bodyTypes.find((b) => b.id === form.bodyType)
  const faceShape = faceShapes.find((f) => f.id === form.faceShape)
  const [showShare, setShowShare] = useState(false)

  return (
    <div className="mx-auto max-w-3xl">
      {showShare && <ShareModal rec={rec} onClose={() => setShowShare(false)} />}

      {/* Заголовок */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Ваш разбор готов
        </span>
        <h1 className="mt-4 font-serif text-4xl">{rec.typeTitle}</h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          {rec.typeSummary}
        </p>

      </div>

      {/* Сводка */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5">
          {/* Цветовой блок вместо фото */}
          <div className="absolute inset-0 opacity-10"
            style={{ background: `linear-gradient(135deg, ${rec.palette[0]?.hex}, ${rec.palette[2]?.hex})` }} />
          <div className="relative flex items-center gap-4">
            {/* Мини-палитра */}
            <div className="flex shrink-0 flex-col gap-1.5">
              {rec.palette.slice(0, 4).map((c, i) => (
                <div key={i} className="h-10 w-10 rounded-lg border border-white/20 shadow-sm"
                  style={{ backgroundColor: c.hex }} />
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">Ваш цветотип</div>
              <div className="font-serif text-2xl font-semibold text-foreground">{rec.colorType}</div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Тип фигуры</dt>
                  <dd className="font-medium">{bodyType?.label ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Форма лица</dt>
                  <dd className="font-medium">{faceShape?.label ?? "Не указана"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Рост</dt>
                  <dd className="font-medium">{form.height || "—"} см</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Пол</dt>
                  <dd className="font-medium">{form.gender === "male" ? "Мужской" : "Женский"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/90 p-5">
          <h3 className="font-serif text-lg">Рекомендуемые силуэты</h3>
          <ul className="mt-3 space-y-2">
            {rec.silhouettes.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm">
                <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Палитра */}
      <div className="mt-4 rounded-2xl border border-border/80 bg-card/90 p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">1</span>
          <h3 className="font-serif text-xl">Ваша цветовая палитра</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Эти оттенки подчёркивают ваш колорит и сочетаются между собой.
        </p>
        <PaletteWithCopy palette={rec.palette} />
        {/* Практическая инструкция */}
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-3">
          <span className="text-base">💡</span>
          <p className="text-sm text-foreground">
            Сохраните палитру в телефон и возьмите её с собой на шопинг — так вы не купите лишнего
          </p>
        </div>
      </div>

      {/* Что носить / избегать */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-6">
          <h3 className="flex items-center gap-2 font-serif text-xl">
            <Check className="h-5 w-5 text-accent" />Что носить
          </h3>
          <ul className="mt-4 space-y-2.5">
            {rec.recommendedItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-6">
          <h3 className="flex items-center gap-2 font-serif text-xl">
            <X className="h-5 w-5 text-destructive" />Чего избегать
          </h3>
          <ul className="mt-4 space-y-2.5">
            {rec.avoid.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />{item}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg bg-secondary/70 px-4 py-3 text-sm leading-relaxed">
            <span className="font-medium">Причёска: </span>{rec.hairTip}
          </div>
        </div>
      </div>

      {/* Очки */}
      <div className="mt-4 rounded-2xl border border-border/80 bg-card/90 p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">2</span>
          <h3 className="flex items-center font-serif text-xl">
            <Glasses className="mr-2 h-5 w-5 text-accent" />Подбор очков<FreeBadge />
          </h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Рекомендации под форму лица: <strong>{faceShape?.label ?? "не указана"}</strong>
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Подойдут</div>
            <ul className="space-y-2">
              {rec.glasses.suitable.map((g) => (
                <li key={g} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{g}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-destructive">Не подойдут</div>
            <ul className="space-y-2">
              {rec.glasses.avoid.map((g) => (
                <li key={g} className="flex items-start gap-2 text-sm">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />{g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Обувь и ремень */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-6">
          <h3 className="flex items-center font-serif text-xl">
            <span className="mr-2 text-accent">👟</span>Обувь<FreeBadge />
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Подобрано под ваш тип фигуры</p>
          <ul className="mt-3 space-y-2">
            {rec.shoes.recommended.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{s}
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-destructive">Избегать</div>
            <ul className="space-y-1.5">
              {rec.shoes.avoid.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />{s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/90 p-6">
          <h3 className="flex items-center font-serif text-xl">
            <Tag className="mr-2 h-5 w-5 text-accent" />Ремень<FreeBadge />
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Цвет, ширина и советы</p>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Цвет</div>
              <div className="mt-1 text-sm">{rec.belt.color}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ширина</div>
              <div className="mt-1 text-sm">{rec.belt.width}</div>
            </div>
            <div className="rounded-lg bg-secondary/70 px-4 py-3 text-sm italic leading-relaxed">
              {rec.belt.tip}
            </div>
          </div>
        </div>
      </div>


      {/* ─── Следующий шаг ───────────────────────────────── */}
      <div className="mt-8 overflow-hidden rounded-2xl border-2 border-accent bg-card shadow-md">
        <div className="bg-accent/10 px-6 py-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            ⭐ Рекомендуем начать с этого
          </span>
        </div>
        <div className="flex flex-col items-center gap-5 px-6 py-7 sm:flex-row sm:gap-8">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-semibold text-foreground">
              Готовые образы
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              4 полных лука с фото — для работы, свидания, прогулки и выхода.
              Самая популярная услуга: открываете и сразу знаете что надеть.
            </p>
            {/* Мокапы образов */}
            <div className="mt-3 flex gap-2">
              {[
                { label: "Работа", icon: "💼", color: "#f4ede4", items: ["Блейзер", "Брюки", "Лоферы"] },
                { label: "Свидание", icon: "🌹", color: "#e8c4b8", items: ["Платье", "Каблуки", "Клатч"] },
                { label: "Прогулка", icon: "☀️", color: "#c4b5d4", items: ["Джинсы", "Свитер", "Кеды"] },
                { label: "Выход", icon: "✨", color: "#c8a882", items: ["Пиджак", "Брюки", "Туфли"] },
              ].map((outfit, i) => (
                <div key={i} className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60" style={{ background: `linear-gradient(160deg, ${outfit.color}44, ${outfit.color}88)` }}>
                  {/* Иконка */}
                  <div className="flex items-center justify-center pt-3 pb-1 text-lg">{outfit.icon}</div>
                  {/* Вещи */}
                  <div className="flex-1 px-1.5 pb-2 space-y-0.5">
                    {outfit.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: outfit.color }} />
                        <span className="text-[8px] text-foreground/70 truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Лейбл */}
                  <div className="border-t border-border/30 py-1 text-center">
                    <span className="text-[9px] font-semibold text-foreground/60">{outfit.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span className="font-serif text-2xl font-semibold text-foreground">899 ₽</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Популярно · 68% выбирают первым
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <NextStepButton user={user} result={rec} onAuthRequired={onAuthRequired} />
            <span className="text-[11px] text-muted-foreground">🔒 Возврат 24 часа</span>
          </div>
        </div>
      </div>

      {/* Премиум */}
      <PremiumSection user={user} result={rec} onAuthRequired={onAuthRequired} />

      {/* Нижние кнопки */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center px-4 sm:px-0">
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
        >
          <Share2 className="h-4 w-4" />
          Поделиться результатом
        </button>
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Пройти разбор заново
        </Button>
      </div>
    </div>
  )
}
