"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Palette, Shirt, Sparkles, Check, Star, ArrowRight, Mail, Loader2, MessageSquare } from "lucide-react"

const points = [
  {
    icon: Camera,
    title: "Загрузите фото",
    text: "Снимок в полный рост и портрет — этого достаточно для разбора.",
  },
  {
    icon: Sparkles,
    title: "AI определит тип фигуры",
    text: "Анализируем пропорции, форму лица и колорит вашей внешности.",
  },
  {
    icon: Shirt,
    title: "Получите фасоны",
    text: "Подбираем силуэты и вещи, которые подчеркнут ваши достоинства.",
  },
  {
    icon: Palette,
    title: "Личная палитра",
    text: "Цвета, в которых вы выглядите дороже и выразительнее.",
  },
]

const EXAMPLE_RESULT = {
  name: "Анна, 27 лет",
  typeTitle: "Мягкая романтика",
  colorType: "Лето",
  bodyType: "Среднее",
  palette: ["#c4b5d4", "#e8c4b8", "#8fa8bc", "#f4ede4", "#c9908a"],
  paletteNames: ["Лаванда", "Пудра", "Серо-голубой", "Молочный", "Роза"],
  wearItems: ["Пыльно-розовый блейзер", "Прямые брюки бежевого тона", "Платье-рубашка лавандового цвета"],
  glasses: "Кошачий глаз, тонкие округлые оправы",
  shoes: "Бежевые мюли, пудровые балетки",
}

const REVIEWS = [
  {
    name: "Мария Котова",
    initials: "МК",
    city: "Москва",
    date: "12 мая 2025",
    text: "Наконец-то поняла почему одни вещи мне идут, а другие нет. Определили цветотип Осень — и всё встало на места. Теперь не трачу деньги на вещи которые висят в шкафу.",
    rating: 5,
    service: "Визуальный гардероб",
    color: "#e8c4b8",
  },
  {
    name: "Дмитрий Соколов",
    initials: "ДС",
    city: "Санкт-Петербург",
    date: "3 июня 2025",
    text: "Скептически относился к стилистам, но попробовал. Разбор оказался точным — рекомендации по пиджакам и брюкам реально работают. Жена тоже прошла разбор.",
    rating: 5,
    service: "Готовые образы",
    color: "#c8a882",
  },
  {
    name: "Елена Власова",
    initials: "ЕВ",
    city: "Екатеринбург",
    date: "19 июня 2025",
    text: "Загрузила фото, получила палитру и список магазинов. Зашла в Zara с этим списком — нашла всё за час. Раньше тратила полдня и уходила ни с чем.",
    rating: 5,
    service: "Магазины",
    color: "#c4b5d4",
  },
]

const PRICE_COMPARE = [
  { label: "Консультация стилиста", price: "от 5 000 ₽", accent: false },
  { label: "ATELIER — полный доступ", price: "1 490 ₽/мес", accent: true },
  { label: "ATELIER — базовый разбор", price: "Бесплатно", accent: true },
]

// ─── Лид-магнит блок (компактный) ───────────────────────
function LeadMagnet() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit() {
    if (!email || !email.includes("@")) return
    setStatus("loading")
    try {
      await fetch("/api/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: "", type: "leadmagnet" }),
      })
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-6 py-4">
        <Check className="h-5 w-5 text-accent" />
        <p className="text-sm font-medium text-foreground">Советы отправлены — проверьте почту!</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-accent/30 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="h-5 w-5 text-accent shrink-0" />
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">5 советов по стилю — бесплатно</h3>
          <p className="text-xs text-muted-foreground">Не готовы к разбору? Пришлём советы на email</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="ваш@email.ru"
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading" || !email.includes("@")}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Получить →"}
        </button>
      </div>
      {status === "error" && <p className="mt-2 text-xs text-destructive">Ошибка. Попробуйте ещё раз.</p>}
      <p className="mt-2 text-xs text-muted-foreground">🔒 Не спамим · Отписаться в один клик</p>
    </div>
  )
}


