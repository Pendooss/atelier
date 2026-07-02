"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Bot, Check, Lock, Wand2, Shield, Layers } from "lucide-react"
import { getPurchases } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { StylistResult } from "@/lib/stylist-data"

const SUPPORT_EMAIL = "arseniyy.petrov.08@mail.ru"

// ─── 4 услуги ──────────────────────────────────────────────
const features = [
  {
    id: "outfits",
    icon: Wand2,
    title: "Готовые образы",
    price: "899 ₽",
    amount: "899.00",
    pitch: "4 полных лука с фото — открыли и сразу знаете как одеться.",
    transform: "Больше не думаете «что надеть»",
    bullets: ["4 лука с фото", "Работа, свидание, прогулка, выход", "Под ваш тип фигуры"],
    badge: "Популярно",
    href: "/results/outfits",
    kind: "onetime" as const,
  },
  {
    id: "visual",
    icon: Layers,
    title: "Гардероб и шопинг",
    price: "699 ₽",
    amount: "699.00",
    pitch: "Фото вещей под ваш цветотип + конкретные вещи в Zara, H&M и Uniqlo с ценами.",
    transform: "Знаете что покупать и где это найти",
    bullets: ["Визуальный гардероб", "Магазины с прямыми ссылками", "Бренды под ваш тип"],
    badge: "Хит",
    href: "/results/wardrobe",
    kind: "onetime" as const,
  },
  {
    id: "mycloset",
    icon: Bot,
    title: "Мой шкаф + AI-чат",
    price: "599 ₽/мес",
    amount: "599.00",
    pitch: "AI анализирует ваши вещи и составляет образы. Плюс личный стилист в чате 24/7.",
    transform: "Открываете шкаф и всегда знаете что надеть",
    bullets: ["Образы из ваших вещей", "AI-стилист отвечает за секунды", "Знает ваш профиль"],
    badge: "Новинка",
    href: "/results/my-closet",
    kind: "subscription" as const,
  },
  {
    id: "wardrobe",
    icon: Check,
    title: "Капсульный гардероб",
    price: "299 ₽/мес",
    pitch: "12 базовых вещей под вашу палитру — и у вас 40+ образов на любой случай.",
    transform: "Капсульный гардероб за один вечер",
    bullets: ["12 вещей = 40+ образов", "С фото каждой вещи", "Под вашу палитру"],
    badge: null,
    amount: "299.00",
    href: "/results/wardrobe-personal",
    kind: "subscription" as const,
  },
]

// ─── Пакеты: разовые услуги навсегда / подписки со скидкой ───
const oneTimeFeatures = features.filter((f) => f.kind === "onetime")
const subscriptionFeatures = features.filter((f) => f.kind === "subscription")

const oneTimeOriginalPrice = oneTimeFeatures.reduce((sum, f) => sum + parseFloat(f.amount), 0)
const subscriptionOriginalPrice = subscriptionFeatures.reduce((sum, f) => sum + parseFloat(f.amount), 0)

const bundles = [
  {
    id: "bundle-onetime",
    title: "Все разовые услуги",
    description: "Готовые образы + Гардероб и шопинг — покупаете один раз, доступ остаётся навсегда.",
    amount: "990.00",
    price: "990 ₽",
    originalPrice: `${oneTimeOriginalPrice} ₽`,
    economyPercent: Math.round((1 - 990 / oneTimeOriginalPrice) * 100),
    featureIds: oneTimeFeatures.map((f) => f.id),
    period: null as null | "month",
  },
  {
    id: "bundle-subscription",
    title: "Все подписки",
    description: "Мой шкаф + AI-чат и Капсульный гардероб — одной подпиской вместо двух, дешевле каждый месяц.",
    amount: "400.00",
    price: "400 ₽/мес",
    originalPrice: `${subscriptionOriginalPrice} ₽/мес`,
    economyPercent: Math.round((1 - 400 / subscriptionOriginalPrice) * 100),
    featureIds: subscriptionFeatures.map((f) => f.id),
    period: "month" as null | "month",
  },
]

const SOCIAL_PROOFS = [
  "Анна из Москвы только что прошла разбор",
  "Дмитрий открыл Готовые образы",
  "Елена из СПб получила свою палитру",
  "Ольга загрузила свой шкаф",
  "Михаил прошёл разбор 2 минуты назад",
  "Наташа открыла AI-стилист в чате",
]

