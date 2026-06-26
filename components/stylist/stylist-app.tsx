// components/stylist/stylist-app.tsx
// ВАЖНО: При любых изменениях НЕ убирать:
// 1. Чтение ?step=3 в useEffect
// 2. handleAnalysisDone с buildRecommendation + saveStyleResult
// 3. AppHeader и AppFooter компоненты

"use client"

import { useState, useEffect, useRef } from "react"
import { emptyForm, buildRecommendation, type StylistForm } from "@/lib/stylist-data"
import { StepProgress } from "./step-progress"
import { WelcomeStep } from "./welcome-step"
import { DataStep } from "./data-step"
import { AnalyzingStep } from "./analyzing-step"
import { ResultStep } from "./result-step"
import { Button } from "@/components/ui/button"
import { supabase, saveStyleResult } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { X } from "lucide-react"
import { AppHeader } from "./app-header"
import { AppFooter } from "./app-footer"

type Step = 0 | 1 | 2 | 3

function AuthModal({ onClose, onSuccess }: {
  onClose: () => void
  onSuccess: (user: User) => void
}) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  async function handleSubmit() {
    setError("")
    setLoading(true)
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { name } },
        })
        if (error) throw error
        if (data.user) {
          fetch("/api/welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
          }).catch(() => {})
          onSuccess(data.user)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) onSuccess(data.user)
      }
    } catch (e: any) {
      setError(e.message || "Ошибка авторизации")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      style={{ backgroundColor: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-serif text-2xl">
          {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Войдите, чтобы сохранять разборы." : "Зарегистрируйтесь бесплатно."}
        </p>
        <div className="mt-4 flex overflow-hidden rounded-lg border border-border">
          <button onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-accent text-accent-foreground" : "bg-transparent text-muted-foreground hover:bg-secondary"}`}>
            Войти
          </button>
          <button onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-accent text-accent-foreground" : "bg-transparent text-muted-foreground hover:bg-secondary"}`}>
            Регистрация
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {mode === "register" && (
            <div>
              <label className="text-sm font-medium">Имя</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mail@example.com"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm font-medium">Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Отмена</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function StylistApp() {
  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<StylistForm>(emptyForm)
  const [user, setUser] = useState<User | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [animating, setAnimating] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // ─── КРИТИЧНО: читаем ?step=3 и восстанавливаем результат ───
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("step") === "3") {
        const savedForm = localStorage.getItem("atelier_form")
        const savedResult = localStorage.getItem("atelier_result")
        if (savedForm && savedResult) {
          setForm(JSON.parse(savedForm))
          setStep(3)
          window.history.replaceState({}, "", "/")
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoadingUser(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function goTo(next: Step) {
    if (animating) return
    setAnimating(true)
    if (contentRef.current) {
      contentRef.current.style.opacity = "0"
      contentRef.current.style.transform = "translateY(-12px)"
    }
    setTimeout(() => {
      setStep(next)
      window.scrollTo({ top: 0, behavior: "smooth" })
      if (contentRef.current) {
        contentRef.current.style.transition = "none"
        contentRef.current.style.opacity = "0"
        contentRef.current.style.transform = "translateY(16px)"
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (contentRef.current) {
            contentRef.current.style.transition = "opacity 0.35s ease, transform 0.35s ease"
            contentRef.current.style.opacity = "1"
            contentRef.current.style.transform = "translateY(0)"
          }
          setAnimating(false)
        })
      })
    }, 280)
  }

  // ─── КРИТИЧНО: сохраняем форму + результат при завершении анализа ───
  async function handleAnalysisDone() {
    localStorage.setItem("atelier_form", JSON.stringify(form))
    const result = buildRecommendation(form)
    localStorage.setItem("atelier_result", JSON.stringify(result))
    if (user) {
      try { await saveStyleResult(user.id, result) } catch {}
    }
    goTo(3)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(u) => { setUser(u); setShowAuth(false) }}
        />
      )}

      {/* Шапка — отдельный компонент, не трогать */}
      <AppHeader
        user={user}
        loadingUser={loadingUser}
        onLogoClick={() => goTo(0)}
        onLogin={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="mb-10">
          <StepProgress current={step} />
        </div>
        <div
          ref={contentRef}
          style={{ opacity: 1, transform: "translateY(0)", transition: "opacity 0.35s ease, transform 0.35s ease" }}
        >
          {step === 0 && <WelcomeStep onStart={() => goTo(1)} />}
          {step === 1 && (
            <DataStep form={form} setForm={setForm} onBack={() => goTo(0)} onAnalyze={() => goTo(2)} />
          )}
          {step === 2 && <AnalyzingStep onDone={handleAnalysisDone} />}
          {step === 3 && (
            <ResultStep
              form={form}
              user={user}
              onAuthRequired={() => setShowAuth(true)}
              onRestart={() => {
                setForm(emptyForm)
                localStorage.removeItem("atelier_form")
                localStorage.removeItem("atelier_result")
                goTo(0)
              }}
            />
          )}
        </div>
      </div>

      {/* Футер — отдельный компонент, не трогать */}
      <AppFooter />
    </main>
  )
}
