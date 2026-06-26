"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  bodyTypes,
  faceShapes,
  hairColors,
  skinTones,
  type Gender,
  type StylistForm,
} from "@/lib/stylist-data"
import { Check, Mars, Venus, ChevronRight } from "lucide-react"
import { PhotoUpload } from "./photo-upload"

// ─── Прогресс внутри шага ────────────────────────────────
function SubProgress({ current }: { current: 1 | 2 }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
          current === 1 ? "bg-accent text-accent-foreground" : "bg-accent/20 text-accent"
        )}>1</div>
        <span className={cn("text-sm", current === 1 ? "font-medium text-foreground" : "text-muted-foreground")}>
          Фото и основное
        </span>
      </div>
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
          current === 2 ? "bg-accent text-accent-foreground" : "bg-border text-muted-foreground"
        )}>2</div>
        <span className={cn("text-sm", current === 2 ? "font-medium text-foreground" : "text-muted-foreground")}>
          Внешность
        </span>
      </div>
    </div>
  )
}

function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card/90 p-6 shadow-sm">
      <h2 className="font-serif text-xl text-foreground">{title}</h2>
      {description && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Field({ label, value, onChange, placeholder, suffix }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; suffix: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 flex items-center rounded-lg border border-input bg-card/70 shadow-inner focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
        <input inputMode="numeric" value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none" />
        <span className="px-3 text-sm text-muted-foreground">{suffix}</span>
      </div>
    </label>
  )
}

