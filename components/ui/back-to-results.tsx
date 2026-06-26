// components/ui/back-to-results.tsx
// Универсальная кнопка "Назад к результатам" для всех страниц услуг

"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function BackToResults() {
  return (
    <Link
      href="/?step=3"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      К результатам
    </Link>
  )
}
