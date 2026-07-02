import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { YandexMetrika } from '@/components/yandex-metrika'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'ATELIER — персональный AI-стилист',
  description: 'Загрузите фото и получите персональный разбор: цветотип, палитра, фасоны, образы. Бесплатно за 5 минут.',
  generator: 'ATELIER',
  keywords: ['AI стилист', 'цветотип', 'разбор стиля', 'персональный стилист', 'гардероб'],
  authors: [{ name: 'Арсений Петров', url: 'https://atelier-ai.ru' }],
  openGraph: {
    title: 'ATELIER — персональный AI-стилист',
    description: 'Узнайте свой цветотип и получите персональные рекомендации по стилю. Бесплатно за 5 минут.',
    url: 'https://atelier-ai.ru',
    siteName: 'ATELIER',
    images: [
      {
        url: 'https://atelier-ai.ru/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ATELIER — персональный AI-стилист',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ATELIER — персональный AI-стилист',
    description: 'Узнайте свой цветотип бесплатно за 5 минут.',
    images: ['https://atelier-ai.ru/images/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#fbf7ef',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${jost.variable} light bg-background`}
    >
      <body className="font-sans antialiased">
        <YandexMetrika />
        {children}
      </body>
    </html>
  )
}