export function DataStep({ form, setForm, onBack, onAnalyze }: {
  form: StylistForm
  setForm: (updater: (f: StylistForm) => StylistForm) => void
  onBack: () => void
  onAnalyze: () => void
}) {
  const [subStep, setSubStep] = useState<1 | 2>(1)
  const set = <K extends keyof StylistForm>(key: K, val: StylistForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  // Подшаг 1 готов когда заполнены фото, пол, параметры
  const step1Done = !!(form.photo && form.gender && form.age && form.height && form.weight)

  // Всё готово для анализа
  const canSubmit = step1Done && !!(form.bodyType && form.skinTone && form.hairColor)

  function handleNext() {
    if (subStep === 1 && step1Done) setSubStep(2)
  }

  function handleBack() {
    if (subStep === 2) setSubStep(1)
    else onBack()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl">Расскажите о себе</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Чем точнее данные — тем точнее разбор.
        </p>
      </div>

      <SubProgress current={subStep} />

      {/* ─── Подшаг 1: Фото + пол + параметры ─── */}
      {subStep === 1 && (
        <div className="grid gap-5">
          <Section title="Фото в полный рост"
            description="Встаньте прямо при дневном свете — так AI лучше считает пропорции фигуры.">
            <PhotoUpload
              value={form.photo}
              onChange={(v) => set("photo", v)}
              title="Загрузите фото в полный рост"
              hint="JPG или PNG, видно силуэт целиком"
              compliment="Прекрасный кадр! У вас отличная осанка и гармоничные пропорции."
            />
          </Section>

          <Section title="Пол">
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: "female", label: "Женский", Icon: Venus },
                { id: "male", label: "Мужской", Icon: Mars },
              ] as { id: Gender; label: string; Icon: typeof Venus }[]).map(({ id, label, Icon }) => (
                <button key={id} type="button" onClick={() => set("gender", id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-5 transition-colors",
                    form.gender === id
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border/80 bg-card/70 hover:border-accent/70 hover:bg-secondary/40",
                  )}>
                  <Icon className={cn("h-8 w-8", form.gender === id ? "text-accent" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Параметры">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Возраст" value={form.age} onChange={(v) => set("age", v)} placeholder="28" suffix="лет" />
              <Field label="Рост" value={form.height} onChange={(v) => set("height", v)} placeholder="170" suffix="см" />
              <Field label="Вес" value={form.weight} onChange={(v) => set("weight", v)} placeholder="65" suffix="кг" />
            </div>
          </Section>
        </div>
      )}

      {/* ─── Подшаг 2: Внешность ─── */}
      {subStep === 2 && (
        <div className="grid gap-5">
          <Section title="Тип телосложения"
            description="Выберите вариант, наиболее близкий к вашему — AI уточнит его по фото.">
            <div className="grid gap-3 sm:grid-cols-2">
              {bodyTypes.map((b) => (
                <button key={b.id} type="button" onClick={() => set("bodyType", b.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors",
                    form.bodyType === b.id
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border/80 bg-card/70 hover:border-accent/70 hover:bg-secondary/40",
                  )}>
                  <span>
                    <span className="block text-sm font-medium">{b.label}</span>
                    <span className="block text-xs text-muted-foreground">{b.description}</span>
                  </span>
                  {form.bodyType === b.id && <Check className="h-4 w-4 shrink-0 text-accent" />}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Цвет кожи" description="Выберите оттенок, ближайший к вашему естественному тону.">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {skinTones.map((s) => (
                <button key={s.id} type="button" onClick={() => set("skinTone", s.id)}
                  className="group flex flex-col items-center gap-2">
                  <span className={cn(
                    "aspect-square w-full rounded-xl border-2 transition-transform group-hover:scale-105",
                    form.skinTone === s.id ? "border-accent ring-2 ring-accent/30" : "border-border",
                  )} style={{ backgroundColor: s.color }} />
                  <span className="text-center text-[11px] leading-tight text-muted-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Цвет волос" description="Натуральный или текущий — как вам ближе.">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
              {hairColors.map((h) => (
                <button key={h.id} type="button" onClick={() => set("hairColor", h.id)}
                  className="group flex flex-col items-center gap-2">
                  <span className={cn(
                    "aspect-square w-full rounded-xl border-2 transition-transform group-hover:scale-105",
                    form.hairColor === h.id ? "border-accent ring-2 ring-accent/30" : "border-border",
                  )} style={{ backgroundColor: h.color }} />
                  <span className="text-center text-[11px] leading-tight text-muted-foreground">{h.label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Форма лица (необязательно)"
            description="Уточните форму лица — это улучшит рекомендации по очкам.">
            <PhotoUpload
              value={form.facePhoto}
              onChange={(v) => set("facePhoto", v)}
              title="Портрет анфас (необязательно)"
              hint="Лицо в кадре полностью, волосы убраны со лба"
              compliment="Отличный портрет! Черты лица выразительные — это даёт большую свободу в выборе оправ."
            />
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {faceShapes.map((f) => (
                <button key={f.id} type="button" onClick={() => set("faceShape", f.id)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    form.faceShape === f.id
                      ? "border-accent bg-accent/10 shadow-sm text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-accent",
                  )}>
                  {f.label}
                </button>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* ─── Кнопки навигации ─── */}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleBack}>
          Назад
        </Button>

        {subStep === 1 ? (
          <div className="flex flex-col items-end gap-2">
            {!step1Done && (
              <p className="text-xs text-muted-foreground text-right">
                {!form.photo ? "📷 Загрузите фото" :
                 !form.gender ? "⚧ Выберите пол" :
                 !form.age ? "Укажите возраст" :
                 !form.height ? "Укажите рост" :
                 !form.weight ? "Укажите вес" : ""}
              </p>
            )}
            <Button onClick={handleNext} disabled={!step1Done} size="lg" className="gap-2 px-8">
              Далее <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {!canSubmit && (
              <p className="text-xs text-muted-foreground text-right">
                {!form.bodyType ? "Выберите тип телосложения" :
                 !form.skinTone ? "Выберите цвет кожи" :
                 !form.hairColor ? "Выберите цвет волос" : ""}
              </p>
            )}
            <Button onClick={onAnalyze} disabled={!canSubmit} size="lg" className="px-8">
              Анализировать
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
