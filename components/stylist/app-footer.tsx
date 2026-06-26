// components/stylist/app-footer.tsx
import Link from "next/link"

export function AppFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
        ATELIER · Персональный AI-стилист на базе Claude от Anthropic.
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/faq" className="text-accent hover:underline">FAQ</Link>
          <span>·</span>
          <Link href="/about" className="hover:text-foreground transition-colors">О проекте</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Конфиденциальность</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors">Условия</Link>
          <span>·</span>
          <a href="mailto:arseniyy.petrov.08@mail.ru" className="hover:text-foreground transition-colors">Поддержка</a>
          <span>·</span>
          <span>Возврат 24 часа</span>
        </div>
      </div>
    </footer>
  )
}
