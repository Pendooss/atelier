import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Условия использования — ATELIER",
  description: "Условия использования сервиса ATELIER",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />На главную
          </Link>
          <span className="font-serif text-xl tracking-wide">ATELIER</span>
          <div className="w-24" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Документы</span>
          <h1 className="mt-3 font-serif text-4xl font-semibold">Условия использования</h1>
          <p className="mt-2 text-sm text-muted-foreground">Последнее обновление: июнь 2025 года</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">1. Описание сервиса</h2>
            <p className="text-muted-foreground">ATELIER — это онлайн-сервис персонального стилистического анализа на основе искусственного интеллекта. Сервис предоставляет рекомендации по стилю одежды, цветотипу и гардеробу на основе загруженных фотографий и параметров пользователя.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">2. Рекомендательный характер</h2>
            <p className="text-muted-foreground">Все рекомендации ATELIER носят исключительно рекомендательный и информационный характер. Они не являются профессиональной консультацией стилиста. Окончательное решение о покупке одежды и формировании гардероба принимает пользователь самостоятельно.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">3. Платные услуги</h2>
            <p className="text-muted-foreground mb-3">Базовый разбор предоставляется бесплатно. Платные услуги оплачиваются через защищённую платёжную систему.</p>
            <p className="text-muted-foreground"><strong className="text-foreground">Гарантия возврата:</strong> если вы не удовлетворены результатом платной услуги, мы вернём деньги в течение 24 часов после покупки без дополнительных вопросов. Для возврата обратитесь на <a href="mailto:arseniyy.petrov.08@mail.ru" className="text-accent hover:underline">arseniyy.petrov.08@mail.ru</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">4. Правила использования</h2>
            <p className="text-muted-foreground mb-3">Пользователь обязуется:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Загружать только собственные фотографии или фото с согласия изображённых лиц</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Не использовать Сервис в противозаконных целях</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Не передавать данные своего аккаунта третьим лицам</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">5. Ограничение ответственности</h2>
            <p className="text-muted-foreground">ATELIER не несёт ответственности за решения, принятые на основе рекомендаций Сервиса. Точность рекомендаций зависит от качества предоставленных фотографий и корректности указанных параметров.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">6. Изменение условий</h2>
            <p className="text-muted-foreground">Мы оставляем за собой право изменять настоящие условия. Об изменениях уведомляем по email. Продолжение использования Сервиса после уведомления означает согласие с новыми условиями.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">7. Контакты</h2>
            <p className="text-muted-foreground">По любым вопросам: <a href="mailto:arseniyy.petrov.08@mail.ru" className="text-accent hover:underline">arseniyy.petrov.08@mail.ru</a></p>
            <p className="mt-2 text-muted-foreground">Петров Арсений, г. Кострома, Россия</p>
          </section>

        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/privacy" className="text-sm text-accent hover:underline">Политика конфиденциальности</Link>
          <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">Частые вопросы</Link>
        </div>
      </div>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-muted-foreground">
          ATELIER · Персональный AI-стилист
        </div>
      </footer>
    </main>
  )
}
