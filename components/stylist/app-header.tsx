// components/stylist/app-header.tsx
// Этот файл НЕ трогать — содержит шапку с FAQ, О проекте, Профилем

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, UserCircle } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface AppHeaderProps {
  user: User | null
  loadingUser: boolean
  onLogoClick: () => void
  onLogin: () => void
  onLogout: () => void
}

export function AppHeader({ user, loadingUser, onLogoClick, onLogin, onLogout }: AppHeaderProps) {
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Профиль"

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">

        {/* Логотип */}
        <button
          onClick={onLogoClick}
          className="font-serif text-2xl tracking-widest hover:opacity-80 transition-opacity"
        >
          ATELIER
        </button>

        {/* Правая часть шапки */}
        <div className="flex items-center gap-3">

          {/* FAQ и О проекте — всегда видны на десктопе */}
          <Link
            href="/faq"
            className="hidden text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors sm:block"
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className="hidden text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors sm:block"
          >
            О проекте
          </Link>

          {/* Авторизация */}
          {!loadingUser && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Профиль — всегда ссылка на /profile */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition-colors hover:border-accent"
                  >
                    <UserCircle className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{userName}</span>
                  </Link>
                  <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5">
                    <LogOut className="h-3.5 w-3.5" />Выйти
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onLogin} className="gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />Войти
                  </Button>
                  <Button size="sm" onClick={onLogin}>
                    Регистрация
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
