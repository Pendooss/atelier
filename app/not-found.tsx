// app/not-found.tsx
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Декоративный элемент */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-border/60 bg-card shadow-sm">
          <span className="font-serif text-4xl text-accent">A</span>
        </div>

        {/* Палитра */}
        <div className="mb-8 flex justify-center gap-2">
          {["#c4b5d4", "#e8c4b8", "#8fa8bc", "#f4ede4", "#c9908a"].map((hex, i) => (
            <div key={i} className="h-3 w-12 rounded-full" style={{ backgroundColor: hex }} />
          ))}
        </div>

        <p className="mb-2 font-serif text-6xl font-semibold text-foreground">404</p>
        <h1 className="mb-3 font-serif text-2xl text-foreground">Страница не найдена</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Кажется, эта страница сменила образ и переехала.<br />
          Вернитесь на главную и пройдите бесплатный разбор стиля.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-2xl bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            На главную
          </Link>
          <Link
            href="/faq"
            className="rounded-2xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
          >
            Частые вопросы
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          ATELIER · Персональный AI-стилист
        </p>
      </div>
    </main>
  )
}
