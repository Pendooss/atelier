import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Политика конфиденциальности — ATELIER",
  description: "Политика конфиденциальности сервиса ATELIER",
}

export default function PrivacyPage() {
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
          <h1 className="mt-3 font-serif text-4xl font-semibold">Политика конфиденциальности</h1>
          <p className="mt-2 text-sm text-muted-foreground">Последнее обновление: июнь 2025 года</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">1. Общие положения</h2>
            <p className="text-muted-foreground">Настоящая политика конфиденциальности определяет порядок обработки персональных данных пользователей сервиса ATELIER (далее — Сервис), доступного по адресу atelier-ai.ru. Использование Сервиса означает безоговорочное согласие с настоящей политикой.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">2. Какие данные мы собираем</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span><span><strong className="text-foreground">Email-адрес</strong> — при регистрации или подписке на рассылку. Используется для отправки результатов разбора и советов по стилю.</span></li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span><span><strong className="text-foreground">Параметры тела</strong> — рост, вес, тип фигуры, цвет кожи и волос. Используются исключительно для генерации стилистических рекомендаций.</span></li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span><span><strong className="text-foreground">Фотографии</strong> — загружаемые вами фото обрабатываются в момент анализа и <strong>не сохраняются</strong> на наших серверах.</span></li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span><span><strong className="text-foreground">История разборов</strong> — результаты анализа сохраняются в вашем личном кабинете для повторного доступа.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">3. Как мы используем данные</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Генерация персональных стилистических рекомендаций</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Отправка запрошенных советов по стилю на email</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Хранение истории разборов в личном кабинете</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Улучшение качества Сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">4. Передача данных третьим лицам</h2>
            <p className="text-muted-foreground mb-3">Мы не продаём и не передаём ваши данные рекламодателям. Данные могут передаваться только следующим сервисам для обеспечения работы Сервиса:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span><strong className="text-foreground">Supabase</strong> — хранение данных аккаунта (email, история разборов)</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span><strong className="text-foreground">Anthropic Claude AI</strong> — анализ параметров для генерации рекомендаций</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span><strong className="text-foreground">Resend</strong> — отправка email-сообщений</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">5. Защита данных</h2>
            <p className="text-muted-foreground">Все данные передаются по защищённому протоколу HTTPS. Пароли хранятся в зашифрованном виде. Фотографии не сохраняются после анализа. Мы используем современные стандарты безопасности для защиты ваших данных.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">6. Ваши права</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Запросить удаление вашего аккаунта и всех данных</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Отписаться от email-рассылки в один клик</li>
              <li className="flex gap-2"><span className="text-accent mt-0.5">·</span>Получить копию ваших данных</li>
            </ul>
            <p className="mt-3 text-muted-foreground">Для реализации прав обратитесь: <a href="mailto:arseniyy.petrov.08@mail.ru" className="text-accent hover:underline">arseniyy.petrov.08@mail.ru</a></p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">7. Файлы cookie</h2>
            <p className="text-muted-foreground">Сервис использует только технические cookie, необходимые для авторизации. Мы не используем рекламные или аналитические cookie без вашего согласия.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold mb-3">8. Контакты</h2>
            <p className="text-muted-foreground">По вопросам конфиденциальности: <a href="mailto:arseniyy.petrov.08@mail.ru" className="text-accent hover:underline">arseniyy.petrov.08@mail.ru</a></p>
            <p className="mt-2 text-muted-foreground">Ответственный: Петров Арсений, г. Кострома</p>
          </section>

        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/terms" className="text-sm text-accent hover:underline">Условия использования</Link>
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