// ─── Форма отзыва ────────────────────────────────────────
function ReviewForm() {
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [text, setText] = useState("")
  const [rating, setRating] = useState(5)
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")

  async function handleSubmit() {
    if (!name || !text) return
    setStatus("loading")
    try {
      await fetch("/api/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "support@atelier-ai.ru",
          name: "Новый отзыв",
          type: "review",
          reviewData: { name, city, text, rating },
        }),
      })
    } catch {}
    setStatus("success")
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Check className="h-7 w-7 text-accent" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground">Спасибо за отзыв!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Мы добавим его на сайт после проверки.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <MessageSquare className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">Оставить отзыв</h3>
          <p className="text-xs text-muted-foreground">Помогите другим узнать об ATELIER</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Рейтинг */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Оценка</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)}>
                <Star className={`h-6 w-6 transition-colors ${star <= rating ? "fill-accent text-accent" : "text-border"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Имя *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Город</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Москва"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Ваш отзыв *</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Расскажите как вам помог ATELIER..."
            rows={3}
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name || !text || status === "loading"}
          className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-50"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />Отправляем...
            </span>
          ) : "Отправить отзыв"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Отзыв появится на сайте после проверки
        </p>
      </div>
    </div>
  )
}

export function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-20">

      {/* ─── Герой ─────────────────────────────────────────── */}
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-card px-3 py-1 shadow-sm text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Персональный AI-стилист
          </span>
          <h1 className="mt-5 text-pretty font-serif text-4xl leading-tight sm:text-5xl">
            Откройте свой стиль за пять минут
          </h1>
          <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Загрузите фото — AI определит ваш цветотип, тип фигуры и форму лица.
            Получите персональную палитру, подбор очков, обуви и готовые образы.
            Консультация стилиста стоит от 5 000 ₽ — мы делаем то же самое бесплатно.
          </p>
          <p className="mt-3 text-xs text-muted-foreground/60">
            Создан Арсением из Костромы · работает на <span className="text-accent">Claude AI от Anthropic</span>
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.title}
                className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md">
                <p.icon className="h-5 w-5 text-accent" />
                <h3 className="mt-3 font-medium">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
          <Button onClick={onStart} size="lg" className="mt-8 h-12 px-8 text-base">
            Начать разбор бесплатно
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="block sm:inline">1 247 разборов за последние 30 дней</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">Бесплатно · ~5 минут</span>
          </p>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-2 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-stylist.png"
              alt="Стильно одетые мужчина и женщина в студии"
              className="h-full w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>
      </div>

      {/* ─── Пример результата ──────────────────────────────── */}
      <div>
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Пример разбора</span>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Вот что вы получите</h2>
          <p className="mt-2 text-sm text-muted-foreground">Реальный результат AI-анализа за 5 минут</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/60 bg-secondary/30 px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">Разбор готов</span>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">{EXAMPLE_RESULT.typeTitle}</h3>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{EXAMPLE_RESULT.name}</div>
                <div className="mt-0.5 flex items-center justify-end gap-2">
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{EXAMPLE_RESULT.colorType}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{EXAMPLE_RESULT.bodyType}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">Цветовая палитра</span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">Бесплатно</span>
              </div>
              <div className="flex gap-2">
                {EXAMPLE_RESULT.palette.map((hex, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="aspect-square w-full rounded-xl border border-border/50 shadow-sm" style={{ backgroundColor: hex }} />
                    <span className="text-center text-[9px] text-muted-foreground">{EXAMPLE_RESULT.paletteNames[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">Что носить</span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">Бесплатно</span>
              </div>
              <ul className="space-y-1.5">
                {EXAMPLE_RESULT.wearItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">👓</span>
                <span className="text-sm font-semibold text-foreground">Подбор очков</span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">Бесплатно</span>
              </div>
              <p className="text-sm text-muted-foreground">{EXAMPLE_RESULT.glasses}</p>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">👟</span>
                <span className="text-sm font-semibold text-foreground">Обувь</span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">Бесплатно</span>
              </div>
              <p className="text-sm text-muted-foreground">{EXAMPLE_RESULT.shoes}</p>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base">💇</span>
                <span className="text-sm font-semibold text-foreground">Причёска</span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">Бесплатно</span>
              </div>
              <p className="text-sm text-muted-foreground">{EXAMPLE_RESULT.hairTip}</p>
            </div>
          </div>
          <div className="border-t border-border/60 bg-accent/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Хотите такой же разбор? Это займёт 5 минут и бесплатно.</p>
              <button onClick={onStart}
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90">
                Попробовать <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Лид-магнит ─────────────────────────────────────── */}
      <LeadMagnet />

      {/* ─── Сравнение цен ──────────────────────────────────── */}
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-8">
        <div className="mb-6 text-center">
          <h2 className="font-serif text-3xl font-semibold">Стилист vs ATELIER</h2>
          <p className="mt-2 text-sm text-muted-foreground">Те же рекомендации — в 10 раз дешевле</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PRICE_COMPARE.map((item, i) => (
            <div key={i} className={`rounded-2xl border p-5 text-center ${item.accent ? "border-accent/40 bg-card shadow-sm" : "border-border/60 bg-card/50"}`}>
              <div className={`font-serif text-2xl font-semibold ${item.accent ? "text-accent" : "text-muted-foreground line-through"}`}>
                {item.price}
              </div>
              <div className="mt-2 text-sm text-foreground">{item.label}</div>
              {item.accent && i === 2 && (
                <div className="mt-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  Начните сейчас
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Отзывы ─────────────────────────────────────────── */}
      <div>
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Отзывы</span>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Что говорят пользователи</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <div key={i} className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              {/* Аватар + имя */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 font-serif text-sm font-semibold"
                  style={{ backgroundColor: review.color, color: "#3d2b1f" }}
                >
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{review.name}</div>
                  <div className="text-xs text-muted-foreground">{review.city} · {review.date}</div>
                </div>
              </div>
              {/* Звёзды */}
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground italic">"{review.text}"</p>
              <div className="mt-3 border-t border-border/60 pt-3">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{review.service}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Оставить отзыв ─────────────────────────────────── */}
      <div>
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Ваше мнение важно</span>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Прошли разбор? Поделитесь!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Каждый отзыв помогает другим решиться попробовать. Это занимает 1 минуту.
          </p>
        </div>
        <ReviewForm />
      </div>

      {/* ─── Финальный CTA ──────────────────────────────────── */}
      <div className="rounded-2xl bg-foreground px-5 py-8 text-center sm:px-8 sm:py-10">
        <h2 className="font-serif text-3xl font-semibold text-background">
          Готовы узнать свой стиль?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-background/70">
          Пройдите бесплатный разбор за 5 минут — и получите персональные рекомендации от AI.
        </p>
        <Button onClick={onStart} size="lg"
          className="mt-6 h-12 bg-background px-8 text-base text-foreground hover:bg-background/90">
          Начать бесплатный разбор
        </Button>
        <p className="mt-3 text-xs text-background/50">
          1 247 разборов за последние 30 дней · Бесплатно · ~5 минут
        </p>
      </div>

    </div>
  )
}
