"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ShoppingBag, Sparkles, User, LogOut, Clock, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Purchase {
  id: string
  service_id: string
  service_name: string
  price: string
  purchased_at: string
}

interface StyleResult {
  id: string
  result: any
  created_at: string
}

const SERVICE_ICONS: Record<string, string> = {
  visual: "🖼️",
  shops: "🛍️",
  brands: "👔",
  outfits: "✨",
  wardrobe: "👗",
  chat: "💬",
  mycloset: "🤖",
}

const SERVICE_HREFS: Record<string, string> = {
  visual: "/results/wardrobe",
  shops: "/results/shops",
  brands: "/results/brands",
  outfits: "/results/outfits",
  wardrobe: "/results/wardrobe-personal",
  chat: "/results/chat",
  mycloset: "/results/my-closet",
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [styleResults, setStyleResults] = useState<StyleResult[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeTab, setActiveTab] = useState<"purchases" | "history">("purchases")

  async function loadProfile(currentUser: SupabaseUser, cancelledRef: { current: boolean }) {
    setUser(currentUser)
    setLoadError(false)

    try {
      // ВАЖНО: оборачиваем запросы в try/catch — раньше, если запрос
      // зависал или падал с ошибкой, страница крутила спиннер вечно,
      // потому что setLoading(false) просто никогда не вызывался.
      const [purchasesRes, resultsRes] = await Promise.all([
        supabase
          .from("purchases")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("purchased_at", { ascending: false }),
        supabase
          .from("style_results")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false }),
      ])

      if (cancelledRef.current) return

      if (purchasesRes.error) throw purchasesRes.error
      if (resultsRes.error) throw resultsRes.error

      setPurchases(purchasesRes.data || [])
      setStyleResults(resultsRes.data || [])
    } catch (e) {
      console.error("Profile load error:", e)
      if (!cancelledRef.current) setLoadError(true)
    } finally {
      if (!cancelledRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    const cancelledRef = { current: false }

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await loadProfile(session.user, cancelledRef)
          return
        }

        // Сессия не найдена сразу — частая ситуация на мобильных сразу после
        // регистрации/входа, когда токен ещё не успел синхронизироваться.
        // Пробуем обновить сессию прежде чем редиректить на главную.
        const { data } = await supabase.auth.refreshSession()
        if (data.session?.user) {
          await loadProfile(data.session.user, cancelledRef)
          return
        }

        if (!cancelledRef.current) router.push("/")
      } catch (e) {
        console.error("Profile init error:", e)
        if (!cancelledRef.current) {
          setLoadError(true)
          setLoading(false)
        }
      }
    }

    init()

    // Страховка: если сессия появится с задержкой (мобильные браузеры),
    // подхватываем её через подписку на изменения, а не редиректим раньше времени.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !user) {
        loadProfile(session.user, cancelledRef)
      }
    })

    return () => {
      cancelledRef.current = true
      subscription.unsubscribe()
    }
  }, [router])

  function handleRetry() {
    setLoading(true)
    setLoadError(false)
    const cancelledRef = { current: false }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user, cancelledRef)
      } else {
        router.push("/")
      }
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function loadResult(result: any) {
    localStorage.setItem("atelier_result", JSON.stringify(result))
    router.push("/?step=3")
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )

  // ─── Ошибка загрузки — вместо вечного спиннера показываем понятное сообщение ───
  if (loadError) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-serif text-2xl">Не удалось загрузить профиль</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Проверьте соединение с интернетом и попробуйте ещё раз.
        </p>
        <button
          onClick={handleRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />Повторить
        </button>
      </div>
    </div>
  )

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Профиль"

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />На главную
          </Link>
          <span className="font-serif text-xl tracking-wide">ATELIER</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" />Выйти
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">

        {/* Профиль */}
        <div className="mb-8 flex items-center gap-5 rounded-2xl border border-border/80 bg-card/95 p-6 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-serif font-semibold text-accent border border-accent/20">
            {userName[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-semibold text-foreground">{userName}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Зарегистрирован {user?.created_at ? formatDate(user.created_at) : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-serif font-semibold text-foreground">{purchases.length}</div>
            <div className="text-xs text-muted-foreground">покупок</div>
          </div>
        </div>

        {/* Табы */}
        <div className="mb-6 flex overflow-hidden rounded-xl border border-border">
          <button onClick={() => setActiveTab("purchases")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === "purchases" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>
            <ShoppingBag className="h-4 w-4" />Мои покупки ({purchases.length})
          </button>
          <button onClick={() => setActiveTab("history")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === "history" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}>
            <Clock className="h-4 w-4" />История разборов ({styleResults.length})
          </button>
        </div>

        {/* Покупки */}
        {activeTab === "purchases" && (
          <div>
            {purchases.length === 0 ? (
              <div className="rounded-2xl border border-border/80 bg-card/95 p-10 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 font-serif text-xl text-foreground">Покупок пока нет</p>
                <p className="mt-2 text-sm text-muted-foreground">Откройте платные услуги после разбора</p>
                <Link href="/"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors">
                  <Sparkles className="h-4 w-4" />Пройти разбор
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {purchases.map((purchase) => (
                  <div key={purchase.id}
                    className="flex items-center gap-4 rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm transition-all hover:border-accent/40">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                      {SERVICE_ICONS[purchase.service_id] || "🎁"}
                    </div>
                    <div className="flex-1">
                      <div className="font-serif text-lg font-semibold text-foreground">{purchase.service_name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{formatDate(purchase.purchased_at)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-lg font-semibold text-foreground">{purchase.price}</span>
                      {SERVICE_HREFS[purchase.service_id] && (
                        <Link href={SERVICE_HREFS[purchase.service_id]}
                          className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
                          Открыть
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* История разборов */}
        {activeTab === "history" && (
          <div>
            {styleResults.length === 0 ? (
              <div className="rounded-2xl border border-border/80 bg-card/95 p-10 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 font-serif text-xl text-foreground">Разборов пока нет</p>
                <p className="mt-2 text-sm text-muted-foreground">Пройдите первый AI-разбор стиля</p>
                <Link href="/"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors">
                  <Sparkles className="h-4 w-4" />Начать разбор
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {styleResults.map((sr, i) => (
                  <div key={sr.id}
                    className="overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-sm transition-all hover:border-accent/40">
                    <div className="flex items-center gap-4 p-5">
                      {/* Палитра */}
                      <div className="flex gap-1 shrink-0">
                        {sr.result?.palette?.slice(0, 5).map((c: any, j: number) => (
                          <div key={j} className="h-8 w-8 rounded-lg border border-border/50"
                            style={{ backgroundColor: c.hex }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-lg font-semibold text-foreground truncate">
                          {sr.result?.typeTitle || "Разбор стиля"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{sr.result?.colorType}</span>
                          <span>·</span>
                          <span>{formatDate(sr.created_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => loadResult(sr.result)}
                        className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
                        Загрузить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
