import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Частые вопросы — ATELIER",
  description: "Ответы на частые вопросы о AI-стилисте ATELIER",
}

const FAQ_SECTIONS = [
  {
    title: "О сервисе",
    questions: [
      {
        q: "Что такое ATELIER?",
        a: "ATELIER — это персональный AI-стилист, который анализирует ваши фотографии и даёт конкретные рекомендации по стилю. Мы определяем ваш цветотип, тип фигуры и форму лица, после чего подбираем палитру цветов, фасоны одежды, очки и обувь — всё персонально под вас.",
      },
      {
        q: "Кто стоит за ATELIER?",
        a: "ATELIER — независимый проект, созданный с использованием Claude AI от Anthropic — одной из ведущих AI-компаний мира. Мы не аффилированы с модными домами или магазинами, поэтому даём честные рекомендации без скрытой рекламы.",
      },
      {
        q: "Чем ATELIER отличается от обычного стилиста?",
        a: "Консультация живого стилиста стоит от 5 000 до 30 000 рублей и занимает несколько часов. ATELIER делает то же самое за 5 минут и стоит от 0 ₽. При этом AI не устаёт, не субъективен и не продвигает конкретные бренды ради комиссии.",
      },
      {
        q: "Насколько точны рекомендации?",
        a: "Точность зависит от качества фотографий. При хорошем освещении и чётком снимке AI правильно определяет тип фигуры и цветотип в 85-90% случаев. Рекомендации основаны на классических системах — теории цветотипов и науке о пропорциях тела.",
      },
    ],
  },
  {
    title: "Конфиденциальность и безопасность",
    questions: [
      {
        q: "Мои фотографии сохраняются?",
        a: "Нет. Ваши фотографии обрабатываются только в момент анализа и не сохраняются на наших серверах. Мы не используем ваши фото для обучения AI и не передаём их третьим лицам. После закрытия браузера все данные удаляются.",
      },
      {
        q: "Мои личные данные в безопасности?",
        a: "Да. Мы используем Supabase — сертифицированную платформу с шифрованием данных. Мы храним только email и историю покупок — ничего лишнего. Мы никогда не продаём данные пользователей рекламодателям.",
      },
      {
        q: "Нужно ли загружать фото для разбора?",
        a: "Фото в полный рост обязательно — без него невозможно определить тип фигуры. Портрет лица необязателен, но повышает точность анализа формы лица и рекомендаций по очкам.",
      },
    ],
  },
  {
    title: "Платные услуги",
    questions: [
      {
        q: "Что входит в бесплатный разбор?",
        a: "Бесплатно вы получаете: определение типа фигуры и цветотипа, цветовую палитру из 5 оттенков, рекомендации по фасонам одежды, подбор очков по форме лица, рекомендации по обуви и ремню. Это уже полноценный стилистический разбор.",
      },
      {
        q: "Зачем покупать платные услуги если есть бесплатный разбор?",
        a: "Бесплатный разбор даёт понимание вашего стиля. Платные услуги переводят это в конкретные действия: реальные вещи из магазинов с ценами и ссылками, готовые образы с фотографиями на каждый повод, AI-стилист который отвечает на любые вопросы 24/7.",
      },
      {
        q: "Можно ли вернуть деньги?",
        a: "Да. Если вы недовольны результатом в течение 24 часов после покупки — напишите нам и мы вернём деньги без лишних вопросов. Для этого свяжитесь с поддержкой через форму на сайте.",
      },
      {
        q: "Как долго доступны купленные услуги?",
        a: "Разовые услуги (Визуальный гардероб, Магазины, Бренды, Готовые образы) доступны бессрочно в вашем личном кабинете. Подписки (Мой гардероб, AI-стилист в чате) действуют ежемесячно и автоматически продлеваются.",
      },
      {
        q: "Что такое AI-стилист в чате?",
        a: "Это живой диалог с Claude AI, который знает ваш персональный профиль — цветотип, тип фигуры, рекомендации. Вы можете спросить что угодно: что надеть на конкретное мероприятие, как сочетать вещи из шкафа, какие тренды подходят именно вам.",
      },
    ],
  },
  {
    title: "Технические вопросы",
    questions: [
      {
        q: "На каких устройствах работает ATELIER?",
        a: "ATELIER работает в браузере на любом устройстве — компьютер, планшет, смартфон. Специальное приложение скачивать не нужно. Рекомендуем использовать Chrome, Safari или Firefox последних версий.",
      },
      {
        q: "Какие фото лучше всего загружать?",
        a: "Для лучшего результата: фото в полный рост при дневном освещении, нейтральный фон, одежда без крупных принтов, прямая осанка. Для портрета: анфас, волосы убраны со лба, нейтральное выражение лица.",
      },
      {
        q: "Почему AI-функции платных услуг не работают локально?",
        a: "Прямые запросы к AI-сервисам блокируются браузером из соображений безопасности (CORS). После деплоя сайта на сервер все AI-функции работают полноценно через защищённые серверные роуты.",
      },
    ],
  },
]

const SUPPORT_EMAIL = "arseniyy.petrov.08@mail.ru"

export default function FAQPage() {
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

      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* Заголовок */}
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">Поддержка</span>
          <h1 className="mt-3 font-serif text-4xl font-semibold">Частые вопросы</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Собрали ответы на самые популярные вопросы. Не нашли ответ?
            Напишите нам — ответим в течение часа.
          </p>
        </div>

        {/* Секции с вопросами */}
        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-foreground">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.questions.map((item) => (
                  <details key={item.q}
                    className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:border-accent/40">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-sm font-medium text-foreground marker:hidden list-none">
                      <span>{item.q}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-border/60 bg-secondary/20 px-5 py-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Контакт */}
        <div className="mt-12 rounded-2xl border border-accent/20 bg-accent/5 p-8 text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Остались вопросы?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Напишите нам — обычно отвечаем в течение часа в рабочее время.
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90">
            Написать в поддержку
          </a>
        </div>

      </div>

      {/* Футер */}
      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-muted-foreground">
          ATELIER · Персональный AI-стилист
        </div>
      </footer>
    </main>
  )
}