// ─── Поп-ап: один раз за сессию, на мобильном снизу ──────────
function SocialProofPopup() {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState("")
  const [done, setDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    setIsMobile(window.innerWidth < 640)

    // Один раз за сессию
    const shown = sessionStorage.getItem("atelier_popup_shown")
    if (shown) return

    const randomText = SOCIAL_PROOFS[Math.floor(Math.random() * SOCIAL_PROOFS.length)]
    const timer = setTimeout(() => {
      setText(randomText)
      setVisible(true)
      sessionStorage.setItem("atelier_popup_shown", "1")
      setTimeout(() => {
        setVisible(false)
        setTimeout(() => setDone(true), 600)
      }, 4000)
    }, 8000)

    return () => clearTimeout(timer)
  }, [])

  if (done) return null

  return (
    <>
      {/* Десктоп — в левом нижнем углу */}
      <div className={`fixed bottom-6 left-6 z-50 hidden sm:block max-w-xs transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm">✨</div>
          <div>
            <div className="text-sm font-medium text-foreground">{text}</div>
            <div className="text-xs text-muted-foreground">только что</div>
          </div>
        </div>
      </div>

      {/* Мобильный — снизу во всю ширину */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}>
        <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-3 shadow-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm">✨</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">{text}</div>
            <div className="text-xs text-muted-foreground">только что</div>
          </div>
        </div>
      </div>
    </>
  )
}

export function PremiumSection({
  user, result, onAuthRequired,
}: {
  user: User | null
  result: StylistResult
  onAuthRequired: () => void
}) {
  const router = useRouter()
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [loadingBundle, setLoadingBundle] = useState<string | null>(null)

  // Загружаем реальные покупки пользователя (с учётом срока действия подписок)
  useEffect(() => {
    if (!user) {
      setUnlocked([])
      return
    }
    getPurchases(user.id)
      .then((purchases) => {
        const now = Date.now()
        const active = purchases
          .filter((p) => !p.expires_at || new Date(p.expires_at).getTime() > now)
          .map((p) => p.service_id)
        setUnlocked(active)
      })
      .catch(() => {})
  }, [user])

  async function handleUnlock(feature: typeof features[0]) {
    if (!user) { onAuthRequired(); return }

    // Если уже куплено — открываем сразу
    if (unlocked.includes(feature.id)) {
      localStorage.setItem("atelier_result", JSON.stringify(result))
      window.location.href = feature.href
      return
    }

    setLoading(feature.id)
    try {
      // Создаём платёж через ЮКассу
      const returnUrl = `${window.location.origin}${feature.href}?paid=1`
      const resp = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: (feature as any).amount || "299.00",
          description: `ATELIER: ${feature.title}`,
          featureId: feature.id,
          userId: user.id,
          returnUrl,
        }),
      })
      const data = await resp.json()
      if (data.confirmationUrl) {
        // Сохраняем результат перед переходом на оплату
        localStorage.setItem("atelier_result", JSON.stringify(result))
        // Редиректим на страницу оплаты ЮКассы
        window.location.href = data.confirmationUrl
        return
      }

      // API ответил, но без confirmationUrl
      console.error("No confirmationUrl in response:", data)
      alert("Не удалось создать платёж. Попробуйте ещё раз или напишите в поддержку.")
    } catch (e) {
      console.error("Payment error:", e)
      alert("Ошибка при создании платежа. Попробуйте ещё раз.")
    } finally {
      setLoading(null)
    }
  }

  async function handleUnlockBundle(bundle: typeof bundles[0]) {
    if (!user) { onAuthRequired(); return }

    setLoadingBundle(bundle.id)
    try {
      const returnUrl = `${window.location.origin}/?step=3&paid=${bundle.id}`
      const resp = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: bundle.amount,
          description: `ATELIER: ${bundle.title}`,
          // Список услуг пакета передаём через запятую — вебхук разобьёт
          // эту строку и запишет покупку для каждой услуги отдельно
          featureId: bundle.featureIds.join(","),
          userId: user.id,
          returnUrl,
        }),
      })
      const data = await resp.json()
      if (data.confirmationUrl) {
        localStorage.setItem("atelier_result", JSON.stringify(result))
        window.location.href = data.confirmationUrl
        return
      }

      console.error("No confirmationUrl in response:", data)
      alert("Не удалось создать платёж. Попробуйте ещё раз или напишите в поддержку.")
    } catch (e) {
      console.error("Bundle payment error:", e)
      alert("Ошибка при создании платежа. Попробуйте ещё раз.")
    } finally {
      setLoadingBundle(null)
    }
  }

  return (
    <>
      <SocialProofPopup />
      <section className="mt-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
            <Lock className="h-3.5 w-3.5" />Премиум-возможности
          </span>
          <h2 className="mt-4 font-serif text-3xl">Превратите разбор в реальный гардероб</h2>
          <p className="mx-auto mt-2 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Базовый разбор показал направление. Платные услуги дадут конкретные вещи, образы и ответы на любые вопросы.
          </p>
          {!user && (
            <p className="mt-2 text-sm text-muted-foreground">
              <button onClick={onAuthRequired} className="text-accent underline underline-offset-2 hover:no-underline">
                Войдите или зарегистрируйтесь
              </button>, чтобы открыть услуги
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-center">
          <Shield className="h-4 w-4 text-accent" />
          <span className="text-sm text-foreground">
            <strong>Гарантия возврата 24 часа</strong> — не понравилось? Вернём деньги без вопросов.
          </span>
        </div>

        {/* 4 услуги в сетке 2x2 */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {features.map((f) => {
            const isUnlocked = unlocked.includes(f.id)
            const isLoading = loading === f.id
            return (
              <div key={f.id} className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-all hover:shadow-md",
                isUnlocked ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/50",
              )}>
                {f.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                    {f.badge}
                  </span>
                )}
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-accent">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.pitch}</p>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent/5 px-3 py-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span className="text-xs text-foreground italic">{f.transform}</span>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-accent shrink-0" />{b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-serif text-lg">{f.price}</span>
                    <Button size="sm" variant={isUnlocked ? "outline" : "default"} disabled={isLoading} onClick={() => handleUnlock(f)}>
                      {isLoading ? "Перенаправляем..." : isUnlocked ? "Открыть →" : user ? `Оплатить ${f.price}` : "Войти и открыть"}
                    </Button>
                  </div>
                  {!isUnlocked && (
                    <div className="flex items-center justify-end gap-1">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <a
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Запрос возврата — " + f.title)}`}
                        className="text-[11px] text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
                      >
                        Возврат 24 часа
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Пакетные предложения: разовые услуги навсегда / все подписки со скидкой */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {bundles.map((bundle) => {
            const isLoading = loadingBundle === bundle.id
            // Пакет считается уже купленным, если ВСЕ входящие в него услуги
            // уже открыты (куплены отдельно или тем же пакетом ранее) —
            // без этой проверки можно было случайно оплатить пакет повторно
            const isBundleUnlocked = bundle.featureIds.every((id) => unlocked.includes(id))
            return (
              <div
                key={bundle.id}
                className="flex flex-col justify-between rounded-2xl border border-dashed border-accent/40 bg-accent/10 p-6"
              >
                <div>
                  <div className="mb-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
                    Выгоднее — экономия {bundle.economyPercent}%
                  </div>
                  <h3 className="font-serif text-xl">{bundle.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{bundle.description}</p>
                </div>
                <div className="mt-5 flex flex-col items-start gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground line-through text-sm">{bundle.originalPrice}</span>
                    <span className="font-serif text-2xl font-semibold text-foreground">{bundle.price}</span>
                  </div>
                  {isBundleUnlocked ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/10 py-2.5 text-sm font-medium text-accent">
                      <Check className="h-4 w-4" />Уже куплено
                    </div>
                  ) : (
                    <Button
                      onClick={() => (user ? handleUnlockBundle(bundle) : onAuthRequired())}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? "Перенаправляем..." : user ? "Оформить" : "Войти и оформить"}
                    </Button>
                  )}
                  {!isBundleUnlocked && (
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      <a
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Запрос возврата — " + bundle.title)}`}
                        className="text-[11px] text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
                      >
                        Возврат 24 часа
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
