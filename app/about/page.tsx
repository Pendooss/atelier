import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "О проекте — ATELIER",
  description: "История создания ATELIER — персонального AI-стилиста",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />На главную
          </Link>
          <span className="font-serif text-xl tracking-wide">ATELIER</span>
          <div className="w-24" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-16">

        {/* Заголовок */}
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">О проекте</span>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight">
            Почему я создал ATELIER
          </h1>
        </div>

        {/* Основной текст */}
        <div className="space-y-6 text-base leading-relaxed text-foreground">
          <p>
            Меня зовут <strong>Арсений</strong>, я из Костромы. Я не стилист и не модельер — я разработчик, который однажды устал тратить деньги на вещи которые потом не носил.
          </p>

          <p>
            Проблема была простой: я не понимал что мне идёт. Покупал вещи которые нравились в магазине, приносил домой — и они почему-то не сочетались ни с чем. Консультация стилиста стоила от 5 000 рублей, и это казалось слишком дорого для того чтобы просто узнать какой у меня цветотип.
          </p>

          <p>
            Тогда я решил создать ATELIER — персонального AI-стилиста, который делает то же самое что живой стилист, но доступно для каждого. Сервис создан с помощью <strong>Claude AI от Anthropic</strong> — одной из самых мощных языковых моделей в мире.
          </p>

          <p>
            Я строю ATELIER в одиночку, постепенно добавляя новые функции. Здесь нет инвесторов, маркетинговых бюджетов и команды из 50 человек. Есть только желание сделать качественный продукт который реально помогает людям одеваться увереннее.
          </p>

          <p className="text-muted-foreground">
            Если у вас есть вопросы, идеи или просто хотите написать — я всегда на связи.
          </p>
        </div>

        {/* Контакт */}
        <div className="mt-10 flex items-center gap-4">
          <a
            href="mailto:support@atelier-ai.ru"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Написать Арсению
          </a>
          <Link
            href="/faq"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            Частые вопросы
          </Link>
        </div>

        {/* Подпись */}
        <div className="mt-16 border-t border-border/60 pt-8">
          <p className="font-serif text-2xl text-muted-foreground/40 italic">
            — Арсений, Кострома
          </p>
        </div>

      </div>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-2xl px-4 py-6 text-center text-xs text-muted-foreground">
          ATELIER · Персональный AI-стилист
        </div>
      </footer>
    </main>
  )
}
